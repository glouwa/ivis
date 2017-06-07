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
      - cx, cy
      - radius, theta
      - weight
        - get a weight function and apply it to all elements -> if weight is undefined in child - call weight funciton on child, then finish parent weight computation

 *
 */
import * as fs from 'file-system';

declare type WeightFunction = (node: Node) => void;

class MissingFieldError extends Error {
  fieldname : string;
  constructor(field: string) {
    super(field);
    this.fieldname = field;
  }
}

class Node {
  //required fields
  id : number;
  parent : number;
  children : number[];

  //optional fields:
  name? : string;

  //additional fields:
  cx : number = null;
  cy : number = null;
  radius : number = null;
  theta : number = null;
  weight : number = null;

  //fields for quick access:
  parentRef : Node = null;
  childrenRef : Node[] = null;

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

    return this;
  }

  getParent() : Node{
    return this.parentRef;
  }

  getChildren() : Node[]{
    return this.childrenRef;
  }

}



export class Tree {
  private tree_ : Node[];

  constructor(filepath: string) {
    fs.readFileSync(filepath, (err, data) => {
      if (err) {
        console.log('problem with opening json file: ' + err.toString());
      } else {
        let json : string = JSON.parse(data);
        console.log(data);
        try {
          this.tree_ = data.map(node => new Node().deserialize(node));
        } catch(e) {
          console.log("Invalid JSON input file.");
        }

        this.addReferences();
      }
    });


    /*
    fetch(filepath).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(data);
      try {
        this.tree_ = data.map(node => new Node().deserialize(node));
      } catch(e) {
        console.log("Invalid JSON input file.");
      }

      this.tree_.sort((nodeA : Node, nodeB : Node) => {
        if (nodeA.id < nodeB.id)
          return true;
        return false;
      });

      this.addReferences();
    });*/


  }

  private getNodeById(id : number): Node {
    return this.tree_.find((node : Node) => (node.id == id));
  }

  addReferences() {
    this.tree_.forEach((node : Node) => {
      node.parentRef = node.parent ? this.getNodeById(node.parent) : null;
      node.childrenRef = node.children ? node.children.map(childId => this.getNodeById(childId)) : null;
    });
  }

  computeWeight(callback: WeightFunction) {
    this.tree_.forEach((node : Node) => callback(node));
  }

  getRouteNode() {
    return this.tree_.find((node : Node) => (node.parent == null));
  }

  getNodeCount() {
    return this.tree_.length;
  }


}


//TODO: 
//  - index.html in js/ dir -> make it app dir -> should not access node_modules,...
