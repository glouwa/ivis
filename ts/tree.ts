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
declare type WeightFunction = (node: TreeNode) => void;

class MissingFieldError extends Error {
  fieldname : string;
  constructor(field: string) {
    super(field);
    this.fieldname = field;
  }
}

class TreeNode {
  //required fields
  id : number;
  parent : TreeNode = null;
  children : TreeNode[] = null;

  //optional fields:
  name? : string;
  weight? : number;

  deserialize(input) {
    Object.assign(this, input);

    if (!this.hasOwnProperty('id')){
      throw new MissingFieldError('id');
    }
    if (!this.hasOwnProperty('parent')) {
      throw new MissingFieldError('parent');
    }
    if (!this.hasOwnProperty('children')) {
      throw new MissingFieldError('children');
    }

    if (!this.hasOwnProperty('name')) {
      this.name = '';
    }
    this.weight = null;

    return this;
  }

  getParent() : TreeNode {
    return this.parent;
  }

  getChildren() : TreeNode[] {
    return this.children;
  }

  setParent(parent : TreeNode) {
    this.parent = parent;
  }

  addChild(child : TreeNode) {
    if (this.children.indexOf(child) == -1)
      this.children.push(child);
  }
}


class Tree {
  private tree_ : TreeNode[] = null;

  constructor(filepath: string) {
    console.log('Tree constructor');
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('GET', filepath, true);

    xhr.onreadystatechange = (callback) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let json = JSON.parse(xhr.responseText);
        console.log(json);
        try {
          this.setupTreeHierarchy(json, null);
          console.log("tree size: " + this.getNodeCount());
        } catch(e) {
          console.log("Invalid JSON input file.");
        }
      }
    };
    xhr.send();
  }

  private setupTreeHierarchy(json : Object[], parent : TreeNode) {
    json.forEach((obj : Object) => {
      let node = new TreeNode().deserialize(obj);
      node.setParent(parent);
      let children : TreeNode[] = node.getChildren();
      this.setupTreeHierarchy(children, node);
      children.forEach((child : TreeNode) => {
        node.addChild(child);
      });
    });
  }

  private getNodeById(id : number): TreeNode {
    return this.tree_.find((node : TreeNode) => (node.id == id));
  }

  computeWeight(callback: WeightFunction) {
    this.tree_.forEach((node : TreeNode) => callback(node));
  }

  getRouteNode() {
    return this.tree_.find((node : TreeNode) => (node.parent == null));
  }

  getNodeCount() {
    let count : number = 0;
    this.tree_.forEach((node: TreeNode) => {
      count++;
    });
    return count;
  }

  getTree() : TreeNode[]{
    return this.tree_;
  }

}


//TODO: get it working with JSON
//test all functions with JSON
//implement SKOS, TREEML
//implement treeoflife
//implement file system

