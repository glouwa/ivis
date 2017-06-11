/*
 * this class
        - gets an intput path
        - reads the file containing a json tree representation
        - creates a tree hierarchy based on the data
 */
class MissingFieldError extends Error {
    constructor(field) {
        super(field);
        this.fieldname = field;
    }
}
class Node {
    constructor() {
        //additional fields:
        this.cx = null;
        this.cy = null;
        this.radius = null;
        this.theta = null;
        this.weight = null;
        //fields for quick access:
        this.parentRef = null;
        this.childrenRef = null;
    }
    deserialize(input) {
        Object.assign(this, input);
        if (!this.hasOwnProperty('id')) {
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
    getParent() {
        return this.parentRef;
    }
    getChildren() {
        return this.childrenRef;
    }
}
class Tree {
    constructor(filepath) {
        fs.readFileSync(filepath, (err, data) => {
            if (err) {
                console.log('problem with opening json file: ' + err.toString());
            }
            else {
                let json = JSON.parse(data);
                console.log(data);
                try {
                    this.tree_ = data.map(node => new Node().deserialize(node));
                }
                catch (e) {
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
    getNodeById(id) {
        return this.tree_.find((node) => (node.id == id));
    }
    addReferences() {
        this.tree_.forEach((node) => {
            node.parentRef = node.parent ? this.getNodeById(node.parent) : null;
            node.childrenRef = node.children ? node.children.map(childId => this.getNodeById(childId)) : null;
        });
    }
    computeWeight(callback) {
        this.tree_.forEach((node) => callback(node));
    }
    getRouteNode() {
        return this.tree_.find((node) => (node.parent == null));
    }
    getNodeCount() {
        return this.tree_.length;
    }
}
//TODO: 
//  - index.html in js/ dir -> make it app dir -> should not access node_modules,...
