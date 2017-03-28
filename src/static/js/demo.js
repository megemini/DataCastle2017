jsPlumb.ready(function () {

    // list of possible anchor locations for the blue source element
    var sourceAnchors = [
        [ 0, 1, 0, 1 ],
        [ 0.25, 1, 0, 1 ],
        [ 0.5, 1, 0, 1 ],
        [ 0.75, 1, 0, 1 ],
        [ 1, 1, 0, 1 ]
    ];

    var instance = window.instance = jsPlumb.getInstance({
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                visible:true,
                width:21,
                length:21,
                id:"ARROW",
                events:{
                    click:function() { alert("you clicked on the arrow overlay")}
                }
            } ],
            [ "Label", {
                location: 0.5,
                id: "label",
                cssClass: "aLabel",
                events:{
                    tap:function() { alert("hey"); }
                }
            }]
        ],
        // drag options
        DragOptions: { cursor: "pointer", zIndex: 2000 },
        // default to a gradient stroke from blue to green.
        PaintStyle: {
            gradient: { stops: [
                [ 0, "#0d78bc" ],
                [ 1, "#558822" ]
            ] },
            stroke: "#558822",
            strokeWidth: 2
        },
        Container: "canvas"
    });

    // click listener for the enable/disable link in the source box (the blue one).
    jsPlumb.on(document.getElementById("enableDisableSource"), "click", function (e) {
        var sourceDiv = (e.target|| e.srcElement).parentNode;
        var state = instance.toggleSourceEnabled(sourceDiv);
        this.innerHTML = (state ? "disable" : "enable");
        jsPlumb[state ? "removeClass" : "addClass"](sourceDiv, "element-disabled");
        jsPlumbUtil.consume(e);
    });

    // click listener for enable/disable in the small green boxes
    jsPlumb.on(document.getElementById("canvas"), "click", ".enableDisableTarget", function (e) {
        var targetDiv = (e.target || e.srcElement).parentNode;
        var state = instance.toggleTargetEnabled(targetDiv);
        this.innerHTML = (state ? "disable" : "enable");
        jsPlumb[state ? "removeClass" : "addClass"](targetDiv, "element-disabled");
        jsPlumbUtil.consume(e);
    });

    // bind to a connection event, just for the purposes of pointing out that it can be done.
    instance.bind("connection", function (i, c) {
        if (typeof console !== "undefined")
            console.log("connection", i.connection);
    });

    // get the list of ".smallWindow" elements.            
    var smallWindows = jsPlumb.getSelector(".smallWindow");
    // make them draggable
    instance.draggable(smallWindows, {
        filter:".enableDisableTarget"
    });

    // suspend drawing and initialise.
    instance.batch(function () {

        // make 'window1' a connection source. notice the filter and filterExclude parameters: they tell jsPlumb to ignore drags
        // that started on the 'enable/disable' link on the blue window.
        instance.makeSource("sourceWindow1", {
            filter:"a",
            filterExclude:true,
            maxConnections: -1,
            endpoint:[ "Dot", { radius: 7, cssClass:"small-blue" } ],
            anchor:sourceAnchors,
            connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
        });

        // configure the .smallWindows as targets.
        instance.makeTarget(smallWindows, {
            dropOptions: { hoverClass: "hover" },
            anchor:"Top",
            endpoint:[ "Dot", { radius: 11, cssClass:"large-green" } ],
        });

        // and finally connect a couple of small windows, just so its obvious what's going on when this demo loads.           
        instance.connect({ source: "sourceWindow1", target: "targetWindow5" });
        instance.connect({ source: "sourceWindow1", target: "targetWindow2" });
    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);



    window.jsplumbUtils = {

        initNode: function(el) {

            // initialise draggable elements.
            instance.draggable(el);

            instance.makeSource(el, {
                filter: ".ep",
                anchor: "Continuous",
                connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
                connectionType:"basic",
                extract:{
                    "action":"the-action"
                },
                maxConnections: 2,
                onMaxConnections: function (info, e) {
                    alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });

            instance.makeTarget(el, {
                dropOptions: { hoverClass: "dragHover" },
                anchor: "Continuous",
                allowLoopback: true
            });

            // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
            // version of this demo to find out about new nodes being added.
            //
            // instance.fire("jsPlumbDemoNodeAdded", el);
        },



        newNode: function(x, y) {
            var d = document.createElement("div");
            var id = jsPlumbUtil.uuid();
            d.className = "window smallWindow";
            d.id = id;
            d.innerHTML = id.substring(0, 7) + "<div class=\"ep\"></div>";
            d.style.left = x + "px";
            d.style.top = y + "px";
            instance.getContainer().appendChild(d);
            this.initNode(d);
            return d;
        },

    };


});	

