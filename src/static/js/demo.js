jsPlumb.ready(function () {

    // list of possible anchor locations for the blue source element
    // var sourceAnchors = [
    //     [ 0, 1, 0, 1 ],
    //     [ 0.25, 1, 0, 1 ],
    //     [ 0.5, 1, 0, 1 ],
    //     [ 0.75, 1, 0, 1 ],
    //     [ 1, 1, 0, 1 ]
    // ];


    var instance = window.instance = jsPlumb.getInstance({
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                visible:true,
                width:21,
                length:21,
                id:"ARROW",
                events:{
                    click:function() { 
                        // alert("you clicked on the arrow overlay")
                    }
                }
            } ],
            [ "Label", {
                location: 0.5,
                id: "label",
                cssClass: "aLabel",
                events:{
                    tap:function() { 
                        // alert("Connection From A to B"); 
                        showConn(this)
                    }
                }
            }]
        ],
        // drag options
        DragOptions: { cursor: "pointer", zIndex: 2000 },
        // default to a gradient stroke from blue to green.
        // TODO: different gradient from node types
        // PaintStyle: {
        //     gradient: { stops: [
        //         [ 0, "#0d78bc" ],
        //         [ 1, "#558822" ]
        //     ] },
        //     stroke: "#558822",
        //     strokeWidth: 2
        // },
        Container: "canvas"
    });


    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
        strokeWidth: 4,
        stroke: "#61B7CF",
        joinstyle: "round",
        // outlineStroke: "white",
        outlineWidth: 6
    };
    // .. and this is the hover style.
    var connectorHoverStyle = {
        strokeWidth: 6,
        stroke: "#216477",
        outlineWidth: 8,
        // outlineStroke: "white",
    };
    var endpointHoverStyle = {
        fill: "#216477",
        stroke: "#216477",
    };
    // the definition of source endpoints (the small blue ones)
    // source --> output
    var sourceEndpoint = {
        endpoint: "Dot",
        paintStyle: {
            stroke: "#7AB02C",
            fill: "transparent",
            radius: 6,
            strokeWidth: 1,
        },
        maxConnections: -1,
        isSource: true,
        connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
        connectorStyle: connectorPaintStyle,
        hoverPaintStyle: endpointHoverStyle,
        connectorHoverStyle: connectorHoverStyle,
        dragOptions: {},
        // overlays: [
        // [ "Label", {
        //     location: [0.5, 2],
        //     label: "Drag",
        //     cssClass: "endpointSourceLabel",
        //     visible:true
        // } ]
        // ],
    };
    // the definition of target endpoints (will appear when the user drags a connection)
    // target --> input
    var targetEndpoint = {
        endpoint: "Dot",
        paintStyle: { 
            fill: "#7AB02C", 
            radius: 6,
        },
        hoverPaintStyle: endpointHoverStyle,
        maxConnections: 1,
        dropOptions: { hoverClass: "hover", activeClass: "active" },
        isTarget: true,
        // overlays: [
        // [ "Label", { 
        //     location: [0.5, -1], 
        //     label: "Drop", 
        //     cssClass: "endpointTargetLabel", 
        //     visible:true } ]
        // ]
    };

    // TODO: click event -> 1.click "x" close node 2.click node show info
    // // click listener for the enable/disable link in the source box (the blue one).
    // jsPlumb.on(document.getElementById("enableDisableSource"), "click", function (e) {
    //     var sourceDiv = (e.target|| e.srcElement).parentNode;
    //     var state = instance.toggleSourceEnabled(sourceDiv);
    //     this.innerHTML = (state ? "disable" : "enable");
    //     jsPlumb[state ? "removeClass" : "addClass"](sourceDiv, "element-disabled");
    //     jsPlumbUtil.consume(e);
    // });

    // click node event
    jsPlumb.on($("#canvas"), "click", ".nodeForEvent", function (e) {

        if (typeof e.srcElement.id === "undefined" || e.srcElement.id === null || e.srcElement.id == "") {
            // alert("nothing")
            return
        } 

        // alert("e.srcElement.id" + e.srcElement.id)
        var nodeId = e.srcElement.id
        var node = getNodeById(nodeId)

        if (typeof node === "undefined" || node === null) {
            clearNodeInfo()
        }
        else {
            showNodeInfo(node)

        }

        // console.log(node)

        // TODO: get all nodes connected TO this node show connected nodes
        jsplumbUtils.getUpNodes(nodeId)

        // instance.selectEndpoints({target:e.srcElement.id}).each(function(endpoint) {

        //     // console.log(endpoint)

        //     // endpoint.connections[i].sourceId is node name of source/output
        //     for (var i = endpoint.connections.length - 1; i >= 0; i--) {
        //         console.log("Show up node")
        //         console.log(endpoint.connections[i].sourceId)
        //     }
        //     // 

        // })

        // TODO: get all nodes connected FROM this node show connected nodes
        jsplumbUtils.getDownNodes(nodeId)
        // instance.selectEndpoints({source:e.srcElement.id}).each(function(endpoint) {

        //     // console.log(endpoint)

        //     // endpoint.connections[i].sourceId is node name of source/output
        //     for (var i = endpoint.connections.length - 1; i >= 0; i--) {
        //         console.log("Show down node")
        //         console.log(endpoint.connections[i].targetId)
        //     }
        //     // 

        // })



        setCurrentNode(nodeId)



        console.log("current node is " + currentNodeId)

        jsPlumbUtil.consume(e);

    });

    // // click listener for enable/disable in the small green boxes
    jsPlumb.on($("#canvas"), "click", ".closeNode", function (e) {
        

        var targetDiv = (e.target || e.srcElement).parentNode;
        // console.log(e)
        // console.log("targetDiv " + targetDiv.id)

        toId = targetDiv.id

        // clear current node id and clear node info from console
        if (currentNodeId == toId) {
            // currentNodeId = null

            setCurrentNode(null)

            clearNodeInfo()
        }

        // var targetAnchors = sourceList.toId
        // var sourceAnchors = targetList.toId

        // // console.log(targetList.toId)
        // for (var i = 0; i < sourceAnchors.length; i++) {
        //     var sourceUUID = getEndpointId(toId, sourceAnchors[i].id);
        //     // console.log("source uuid " + sourceUUID)

        //     instance.deleteEndpoint(sourceUUID);
        // }
        // for (var j = 0; j < targetAnchors.length; j++) {
        //     var targetUUID = getEndpointId(toId, targetAnchors[j].id);
        //     // console.log("target uuid " + targetUUID)

        //     instance.deleteEndpoint(targetUUID);
        // }
        
        instance.remove(toId);

        // var state = instance.toggleTargetEnabled(targetDiv);
        // this.innerHTML = (state ? "disable" : "enable");
        // jsPlumb[state ? "removeClass" : "addClass"](targetDiv, "element-disabled");
        alert("close and current node id is " + currentNodeId)

        jsPlumbUtil.consume(e);
    });

    // TODO: Debug: bind to a connection event, just for the purposes of pointing out that it can be done.
    var initConnection = function (connection) {
        connection.getOverlay("label").setLabel(
            "Connection");
    };

    // connection func
    instance.bind("connection", function (connInfo, originalEvent) {

        // TODO: if source and target not same, then detach
        if (false) {
            instance.detach(connInfo.connection);
            return 
        }

        if (typeof console !== "undefined")
            console.log("connection", connInfo.connection);

        // listen for new connections; 
        // initialise them the same way we initialise the connections at startup.
        initConnection(connInfo.connection);
    });

    // detach func
    instance.bind("connectionDetached", function (connInfo, originalEvent) {
        alert("detach")    
    })

    // toggle connection type
    var basicType = {
        connector: "StateMachine",
        paintStyle: { stroke: "red", strokeWidth: 4 },
        hoverPaintStyle: { stroke: "blue" },
        overlays: [
            "Arrow"
        ]
    };

    instance.registerConnectionType("basic", basicType);

    instance.bind("click", function (conn, originalEvent) {
        conn.toggleType("basic");
    });

    // TODO: add one node then make it draggable
    // // get the list of ".smallWindow" elements.            
    // var smallWindows = jsPlumb.getSelector(".smallWindow");
    // // make them draggable
    // instance.draggable(smallWindows, {
    //     filter:".enableDisableTarget"
    // });


    // TODO: input endpoint max connection: 1
    //       output endpoint max connection: -1
    // TODO: anchor
    //       input: [1/inputs number, 0, 0, -1]
    //       output: Bottom (only one ouput)
    // TODO: connector: Flowchart

    // suspend drawing and initialise.
    // instance.batch(function () {

    //     // make 'window1' a connection source. notice the filter and filterExclude parameters: they tell jsPlumb to ignore drags
    //     // that started on the 'enable/disable' link on the blue window.
    //     instance.makeSource("sourceWindow1", {
    //         filter:"a", 
    //         filterExclude:true,
    //         maxConnections: -1,
    //         endpoint:[ "Dot", { radius: 7, cssClass:"small-blue" } ],
    //         anchor:sourceAnchors,
    //         connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    //     });

    //     // configure the .smallWindows as targets.
    //     instance.makeTarget(smallWindows, {
    //         dropOptions: { hoverClass: "hover" },
    //         anchor:"Top",
    //         endpoint:[ "Dot", { radius: 11, cssClass:"large-green" } ],
    //     });

    //     // and finally connect a couple of small windows, just so its obvious what's going on when this demo loads.           
    //     instance.connect({ source: "sourceWindow1", target: "targetWindow5" });
    //     instance.connect({ source: "sourceWindow1", target: "targetWindow2" });
    // });

    // jsPlumb.fire("jsPlumbDemoLoaded", instance);

    // TODO: show connection info
    var showConn = function (conn) {
        alert("show connection info")
        console.log("connection info: ", conn);
        console.log("Connect output: ", conn.component.source)
        console.log("Connect inputs: ", conn.component.target)
        console.log("Connect output id: ", conn.component.sourceId)
        console.log("Connect inputs id: ", conn.component.targetId)
    }

    var sourceList = {}
    var targetList = {}

    var getEndpointId = function (toId, anchorId) {
        return toId + anchorId;
    }

    window.jsplumbUtils = {

        getUpNodes: function (nodeName) {
            var upList = []

            instance.selectEndpoints({target:nodeName}).each(function(endpoint) {

                // console.log(endpoint)
                

                // endpoint.connections[i].sourceId is node name of source/output
                for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                    console.log("Show up node")
                    console.log(endpoint.connections[i].sourceId)
                    upList.push(endpoint.connections[i].sourceId)
                }
                // 
                

            })

            return upList
        },

        getDownNodes: function (nodeName) {
            var downList = []

            instance.selectEndpoints({source:nodeName}).each(function(endpoint) {

                // console.log(endpoint)
                

                // endpoint.connections[i].sourceId is node name of source/output
                for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                    console.log("Show down node")
                    console.log(endpoint.connections[i].targetId)
                    downList.push(endpoint.connections[i].targetId)
                }
                // 
                

            })

            return downList
        },

        initNode: function(el, node) {

            // initialise draggable elements.
            instance.draggable(el);

            // TODO: user _addEndpoints instead of makeSource/makeTarget
            toId = node.id
            sourceList.toId = targetAnchors = node.inputs
            targetList.toId = sourceAnchors = node.output

            // sourceList.toId = []
            // targetList.toId = []

            for (var i = 0; i < sourceAnchors.length; i++) {
                // var sourceUUID = toId + sourceAnchors[i].id;
                var sourceUUID = getEndpointId(toId, sourceAnchors[i].id);
                console.log("source uuid " + sourceUUID)
                instance.addEndpoint(toId, sourceEndpoint, {
                    // anchor: sourceAnchors[i], 
                    anchor: "Bottom",
                    uuid: sourceUUID, 
                    overlays: [
                    [ "Label", {
                        location: [0.5, 2],
                        label: node.outputType[i],
                        cssClass: "endpointSourceLabel",
                        visible:true
                    } ]
                    ],

                    outputType: node.outputType[i],
                });

                // if (typeof sourceList[node.id] === "undefined" && sourceList[node.id] === null) {
                //     sourceList[node.id] = []
                //     sourceList[node.id][0] = sourceUUID
                // }
                // else {
                    // sourceList.toId[i] = sourceUUID
                // }
            }
            for (var j = 0; j < targetAnchors.length; j++) {
                // var targetUUID = toId + targetAnchors[j].id;
                var targetUUID = getEndpointId(toId, targetAnchors[j].id);
                console.log("targe uuid " + targetUUID)
                instance.addEndpoint(toId, targetEndpoint, { 
                    // anchor: targetAnchors[j], 
                    anchor: [1/(targetAnchors.length+1) * (j + 1), 0, 0, -1],
                    uuid: targetUUID,
                    overlays: [
                    [ "Label", { 
                        location: [0.5, -1], 
                        label: node.inputsType[i], 
                        cssClass: "endpointTargetLabel", 
                        visible:true } ]
                    ], 
                    inputType: node.inputsType[i],
                });

                // if (typeof targetList[node.id] === "undefined" && targetList[node.id] === null) {
                //     targetList[node.id] = []
                //     targetList[node.id][0] = targetUUID
                // }
                // else {
                    // targetList.toId[i] = targetUUID
                // }
            }


            // instance.makeSource(el, {
            //     filter: ".ep",
            //     anchor: "Continuous",
            //     connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
            //     connectionType:"basic",
            //     extract:{
            //         "action":"the-action"
            //     },
            //     maxConnections: 2,
            //     onMaxConnections: function (info, e) {
            //         alert("Maximum connections (" + info.maxConnections + ") reached");
            //     }
            // });

            // instance.makeTarget(el, {
            //     dropOptions: { hoverClass: "dragHover" },
            //     anchor: "Continuous",
            //     allowLoopback: true
            // });

            // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
            // version of this demo to find out about new nodes being added.
            //
            // instance.fire("jsPlumbDemoNodeAdded", el);
        },


        // TODO: new node with drop position: x, y
        // node: a node with default paras, inputs/output, main/sub type,
        newNode: function(x, y, node) {
            var d = document.createElement("div");
            d.className = "window smallWindow nodeForEvent";
            d.id = node.id;
            d.innerHTML = node.name + "<img class='closeNode' src='../static/img/close.png'>";
            d.style.left = x + "px";
            d.style.top = y + "px";
            instance.getContainer().appendChild(d);
            this.initNode(d, node);
            return d;

        },

    };


    // highlight
    // hljs.initHighlightingOnLoad();
});	

