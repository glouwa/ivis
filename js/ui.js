var ivis;
(function (ivis) {
    var ui;
    (function (ui) {
        class UiNode {
            constructor() {
            }
            updateModel() { }
            updateViewModel(sel) { }
            updateAll() { }
        }
        ui.UiNode = UiNode;
    })(ui = ivis.ui || (ivis.ui = {}));
})(ivis || (ivis = {}));
