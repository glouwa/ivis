/**
 * Created by julian on 31.05.17.
 */
var construct = Reflect.construct;
function mini$(identifier) {
    if (identifier.startsWith('#'))
        return new $obj(document.getElementById(identifier.replace('#', '')));
    else if (identifier.startsWith("."))
        return new $objCollection(document.getElementsByClassName(identifier.replace('.', '')));
    else if (document.getElementsByTagName(identifier))
        return new $obj(document.getElementsByTagName(identifier));
    else
        return new $obj(identifier);
}
class $obj {
    constructor(htmlElement, tagName = "") {
        if (htmlElement instanceof Element) {
            this.htmlElement = htmlElement;
            this.id = htmlElement.id;
            this.tagName = htmlElement.tagName;
            this.isNew = false;
        }
        else if (htmlElement instanceof String) {
            this.isNew = true;
            this.id = htmlElement;
            this.tagName = tagName;
            this.htmlElement = new Element();
        }
    }
    append(text) {
        this.htmlElement.innerHTML += text;
        return this;
    }
    html() {
        if (this.isNew)
            return "<" + this.tagName + ' id="' + this.id + '"></' + this.tagName + '>';
        else
            return this.htmlElement.outerHTML;
    }
}
class $objCollection {
    constructor(htmlElements) {
        for (let elem in htmlElements) {
            this.htmlElements.push(new $obj(elem));
        }
    }
}
