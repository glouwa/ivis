/*
 * model-tree gets a path to an input file and computes the tree from this data
 *
 */


namespace ivis.model {
  declare type WeightFunction = (node: TreeNode) => void;

  //===================================================
  class MissingFieldError extends Error {
    fieldname: string;

    constructor(field: string) {
      super(field);
      this.fieldname = field;
    }
  }

  class InvalidFileError extends Error {
    constructor() {
      super();
    }
  }

  //===================================================
  class InputFile {
    static json : string = 'JSON';
    static treeML : string = 'TREEML';
    static skos : string = 'SKOS';

    static determineFileType(data: string) : string {
      try {
        JSON.parse(data);
        return this.json;
      } catch (e) {
        if (data.indexOf("skos") != -1) {
          return this.skos;
        }
        return this.treeML;
      }
    }
  }

  //===================================================
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

  //===================================================
  class InputTreeML{
    static treemlToTree(data: string, callback) {
      xml2jsBundle.parseString(data, (err, result) => {
        if (err != null) {
          console.log("Invalid data file");
          return null;
        }

        let rootNode = result['tree']['branch'];
        if (rootNode.hasOwnProperty('0'))
          rootNode = rootNode['0'];
        let json: Object[] = [];
        json.push(this.toJSON(rootNode));
        let tree: TreeNode[] = InputJSON.createNodes(json);
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
        if (attributeName == 'id') {
          resultNode.id = attributeValue;
        } else if (attributeName == 'name') {
          resultNode.name = attributeValue;
        }
      }
      if (resultNode.id == '')
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

  //===================================================
  class InputSkos {
    static skosToTree(data: string, callback) {
      xml2jsBundle.parseString(data, (err, result) => {
        if (err != null) {
          console.log("Invalid data file", err);
          return null;
        }
        console.log('skos', result);
        let rdf = result['rdf:RDF'];
        let rootNode = new TreeNode();
        if (rdf.hasOwnProperty('skos:ConceptScheme')) {
          let conceptScheme = rdf['skos:ConceptScheme'][0];

          if (conceptScheme.hasOwnProperty('dc:title'))
            rootNode.id = conceptScheme['dc:title'][0];
          if (conceptScheme.hasOwnProperty('dcterms:title'))
            rootNode.id = conceptScheme['dcterms:title'][0]['_'];
          if (conceptScheme.hasOwnProperty('dct:title'))
            rootNode.id = conceptScheme['dct:title'][0]['_'];

          if (conceptScheme.hasOwnProperty('dcterms:identifier')) {
            rootNode.name = rootNode.id;
            rootNode.id = conceptScheme['dcterms:identifier'][0];
          } else if (conceptScheme.hasOwnProperty('dct:identifier')) {
            rootNode.name = rootNode.id;
            rootNode.id = conceptScheme['dct:identifier'][0];
          }
          if (conceptScheme.hasOwnProperty('skos:hasTopConcept'))
            rootNode.children = this.addChildIds(conceptScheme['skos:hasTopConcept']);

          rdf = rdf['skos:Concept'];
          rootNode = this.addOtherNodes(rootNode, rdf);
        } else if (rdf.hasOwnProperty('rdf:Description')) {
          rootNode.id = null;
          rdf = rdf['rdf:Description'];
          let nodeMap: {[id: string]: TreeNode} = this.createAllNodes(rdf);
          rootNode = this.connectNodesFromMap(nodeMap);
          if (rootNode == null)
            throw new InvalidFileError();
        }

        console.log('tree:', rootNode);
        callback(rootNode);
      })
    }

    private static addChildIds(conceptList: Object[]) : TreeNode[] {
      let resultArray : TreeNode[] = [];
      for (let i = 0; i < conceptList.length; i++) {
        let node = new TreeNode();
        node.id = conceptList[i]['$']['rdf:resource'];
        if (resultArray.indexOf(node) == -1)
          resultArray.push(node);
      }
      return resultArray;
    }

    private static addOtherNodes(root: TreeNode, conceptList: Object[]) {
      let inTreeNotUsedNodes: TreeNode[] = [];
      let nodesWithUndefinedParents:  TreeNode[] = [];
      for (let i = 0; i < conceptList.length; i++) {
        let node = new TreeNode();
        let currentConcept = conceptList[i];
        node.id = currentConcept['$']['rdf:about'];
        if (currentConcept.hasOwnProperty('skos:prefLabel'))
          node.name = currentConcept['skos:prefLabel'][0]['_'];
        else if (currentConcept.hasOwnProperty('cc:attributionName')) {
          node.name = currentConcept['cc:attributionName'][0]['_'];
        }

        //has children
        if (currentConcept.hasOwnProperty('skos:narrower'))
          node.children = this.addChildIds(conceptList[i]['skos:narrower']);


        if (root.id == null) {
          root = node;
        }

        //is child of some other node
        if (currentConcept.hasOwnProperty('skos:inScheme')) {
          node.parent = currentConcept['skos:inScheme'][0]['$']['rdf:resource'];
          if (root.addChildToScheme(node, node.parent.id) == false)
            nodesWithUndefinedParents.push(node);
        }

        if ((root.setChild(node) == false) && (root != node))
          inTreeNotUsedNodes.push(node);

        for (let j = 0; j < inTreeNotUsedNodes.length; j++) {
          inTreeNotUsedNodes[j].parent = node;
          if (node.setChild(inTreeNotUsedNodes[j]) == true)
            inTreeNotUsedNodes.splice(j, 1);
        }

        for (let k = 0; k < nodesWithUndefinedParents.length; k++) {
          if (root.addChildToScheme(nodesWithUndefinedParents[k], nodesWithUndefinedParents[k].parent.id) == true)
            nodesWithUndefinedParents.splice(k, 1);
        }
      }
      //TODO: handle narrower children!

      return root;
    }

    private static createAllNodes(conceptList: Object[]) {
      console.log('createAllNodes');
      let resultMap: {[id: string]: TreeNode} = {};
      for (let i = 0; i < conceptList.length; i++) {
        let node = new TreeNode();
        let currentConcept = conceptList[i];
        node.id = currentConcept['$']['rdf:about'];

        if (currentConcept.hasOwnProperty('skos:prefLabel')) {
          node.name = currentConcept['skos:prefLabel'][0]['_'];
        } else if (currentConcept.hasOwnProperty('cc:attributionName')) {
          node.name = currentConcept['cc:attributionName'][0]['_'];
        }

        //has children
        if (currentConcept.hasOwnProperty('skos:narrower'))
          node.children = this.addChildIds(conceptList[i]['skos:narrower']);

        //is child of some other node
        if (currentConcept.hasOwnProperty('skos:inScheme'))
          node.parent = this.addParentId(currentConcept['skos:inScheme'][0]['$']['rdf:resource']);

        resultMap[node.id] = node;
      }

      console.log('resultMap', resultMap);
      return resultMap;
    }

    private static connectNodesFromMap(map: {[key: string]: TreeNode}): TreeNode {
      console.log('connectNodesFromMap');
      for (let nodeId in map) {
        //1. set parent
        let currNode = map[nodeId];
        if (currNode.parent != null) {
          let parentNode = map[currNode.parent.id];
          if (parentNode == undefined) {
            parentNode = new TreeNode();
            parentNode.id = currNode.parent.id;
          }
          currNode.parent = parentNode;
          parentNode.addChild(currNode);
          map[currNode.parent.id] = parentNode;
        }

        //2. set children
        if (currNode.children) {
          for (let i = 0; i < currNode.children.length; i++) {
            let childNode = map[currNode.children[i].id];
            childNode.parent = currNode;
            currNode.addChild(childNode);
            map[currNode.children[i].id] = childNode;
          }
        }

        map[nodeId] = currNode;
      }


      let nodeMaxChildren = null;
      for (let nodeId in map) {
        if (map[nodeId].children && !map[nodeId].parent) {
          if(nodeMaxChildren == null || nodeMaxChildren.children.length < map[nodeId].children.length)
            nodeMaxChildren = map[nodeId];
        }
      }
      return nodeMaxChildren;
    }

    private static addParentId(id: string) {
      let parentNode = new TreeNode;
      parentNode.id = id;
      return parentNode;
    }

  }



  //===================================================
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

    //add child to current node
    addChild(child: TreeNode) {
      if (this.children == null)
        this.children = [];

      let childIndex = this.children.findIndex((value, index, object) => {
        return (value.id == child.id);
      });
      if (childIndex == -1)
        this.children.push(child);
      else
        this.children[childIndex] = child;
    }

    getId() {
      return this.id;
    }

    setChild(node: TreeNode) {
      if (this.children == null)
        return false;
      for (let i = 0; i < this.children.length; i++) {
        if (node.id == this.children[i].id) {
          node.parent = this;
          this.children[i] = node;
          return true;
        }
      }
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].setChild(node) == true)
          return true;
      }
      return false;
    }

    //add child node if it had property skos:inScheme
    addChildToScheme(node: TreeNode, parentId: string) {
      if (this.id == parentId) {
        this.addChild(node);
        return true;
      }
      if (this.children == null)
        return false;

      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].addChildToScheme(node, parentId) == true)
          return true;
      }

      return false;
    }
  }


  //===================================================
  export class Tree {
    private tree_: TreeNode[] = [];

    constructor(ok, filepath: string) {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('GET', filepath, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          let content = xhr.responseText;
          let fileType : string = InputFile.determineFileType(content);

          if (fileType == InputFile.json) {
            this.tree_ = InputJSON.jsonToTree(content);
            ok(this.tree_[0]);
          } else if (fileType == InputFile.skos) {
            console.log('SKOS');
            try {
              InputSkos.skosToTree(content, ok);
            } catch(e) {
              console.log(e);
            }
          } else if (fileType == InputFile.treeML) {
            InputTreeML.treemlToTree(content, ok);
          }
        }
      };
      xhr.send();
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
