// 0. common vars
var connectionOverlays = [
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
        cssClass: "connectionLabel",
        events:{
            tap:function() { 
                // alert("Connection From A to B"); 
                showConn(this)
            }
        }
    }]
]

var dragOptions = { cursor: "pointer", zIndex: 2000 }

// this is the paint style for the connecting lines..
var connectorPaintStyle = {
    strokeWidth: 3,
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
        stroke: "#61B7CF",
        fill: "transparent",
        radius: 6,
        strokeWidth: 1,
    },
    maxConnections: -1,
    isSource: true,
    // TODO: use default instead of "Flowchart"
    // connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},

};
// the definition of target endpoints (will appear when the user drags a connection)
// target --> input
var targetEndpoint = {
    endpoint: "Dot",
    paintStyle: { 
        fill: "#61B7CF", 
        radius: 6,
    },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: 1,
    dropOptions: { hoverClass: "hover", activeClass: "active" },
    isTarget: true,

};

// toggle connection type
var basicType = {
    connector: "StateMachine",
    paintStyle: { stroke: "red", strokeWidth: 4 },
    hoverPaintStyle: { stroke: "blue" },
    overlays: [
        "Arrow"
    ]
};

// init one jsPlumb instance, return it and add to jsplumbList!!!
// bind event in init
function initJsPlumb(container) {
    var instance = window.instance = jsPlumb.getInstance({
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: connectionOverlays,
        // drag options
        DragOptions: dragOptions,
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
        Container: container
    });


    // TODO: click event -> 1.click "x" close node 2.click node show info
    // // click listener for the enable/disable link in the source box (the blue one).

    // click node event
    instance.on($("#" + container), "click", ".nodeForEvent", function (e) {

        if (typeof e.srcElement.id === "undefined" || e.srcElement.id === null || e.srcElement.id == "") {
            // alert("nothing")
            return
        } 

        // alert("e.srcElement.id" + e.srcElement.id)
        var nodeId = e.srcElement.id
        var node = getNodeById(currentWidgetId, nodeId) // use currentWidgetId, because it is user's action, so, it must be fore-end

        if (typeof node === "undefined" || node === null) {
            clearNodeInfo()
        }
        else {
            showNodeInfo(node)

        }

        // console.log(node)

        // TODO: get all nodes connected TO this node show connected nodes
        // jsplumbUtils.getUpNodes(nodeId)


        // TODO: get all nodes connected FROM this node show connected nodes
        // jsplumbUtils.getDownNodes(nodeId)

        setCurrentNode(nodeId)

        console.log("current node is " + currentNodeId)

        jsPlumbUtil.consume(e);

    });

    // change node name
    instance.on($("#" + container), "dblclick", ".nodeForEvent", function (e) {
        // alert("double")

        console.log(e.target.id)
        var nodeId = e.target.id
        var node = getNodeById(currentWidgetId, nodeId)
        console.log(node)
        // console.log($(this))

        var d = document.getElementById(e.target.id)
        var inputId = "changeNameInput"

        d.innerHTML = "<input type='text' class='form-control' id=" + inputId + ">"

        $("#changeNameInput").click(function() { return false; }); 
        $("#changeNameInput").trigger("focus"); 
        $("#changeNameInput").blur(function () {
            console.log("change node name")
            console.log(node)
            var newName = $("#changeNameInput").val()
            if (newName !== "") {
                node.name = newName
            }

            if (node.type == "node") {
                d.innerHTML = node.name +
                    "<img class='closeNode' src='../static/img/close.png'>";
            }
            else if (node.type == "widget") {
                d.innerHTML = "<img class='inNode' src='../static/img/in.png'>" + 
                    node.name +
                    "<img class='closeNode' src='../static/img/close.png'>";
            }

            updateWidgetTabName(node)
        })
       

        jsPlumbUtil.consume(e);

    });



    // // click listener for close node
    instance.on($("#" + container), "click", ".closeNode", function (e) {
        
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


        instance.remove(toId);

        // var state = instance.toggleTargetEnabled(targetDiv);
        // this.innerHTML = (state ? "disable" : "enable");
        // jsPlumb[state ? "removeClass" : "addClass"](targetDiv, "element-disabled");
        alert("close and current node id is " + currentNodeId)

        
        // delete var
        pushDelVar(getNodeById(currentWidgetId, toId)) // use currentWidgetId, because it is user's action, so, it must be fore-end

        // remove node from this widget list
        delNodeFromWidget(currentWidgetId, toId)
        console.log("current widget is !!!!")
        console.log(widgetList)


        jsPlumbUtil.consume(e);
    });


    // // click listener for enter widget
    instance.on($("#" + container), "click", ".inNode", function (e) {
        
        var targetDiv = (e.target || e.srcElement).parentNode;
        // console.log(e)
        // console.log("targetDiv " + targetDiv.id)

        toId = targetDiv.id
        alert(toId)
        console.log("enter widget!!!!!!!!")
        console.log(getNodeById(currentWidgetId, toId))

        enterWidgetFromNode(getNodeById(currentWidgetId, toId))

        jsPlumbUtil.consume(e);
    });


    // connection func
    // BUG: TODO: default, instance is current widget's instance, not running widget
    // because, we first switch to current widget and its instance, then connect something...
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
        console.log("instance container")
        console.log(instance.getContainer())
        initConnection(instance, connInfo.connection);

        // TODO: 
        console.log("connInfo")
        console.log(connInfo)
        // connectionAdded(connInfo.endpoints)
        connectionAdded(connInfo.sourceId, connInfo.sourceEndpoint, connInfo.targetId, connInfo.targetEndpoint)
    });

    // detach func
    instance.bind("connectionDetached", function (connInfo, originalEvent) {
        alert("detach")    


        // TODO: 1. remove input from target
        // NO NEED: get inputs when run node!!!

        // TODO: 2. set nodes idle
        console.log("connectionDetached")
        console.log(connInfo)
        var nodeId = connInfo.connection.targetId
        setDownNodesIdle(currentWidgetId, nodeId)

        // TODO: 
        connectionDetached(connInfo.sourceId, connInfo.sourceEndpoint, connInfo.targetId, connInfo.targetEndpoint)
    })



    instance.registerConnectionType("basic", basicType);

    instance.bind("click", function (conn, originalEvent) {
        conn.toggleType("basic");
    });


    return instance
}

