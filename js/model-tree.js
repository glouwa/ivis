/*
 * model-tree gets a path to an input file and computes the tree from this data
 *
 */
var ivis;
(function (ivis) {
    var model;
    (function (model) {
        //============================================================================
        class MissingFieldError extends Error {
            constructor(field) {
                super(field);
                this.fieldname = field;
            }
        }
        //============================================================================
        class InputFile {
            static determineFileType(data) {
                try {
                    JSON.parse(data);
                    return this.json;
                }
                catch (e) {
                    if (data.indexOf("skos") !== -1) {
                        return this.skos;
                    }
                    return this.treeML;
                }
            }
        }
        InputFile.json = 'JSON';
        InputFile.treeML = 'TREEML';
        InputFile.skos = 'SKOS';
        //============================================================================
        class InputJSON {
            static jsonToTree(data) {
                let parsedJson = JSON.parse(data);
                try {
                    return this.createNodes(parsedJson);
                }
                catch (e) {
                    console.log("Invalid data file.");
                    console.log(e);
                }
            }
            static createNodes(json) {
                let tree = [];
                json.forEach((obj) => {
                    let node = new TreeNode().deserialize(obj);
                    tree.push(node);
                });
                return tree;
            }
        }
        //============================================================================
        class InputTreeML {
            static treemlToTree(data, callback) {
                xml2jsBundle.parseString(data, (err, result) => {
                    if (err !== null) {
                        console.log("Invalid data file");
                        return null;
                    }
                    let rootNode = result['tree']['branch']['0'];
                    let json = [];
                    json.push(this.toJSON(rootNode));
                    let tree = InputJSON.createNodes(json);
                    callback(tree[0]);
                });
            }
            static toJSON(inputNode) {
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
                    }
                    else if (attributeName === 'name') {
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
            static skosToTree(data, callback) {
                xml2jsBundle.parseString(data, (err, result) => {
                    if (err !== null) {
                        console.log("Invalid data file", err);
                        return null;
                    }
                    console.log('skos', result);
                    let conceptScheme = result['rdf:RDF']['skos:ConceptScheme'][0];
                    let rootNode = new TreeNode();
                    rootNode.id = conceptScheme['dc:title'][0];
                    rootNode.name = rootNode.id;
                    rootNode.children = this.addChildIds(conceptScheme['skos:hasTopConcept']);
                    this.addOtherNodes(rootNode, rootNode, result['rdf:RDF']['skos:Concept']);
                    console.log('tree:', rootNode);
                    callback(rootNode);
                });
            }
            static addChildIds(conceptList) {
                let resultArray = [];
                for (let i = 0; i < conceptList.length; i++) {
                    let node = new TreeNode();
                    node.id = conceptList[i]['$']['rdf:resource'];
                    resultArray.push(node);
                }
                return resultArray;
            }
            static addOtherNodes(root, parent, conceptList) {
                let definedButNotUsedNodes = [];
                for (let i = 0; i < conceptList.length; i++) {
                    let node = new TreeNode();
                    node.id = conceptList[i]['$']['rdf:about'];
                    node.name = conceptList[i]['skos:prefLabel'][0]['_'];
                    if (conceptList[i]['skos:narrower'] !== undefined)
                        node.children = this.addChildIds(conceptList[i]['skos:narrower']);
                    for (let j = 0; j < definedButNotUsedNodes.length; j++) {
                        node.setChild(definedButNotUsedNodes[j]);
                    }
                    if (root.setChild(node) === false)
                        definedButNotUsedNodes.push(node);
                }
            }
        }
        //============================================================================
        class TreeNode {
            constructor() {
                this.children = null;
                //optional fields:
                this.parent = null;
                this.getChildren = () => {
                    return this.children;
                };
            }
            deserialize(input) {
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
            getParent() {
                return this.parent;
            }
            setParent(parent) {
                this.parent = parent;
            }
            addChild(child) {
                if (this.children.indexOf(child) == -1)
                    this.children.push(child);
            }
            getId() {
                return this.id;
            }
            setChild(node) {
                if (this.children === null)
                    return false;
                for (let i = 0; i < this.children.length; i++) {
                    if (node.id === this.children[i].id) {
                        this.children[i] = node;
                        return true;
                    }
                }
                for (let i = 0; i < this.children.length; i++) {
                    if (this.children[i].setChild(node) === true)
                        return true;
                }
                return false;
            }
        }
        model.TreeNode = TreeNode;
        //============================================================================
        class Tree {
            constructor(ok, filepath) {
                this.tree_ = [];
                let xhr = new XMLHttpRequest();
                xhr.open('GET', filepath, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let content = xhr.responseText;
                        let fileType = InputFile.determineFileType(content);
                        if (fileType === InputFile.json) {
                            this.tree_ = InputJSON.jsonToTree(content);
                            ok(this.tree_[0]);
                        }
                        else if (fileType === InputFile.skos) {
                            console.log('SKOS');
                            InputSkos.skosToTree(content, ok);
                        }
                        else if (fileType === InputFile.treeML) {
                            InputTreeML.treemlToTree(content, ok);
                        }
                    }
                };
                xhr.send();
            }
            getNodeById(id) {
                return this.tree_.find((node) => (node.id == id));
            }
            computeWeight(callback) {
                this.tree_.forEach((node) => callback(node));
            }
            getRootNode() {
                return this.tree_.find((node) => (node.parent == null));
            }
            countNodes(node) {
                let sum = 0;
                let children = node.children;
                children.forEach((child) => {
                    sum += this.countNodes(child) + 1;
                });
                return sum;
            }
        }
        model.Tree = Tree;
    })(model = ivis.model || (ivis.model = {}));
})(ivis || (ivis = {}));
