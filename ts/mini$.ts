/**
 * Created by julian on 31.05.17.
 */

import construct = Reflect.construct;
function mini$(identifier: string ) {
    if(identifier.startsWith('#'))
        return new $obj(document.getElementById(identifier.replace('#', '')));
    else if (identifier.startsWith("."))
        return new $objCollection(document.getElementsByClassName(identifier.replace('.', '')));
    else
        if(document.getElementsByTagName(identifier))
            return new $obj(document.getElementsByTagName(identifier));
        else
            return new $obj(identifier);

}

class $obj {
    public htmlElement : Element;
    public isNew: boolean;
    public id: String;
    public tagName: string;

    constructor(htmlElement: any, tagName: string = "") {
        if(htmlElement instanceof Element) {
            this.htmlElement = htmlElement;
            this.id = htmlElement.id;
            this.tagName = htmlElement.tagName;
            this.isNew = false;
        } else if(htmlElement instanceof String) {
            this.isNew = true;
            this.id = htmlElement;
            this.tagName = tagName;
            this.htmlElement = new Element();

        }
    }


    append(text: string) {
        this.htmlElement.innerHTML += text;
        return this;
    }

    html() : string {
        if(this.isNew)
            return "<" + this.tagName + ' id="' + this.id + '"></' + this.tagName + '>';
        else
            return this.htmlElement.outerHTML;
    }

}

class $objCollection {
    htmlElements: $obj[];

    constructor(htmlElements: HTMLCollectionOf<Element>) {
        for (let elem in htmlElements) {
            this.htmlElements.push(new $obj(elem));
        }
    }
}