// BUG: TODO: default, instance is current widget's instance, not running widget
// because, we first switch to current widget and its instance, then connect something...
// TODO: Debug: bind to a connection event, just for the purposes of pointing out that it can be done.
var initConnection = function (instance, connection) {

    var sourceNodeId = connection.sourceId
    // var targetNodeId = connection.targetId

    var sourceNode = getNodeById(currentWidgetIdRunning, sourceNodeId) // // use currentWidgetIdRunning, because it can be back-end
    // var targetNode = getNodeById(targetNodeId)

    // TODO: 1. set label source output name
    console.log(sourceNode)
    jsplumbUtils.setConnectionLabels(instance, sourceNode)

    // TODO: 2. set target node input of source output name
    // NO NEED: get inputs when run node

};

// TODO: show connection info
var showConn = function (conn) {
    alert(conn.label)
    // alert("show connection info")
    console.log("connection info: ", conn);
    console.log("Connect output: ", conn.component.source)
    console.log("Connect inputs: ", conn.component.target)
    console.log("Connect output id: ", conn.component.sourceId)
    console.log("Connect inputs id: ", conn.component.targetId)
}


var jsplumbUtils = {
    getCurrentConnections: function (instance) {
        return instance.getConnections()
    },

    emptyCanvas: function (instance) {
        instance.empty(instance.getContainer())
    },

    initWidgetJsPlumb: function (instance, endpointList) {
        // TODO: !!!!!!!!!!
        console.log("endpointList")
        console.log(endpointList)
        // suspend drawing and initialise.
        instance.batch(function () {
            for (var i = endpointList.length - 1; i >= 0; i--) {
                instance.connect({uuids: endpointList[i], editable: true});
            }

        });
    },

    repaintJsplumb: function (instance, nodeList) {

        instance.setSuspendDrawing(true);
        // ...
        // - load up all your data here -
        // ...
        instance.setSuspendDrawing(false, true);


        // instance.batch(function () {


        // })
    },


    // BUG: TODO: default, instance is current widget's instance, not running widget
    // because, we first switch to current widget and its instance, then connect something...
    setConnectionLabels: function (instance, sourceNode) {
        var downConnection = this.getDownConnections(instance, sourceNode.id)

        console.log(sourceNode)

        var outputIds = sourceNode.output.id
        var outputDefaults = sourceNode.output.default

        console.log("setConnectionLabels!!!!!!!!!!")
        console.log(outputIds)
        console.log(outputDefaults)
        console.log(downConnection)

        for (var i = outputIds.length - 1; i >= 0; i--) {
            var connections = downConnection[outputIds[i]]

            if (connections != null) {
                for (var j = connections.length - 1; j >= 0; j--) {
                    connections[j].getOverlay("label").setLabel(
                        outputDefaults[i]);
                }
            }
          
        }

    },


    getNodeEndpoints: function (instance, nodeId) {
        var endpointList = []

        instance.selectEndpoints({target:nodeId}).each(function(endpoint) {
            endpointList.push(endpoint)
        })

        return endpointList
    },

    getOutInPairsFromEps: function (instance, nodeId) {
        // CAUTION: 
        // There are no outputJsDefault!!! Because, it could be changed!!! 
        // So, output-input pair like: data1=inputDataFile0data
        // comes from: 
        // 1. inputJsName: each endpoint(input) of this TARGET node
        // 2. upNode.output.default[index]: index from outputJsId of output id!!! 
        // This could refactor!!!

        var upInputList = []
        var upOutputList = []
                   

        instance.selectEndpoints({target:nodeId}).each(function(endpoint) {

            console.log("Show up node!!!!!!!!!!!!! And output pair")
            console.log(endpoint)

            var upNodeOutputId = null

            // upInputList.push(endpoint.inputJsId)

            // CAUTION: only ONE up node connected to this input, or something wrong 
            var conn = endpoint.connections[0]
            for (var i = conn.endpoints.length - 1; i >= 0; i--) {
                var ep = conn.endpoints[i]
                // if (!(typeof ep.inputJsId === "undefined" || ep.inputJsId === null)) {
                //     upInputList.push(ep.inputJsId)
                // }
                if (!(typeof ep.outputJsId === "undefined" || ep.outputJsId === null)) {
                    upNodeOutputId = ep.outputJsId
                }
            }


            upInputList.push(endpoint.inputJsName)

            // endpoint.connections[i].sourceId is node name of source/output
            
            console.log(conn)
            console.log(conn.sourceId)
            var upNode = getNodeById(currentWidgetIdRunning, conn.sourceId)

            var index = upNode.output.id.indexOf(upNodeOutputId)
            upOutputList.push(upNode.output.default[index])

        })

        console.log(upInputList)
        console.log(upOutputList)

        return {upInputList: upInputList, upOutputList: upOutputList}

    },

    getUpConnections: function (instance, nodeId) {
        var upConnectionDict = {}

        instance.selectEndpoints({target:nodeId}).each(function(endpoint) {

            // console.log(endpoint)

            // endpoint.connections[i].sourceId is node name of source/output
            // up connection MUST BE 1!!!
            if (endpoint.connections.length > 0) {
                for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                    console.log("Show up connections")
                    console.log(endpoint.connections[i])
                    upConnectionDict[endpoint.inputJsId] = (endpoint.connections[i])
                }
            }
            else {
                upConnectionDict[endpoint.inputJsId] = null
            }

        })

        return upConnectionDict
    },

    getDownConnections: function (instance, nodeId) {
        // each endpoint from output, connect n nodes!
        // so it is a 2-d array!

        var downConnectionDict = {}

        instance.selectEndpoints({source:nodeId}).each(function(endpoint) {

            // console.log(endpoint)
            
            if (endpoint.connections.length > 0) {
                var epConnectList = []

                // endpoint.connections[i].sourceId is node name of source/output
                for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                    console.log("Show down node")
                    console.log(endpoint.connections[i])
                    epConnectList.push(endpoint.connections[i])
                }

                downConnectionDict[endpoint.outputJsId] = epConnectList 
            }
            else {
                downConnectionDict[endpoint.outputJsId] = null
            }


        })



        return downConnectionDict
    },

    getUpNodesList: function (instance, nodeId) {
        var upList = []

        instance.selectEndpoints({target:nodeId}).each(function(endpoint) {

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

    getUpNodesDict: function (instance, nodeId) {
        var upDict = []

        instance.selectEndpoints({target:nodeId}).each(function(endpoint) {

            // console.log(endpoint)
            

            // endpoint.connections[i].sourceId is node name of source/output
            for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                console.log("Show up node")
                console.log(endpoint.connections[i].sourceId)
                // upList.push(endpoint.connections[i].sourceId)
                upDict[endpoint.inputJsId] = endpoint.connections[i].sourceId
            }
            // 
            

        })

        return upDict
    },

    getDownNodesList: function (instance, nodeId) {
        // each endpoint from output, connect n nodes!
        // so it is a 2-d array!
        var downList = []

        instance.selectEndpoints({source:nodeId}).each(function(endpoint) {

            // console.log(endpoint)
            var epNodeList = []

            // endpoint.connections[i].sourceId is node name of source/output
            for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                console.log("Show down node")
                console.log(endpoint.connections[i].targetId)
                epNodeList.push(endpoint.connections[i].targetId)
            }
            // 
            
            downList.push(epNodeList)

        })

        return downList
    },

    getDownNodesDict: function (instance, nodeId) {
        // each endpoint from output, connect n nodes!
        // so it is a 2-d array!
        var downDict = {}

        instance.selectEndpoints({source:nodeId}).each(function(endpoint) {

            // console.log(endpoint)
            var epNodeList = []

            // endpoint.connections[i].sourceId is node name of source/output
            for (var i = endpoint.connections.length - 1; i >= 0; i--) {
                console.log("Show down node")
                console.log(endpoint.connections[i].targetId)
                epNodeList.push(endpoint.connections[i].targetId)
            }
            // 
            
            downDict[endpoint.outputJsId] = epNodeList

        })

        return downDict
    },

    initNode: function(instance, el, node) {

        // initialise draggable elements.
        instance.draggable(el);

        // TODO: user _addEndpoints instead of makeSource/makeTarget
        toId = node.id
        targetAnchors = node.input
        sourceAnchors = node.output

        // output length is 0, change to sourceAnchors.length if needed
        for (var i = 0; i < node.output.count; i++) {
            var sourceUUID = sourceAnchors.id[i]
            console.log("source uuid " + sourceUUID)
            var ep = instance.addEndpoint(toId, sourceEndpoint, {
                // anchor: sourceAnchors[i], 
                anchor: [1/(node.output.count+1) * (i + 1), 1, 0, 1],
                uuid: sourceUUID, 
                overlays: [
                [ "Label", {
                    location: [0.5, 2],
                    // label: sourceAnchors.type[i],
                    // TODO: use name to label endpoint, and check type backgournd
                    label: sourceAnchors.name[i],
                    cssClass: "endpointSourceLabel",
                    visible:true
                } ]
                ],

            });

            ep.outputJsId = sourceAnchors.id[i]

        }
        for (var j = 0; j < node.input.count; j++) {
            var targetUUID = targetAnchors.id[j]
            console.log("targe uuid " + targetUUID)
            var ep = instance.addEndpoint(toId, targetEndpoint, { 
                // anchor: targetAnchors[j], 
                anchor: [1/(node.input.count+1) * (j + 1), 0, 0, -1],
                uuid: targetUUID,
                overlays: [
                [ "Label", { 
                    location: [0.5, -1], 
                    // label: targetAnchors.type[j], 
                    label: targetAnchors.name[j], 
                    cssClass: "endpointTargetLabel", 
                    visible:true } ]
                ], 
            });

            ep.inputJsId = targetAnchors.id[j]
            ep.inputJsName = targetAnchors.name[j]

        }


    },


    // TODO: new node with drop position: x, y
    // node: a node with default paras, inputs/output, main/sub type,
    newNode: function(instance, x, y, node) {


        var d = document.createElement("div");
        d.className = "window smallWindow nodeForEvent";
        d.id = node.id;
        if (node.type == "node") {
            d.innerHTML = node.name +
                "<img class='closeNode' src='../static/img/close.png'>";
        }
        else if (node.type == "widget") {
            d.innerHTML = "<img class='inNode' src='../static/img/in.png'>" + 
                node.name +
                "<img class='closeNode' src='../static/img/close.png'>";
        }

        d.style.left = x + "px";
        d.style.top = y + "px";
        d.style.border = '3px solid ' + getNodeColorById(currentWidgetId, node.id)


        var disLength = node.name.length * 8 + 64
        // alert(disLength)
        var inLength = (node.input.count + 1) * 50
        var outLength = (node.output.count + 1) * 50
        var maxLength = Math.max.apply(Math,[disLength, inLength, outLength])

        // alert(maxLength)
        d.style.width =  maxLength + "px"

        instance.getContainer().appendChild(d);


        this.initNode(instance, d, node);

        return d;

    },

};


