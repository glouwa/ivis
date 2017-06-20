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
var ivis;
(function (ivis) {
    var model;
    (function (model) {
        class MissingFieldError extends Error {
            constructor(field) {
                super(field);
                this.fieldname = field;
            }
        }
        class TreeNode {
            constructor() {
                this.children = null;
                //optional fields:
                this.parent = null;
            }
            deserialize(input) {
                Object.assign(this, input);
                if (!this.hasOwnProperty('id')) {
                    throw new MissingFieldError('id');
                }
                console.log('deserialize ' + this.id);
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
            getParent() {
                return this.parent;
            }
            getChildren() {
                return this.children;
            }
            setParent(parent) {
                //console.log('setParent ' + parent.getId() + ' of node ' + this.getId());
                this.parent = parent;
            }
            addChild(child) {
                //console.log('addChild ' + child.getId() + ' to node ' + this.getId());
                if (this.children.indexOf(child) == -1)
                    this.children.push(child);
            }
            getId() {
                return this.id;
            }
            getChildCount() {
                let count = 0;
                this.children.forEach((child) => {
                    //count += child.getChildCount();
                });
                return count;
            }
        }
        model.TreeNode = TreeNode;
        class Tree {
            constructor(ok, filepath) {
                this.tree_ = [];
                let xhr = new XMLHttpRequest();
                xhr.open('GET', filepath, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let json = JSON.parse(xhr.responseText);
                        try {
                            let _this = this;
                            this.setupTreeHierarchy(json, null);
                            console.log(this.tree_);
                            ok(this.tree_[0]);
                        }
                        catch (e) {
                            console.log("Invalid JSON data file.");
                            console.log(e);
                        }
                    }
                };
                xhr.send();
            }
            setupTreeHierarchy(json, parent) {
                json.forEach((obj) => {
                    let node = new TreeNode().deserialize(obj);
                    let children = node.getChildren();
                    if (children !== null) {
                        this.setupTreeHierarchy(children, node);
                    }
                    if (parent !== null) {
                        node.setParent(parent);
                        parent.addChild(node);
                    }
                    else {
                        this.tree_.push(node);
                    }
                });
            }
            getNodeById(id) {
                return this.tree_.find((node) => (node.id == id));
            }
            computeWeight(callback) {
                this.tree_.forEach((node) => callback(node));
            }
            getRouteNode() {
                return this.tree_.find((node) => (node.parent == null));
            }
            getNodeCount() {
                let count = 0;
                this.tree_.forEach((node) => {
                    count += node.getChildCount();
                });
                return count;
            }
            getTree() {
                //console.log('getTree' + this.getNodeCount());
                return this.tree_;
            }
        }
        model.Tree = Tree;
    })(model = ivis.model || (ivis.model = {}));
})(ivis || (ivis = {}));
//TODO: get it working with JSON
//test all functions with JSON
//implement SKOS, TREEML
//implement treeoflife
//implement file system
