/*
 * model-tree gets a path to an input file and computes the tree from this data
 *
 */


namespace ivis.model {
  declare type WeightFunction = (node: TreeNode) => void;

  //============================================================================
  class MissingFieldError extends Error {
    fieldname: string;

    constructor(field: string) {
      super(field);
      this.fieldname = field;
    }
  }

  //============================================================================
  class InputFile {
    static json : string = 'JSON';
    static treeML : string = 'TREEML';
    static skos : string = 'SKOS';

    static determineFileType(data: string) : string {
      try {
        JSON.parse(data);
        return this.json;
      } catch (e) {
        if (data.indexOf("CCSXML") !== -1) {
          return this.skos;
        }
        return this.treeML;
      }
    }
  }

  //============================================================================
  class InputJSON {
    static jsonToTree(data : string) : TreeNode[] {
      let parsedJson = JSON.parse(data);
      try {
        return this.createNodes(parsedJson);
      } catch (e) {
        console.log("Invalid data file.");
        console.log(e);
      }
    }

    static createNodes(json: Object[]) : TreeNode[] {
      let tree : TreeNode[] = [];
      json.forEach((obj: TreeNode) => {
        let node : TreeNode = new TreeNode().deserialize(obj);
        tree.push(node);
      });

      return tree;
    }
  }

  //============================================================================
  class InputTreeML{
    static treemlToTree(data: string, callback) {
      xml2jsBundle.parseString(data, (err, result) => {
        if (err !== null) {
          console.log("Invalid data file");
          return null;
        }

        let rootNode = result['tree']['branch']['0'];
        let json: Object[] = [];
        json.push(this.toJSON(rootNode));
        let tree: TreeNode[] = InputJSON.createNodes(json);
        Tree.setTree(tree);
        callback(tree[0]);
      })
    }

    private static toJSON(inputNode: Object) : Object {
      let resultNode = {
        id: '',
        name: '',
        children: []
      };

      //id, name
      let attributes = inputNode['attribute'];
      for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        let attributeName = attribute['$']['name'];
        let attributeValue = attribute['$']['value'];
        if (attributeName === 'id') {
          resultNode.id = attributeValue;
        } else if (attributeName === 'name') {
          resultNode.name = attributeValue;
        }
      }
      if (resultNode.id === '')
        resultNode.id = resultNode.name;

      //children
      if (inputNode.hasOwnProperty('branch')) {
        let branches = inputNode['branch'];
        for (let i = 0; i < branches.length; i++) {
          resultNode.children.push(this.toJSON(branches[i]));
        }
      }
      if (inputNode.hasOwnProperty('leaf')) {
        let leaves = inputNode['leaf'];
        for (let i = 0; i < leaves.length; i++) {
          resultNode.children.push(this.toJSON(leaves[i]));
        }
      }

      return resultNode;
    }
  }

  //============================================================================
  class InputSkos {
    static skosToTree(data: string, callback) {
      let xml = this.extractXML(data);
      xml2jsBundle.parseString(xml, (err, result) => {
        if (err !== null) {
          console.log("Invalid data file", err);
          return null;
        }
        let rootNode = this.getFirstValidNode(result);
        let json : Object[] = [];
        json.push(this.toJSON(rootNode));
        let tree = InputJSON.createNodes(json);
        Tree.setTree(tree);
        callback(tree[0]);
      })
    }

    private static extractXML(input: string) : Object {
      let withoutBegin: string = input.split("\\begin{CCSXML}")[1];
      let withoutEnd: string = withoutBegin.split("\\end{CCSXML}")[0];
      return withoutEnd;
    }

    //returns the first node with children
    private static getFirstValidNode(input: Object) : Object {
      let keys = Object.keys(input);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'concept') {
          return input;
        }

        let deepConceptNode = this.getFirstValidNode(input[keys[i]]);
        if (deepConceptNode != null) {
          if (!deepConceptNode.hasOwnProperty('concept_id')) {
            deepConceptNode['id'] = keys[i];
          }
          return deepConceptNode;
        }
      }

      return null;
    }

    private static toJSON(inputNode: Object) : Object {
      let resultNode = {
        id: '',
        name: '',
        children: []
      };

      //id
      if (inputNode.hasOwnProperty('concept_id')) {
        resultNode.id = inputNode['concept_id'][0];
      } else {
        resultNode.id = inputNode['id'];
      }

      //name
      if (inputNode.hasOwnProperty('concept_desc')) {
        resultNode.name = inputNode['concept_desc'][0];
      }

      //children
      if (inputNode.hasOwnProperty('concept')) {
        let children = inputNode['concept'];
        for (let i = 0; i < children.length; i++) {
          resultNode.children.push(this.toJSON(children[i]));
        }
      }

      return resultNode;
    }
  }



  //============================================================================
  export class TreeNode {
    //required fields
    id: string;
    children: TreeNode[] = null;

    //optional fields:
    parent?: TreeNode = null;
    name?: string;
    weight?: number;

    deserialize(input) : TreeNode {
      Object.assign(this, input);

      if (!this.hasOwnProperty('id')) {
        throw new MissingFieldError('id');
      }
      if (!this.hasOwnProperty('children')) {
        throw new MissingFieldError('children');
      }

      this.parent = null;
      if (!this.hasOwnProperty('name')) {
        this.name = '';
      }
      this.weight = null;

      return this;
    }

    getParent(): TreeNode {
      return this.parent;
    }

    getChildren = () => {
      return this.children;
    };

    setParent(parent: TreeNode) {
      this.parent = parent;
    }

    addChild(child: TreeNode) {
      if (this.children.indexOf(child) == -1)
        this.children.push(child);
    }

    getId() {
      return this.id;
    }

  }


  //============================================================================
  export class Tree {
    private tree_: TreeNode[] = [];

    constructor(ok, filepath: string) {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('GET', filepath, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          let content = xhr.responseText;
          let fileType : string = InputFile.determineFileType(content);

          if (fileType === InputFile.json) {
            this.tree_ = InputJSON.jsonToTree(content);
            ok(this.tree_[0]);
          } else if (fileType === InputFile.skos) {
            InputSkos.skosToTree(content, ok);
          } else if (fileType === InputFile.treeML) {
            InputTreeML.treemlToTree(content, ok);
          }
        }
      };
      xhr.send();
    }

    public static setTree(tree : TreeNode[]) {
      this.tree_ = tree;
    }

    private getNodeById(id: string): TreeNode {
      return this.tree_.find((node: TreeNode) => (node.id == id));
    }

    computeWeight(callback: WeightFunction) {
      this.tree_.forEach((node: TreeNode) => callback(node));
    }

    getRootNode() {
      return this.tree_.find((node: TreeNode) => (node.parent == null));
    }

    countNodes(node : TreeNode) : number {
      let sum: number = 0;
      let children : TreeNode[] = node.children;
      children.forEach((child : TreeNode) => {
        sum += this.countNodes(child) + 1;
      });

      return sum;
    }
  }

}