/*
jsPlumb.ready(function () {

    var instance = window.instance = jsPlumb.getInstance({
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: connectionOverlays,
        // drag options
        DragOptions: dragOptions,
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
        Container: "myCanvas"
    });



    // TODO: click event -> 1.click "x" close node 2.click node show info
    // // click listener for the enable/disable link in the source box (the blue one).

    // click node event
    instance.on($("#myCanvas"), "click", ".nodeForEvent", function (e) {

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
        // jsplumbUtils.getUpNodes(nodeId)


        // TODO: get all nodes connected FROM this node show connected nodes
        // jsplumbUtils.getDownNodes(nodeId)




        setCurrentNode(nodeId)


        console.log("current node is " + currentNodeId)

        jsPlumbUtil.consume(e);

    });

    // // click listener for enable/disable in the small green boxes
    instance.on($("#myCanvas"), "click", ".closeNode", function (e) {
        

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


        instance.remove(toId);

        // var state = instance.toggleTargetEnabled(targetDiv);
        // this.innerHTML = (state ? "disable" : "enable");
        // jsPlumb[state ? "removeClass" : "addClass"](targetDiv, "element-disabled");
        alert("close and current node id is " + currentNodeId)

        jsPlumbUtil.consume(e);
    });

    // TODO: Debug: bind to a connection event, just for the purposes of pointing out that it can be done.
    var initConnection = function (connection) {


        var sourceNodeId = connection.sourceId
        // var targetNodeId = connection.targetId

        var sourceNode = getNodeById(sourceNodeId)
        // var targetNode = getNodeById(targetNodeId)

        // TODO: 1. set label source output name
        jsplumbUtils.setConnectionLabels(sourceNode)

        // TODO: 2. set target node input of source output name
        // NO NEED: get inputs when run node

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


        // TODO: 1. remove input from target
        // NO NEED: get inputs when run node!!!

        // TODO: 2. set nodes idle
        console.log("connectionDetached")
        console.log(connInfo)
        var nodeName = connInfo.connection.targetId
        setDownNodesIdle(nodeName)
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


    // highlight
    // hljs.initHighlightingOnLoad();
});	

*/
