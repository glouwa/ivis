/**
 * Created by julian on 31.05.17.
 */

declare namespace mini$ {

    import construct = Reflect.construct;
    function $(identifier: String ) {
        if(identifier.startsWith('#'))
            return new $obj(document.getElementById(identifier.replace('#', '')));
        else if (identifier.startsWith("."))
            return new $objCollection(document.getElementsByClassName(identifier.replace('.', '')))
    }

    class $obj {
        htmlElement : Element;
        constructor(htmlElement: Element) {
            this.htmlElement = htmlElement;
        }

        append(text: string) {
            this.htmlElement.innerHTML += text;
            return this;
        }

    }

    class $objCollection {
        htmlElements: $obj[];

        constructor(htmlElements: HTMLCollectionOf<Element>) {
            for (let elem : Element in htmlElements) {
                this.htmlElements += new $obj(elem);
            }
        }
    }
}

}