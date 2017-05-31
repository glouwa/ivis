
/**
 * Created by julian on 31.05.17.
 */

function init() {


    mini$.$("body").append(mini$.$("main_drawing_area");

    var myCanvas = new Plexx.DrawingArea({width: 1000, height: 500, align: "xMidYMid"});
    var renderContext = new Plexx.RenderContext({id: "main_drawing_area"});
    var debugPanel = new Plexx.DebugHelper("debug-panel", renderContext, myCanvas);
    var rootGroup = new Plexx.Group({translation: [500, 250]});
    var euclideanSpace = new Plexx.Circle({radius: 250, position: [0, 0], colour: "#f9fbe7"});
}

window.onload = init;

