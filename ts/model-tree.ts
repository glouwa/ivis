/*
 * this class
 - gets an intput path
 - reads the file containing a json tree representation
 - creates a tree hierarchy based on the data
 */

/*
 * node:
 must be in json file
 - id (unique)
 - parent
 - children

 are optional or not contained in json file
 - name
 - get a weight function and apply it to all elements -> if weight is undefined in child - call weight funciton on child, then finish parentRef weight computation

 *
 */

namespace ivis.model {
  declare type WeightFunction = (node: TreeNode) => void;

  class MissingFieldError extends Error {
    fieldname: string;

    constructor(field: string) {
      super(field);
      this.fieldname = field;
    }
  }

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

    public getChildren = () => {
      return this.children;
    };

    setParent(parent: TreeNode) {
      //console.log('setParent ' + parent.getId() + ' of node ' + this.getId());
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


  export class Tree {
    private tree_: TreeNode[] = [];

    constructor(ok, filepath: string) {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('GET', filepath, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          let json = JSON.parse(xhr.responseText);
          try {
            this.setupTreeHierarchy(json);
            ok(this.tree_[0]);
          } catch (e) {
            console.log("Invalid JSON data file.");
            console.log(e);
          }
        }
      };
      xhr.send();
    }

    private setupTreeHierarchy(json: Object[]) {
      json.forEach((obj: TreeNode) => {
        let node : TreeNode = new TreeNode().deserialize(obj);
        this.tree_.push(node);
      });
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

    /*getNodeCount() {
      let counter = function(node : TreeNode) {
        let count = 0;
        node.getChildren().forEach((child : TreeNode) => {
          count += counter(child);
        });
        return count + 1;
      };

      let nodeCount = 0;
      this.tree_.forEach((node : TreeNode) => {
        nodeCount += counter(node);
      });

      return nodeCount + 1;
    }*/

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

//TODO: get it working with JSON
//test all functions with JSON
//implement SKOS, TREEML
//implement treeoflife
//implement file system