// jsPlumb.ready(function () {

    // var instance = window.jsp = jsPlumb.getInstance({
    //     // default drag options
    //     DragOptions: { cursor: 'pointer', zIndex: 2000 },
    //     // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
    //     // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
    //     ConnectionOverlays: [
    //         [ "Arrow", {
    //             location: 1,
    //             visible:true,
    //             width:11,
    //             length:11,
    //             id:"ARROW",
    //             events:{
    //                 click:function() { alert("you clicked on the arrow overlay")}
    //             }
    //         } ],
    //         [ "Label", {
    //             location: 0.1,
    //             id: "label",
    //             cssClass: "aLabel",
    //             events:{
    //                 tap:function() { alert("hey"); }
    //             }
    //         }]
    //     ],
    //     Container: "canvas"
    // });

    // var basicType = {
    //     connector: "StateMachine",
    //     paintStyle: { stroke: "red", strokeWidth: 4 },
    //     hoverPaintStyle: { stroke: "blue" },
    //     overlays: [
    //         "Arrow"
    //     ]
    // };
    // instance.registerConnectionType("basic", basicType);

    // // this is the paint style for the connecting lines..
    // var connectorPaintStyle = {
    //         strokeWidth: 2,
    //         stroke: "#61B7CF",
    //         joinstyle: "round",
    //         outlineStroke: "white",
    //         outlineWidth: 2
    //     },
    // // .. and this is the hover style.
    //     connectorHoverStyle = {
    //         strokeWidth: 3,
    //         stroke: "#216477",
    //         outlineWidth: 5,
    //         outlineStroke: "white"
    //     },
    //     endpointHoverStyle = {
    //         fill: "#216477",
    //         stroke: "#216477"
    //     },
    // // the definition of source endpoints (the small blue ones)
    //     sourceEndpoint = {
    //         endpoint: "Dot",
    //         paintStyle: {
    //             stroke: "#7AB02C",
    //             fill: "transparent",
    //             radius: 3,
    //             strokeWidth: 1
    //         },
    //         isSource: true,
    //         connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    //         connectorStyle: connectorPaintStyle,
    //         hoverPaintStyle: endpointHoverStyle,
    //         connectorHoverStyle: connectorHoverStyle,
    //         dragOptions: {},
    //         overlays: [
    //             [ "Label", {
    //                 location: [0.5, 2.5],
    //                 label: "Drag",
    //                 cssClass: "endpointSourceLabel",
    //                 visible:true
    //             } ]
    //         ]
    //     },
    // // the definition of target endpoints (will appear when the user drags a connection)
    //     targetEndpoint = {
    //         endpoint: "Dot",
    //         paintStyle: { fill: "#7AB02C", radius: 3 },
    //         hoverPaintStyle: endpointHoverStyle,
    //         maxConnections: -1,
    //         dropOptions: { hoverClass: "hover", activeClass: "active" },
    //         isTarget: true,
    //         overlays: [
    //             [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
    //         ]
    //     },
        // init = function (connection) {
        //     connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        // };

    // var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
    //     for (var i = 0; i < sourceAnchors.length; i++) {
    //         var sourceUUID = toId + sourceAnchors[i];
    //         instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
    //             anchor: sourceAnchors[i], uuid: sourceUUID
    //         });
    //     }
    //     for (var j = 0; j < targetAnchors.length; j++) {
    //         var targetUUID = toId + targetAnchors[j];
    //         instance.addEndpoint("flowchart" + toId, targetEndpoint, { 
    //             anchor: targetAnchors[j], 
    //             uuid: targetUUID,
    //             overlays: [
    //                 [ "Label", {
    //                     location: [0.5, 1.5],
    //                     label: "Drag",
    //                     // cssClass: "endpointSourceLabel",
    //                     // visible:true
    //                 } ]
    //             ]
    //         });
    //     }
    // };

    // suspend drawing and initialise.
    // instance.batch(function () {

        // _addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        // _addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        // _addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
        // _addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        // instance.bind("connection", function (connInfo, originalEvent) {
        //     init(connInfo.connection);
        // });

        // make all the window divs draggable
        // instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

        // connect a few up
        // instance.connect({uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true});
        // instance.connect({uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true});
        // instance.connect({uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true});
        // instance.connect({uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true});
        // instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true});
        // instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true});
        //

        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        // instance.bind("click", function (conn, originalEvent) {
        //    // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
        //      //   instance.detach(conn);
        //     conn.toggleType("basic");

        // });

//         instance.bind("connectionDrag", function (connection) {
//             console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
//         });

//         instance.bind("connectionDragStop", function (connection) {
//             console.log("connection " + connection.id + " was dragged");
//         });

//         instance.bind("connectionMoved", function (params) {
//             console.log("connection " + params.connection.id + " was moved");
//         });
//     });

//     jsPlumb.fire("jsPlumbDemoLoaded", instance);

// });