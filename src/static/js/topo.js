
/////////////////////////////////////////////////////////////////
// TODO: global object instance hold these vars...
var STATUS = {
    IDLE : 0, // rgba(255, 255, 255, 0.2)
    BUSY : 1, // rgba(255, 0, 0, 0.2)
    DONE : 2, // rgba(0, 255, 0, 0.2)
    WAIT : 3, // rgba(255, 255, 111, 0.2)
}

var COLORSTATUS = {
    IDLE : "rgba(242, 242, 242, 0.9)",
    BUSY : "rgba(255, 0, 0, 0.4)",
    DONE : "rgba(0, 255, 0, 0.2)",
    WAIT : "rgba(255, 255, 111, 0.3)",
}

var COLORNODE = {
    "Data"        : "rgba(76,175,80,1)",
    "Model"       : "rgba(52,103,137, 1)",
    "Evaluate"    : "rgba(0,191,255,1)",
    "Visualize"   : "rgba(255,215,0,1)",
    "Customize"   : "rgba(139,69,19,1)",
    "Keras"       : "rgba(208,0,0,1)",
}

var COLORALERT = {
    INFO    : "rgba(76,175,80,1)",
    ALERT   : "rgba(208,0,0,1)",
}

var runNodesList = []
var runNodeMessage = []
var runDelVarList = []
var kernelId = ""
var nodeListByName = {}

var currentNodeId = null
var currentStatus = STATUS.IDLE

var widgetList = {}
var currentWidgetId = null // fore-end user widget 
var currentInstance = null
var currentWidgetIdRunning = null // back-end running widget
var currentInstanceRunning = null


var defaultNodeId = null
var defaultWidgetId = null
var defaultTabId = null

/////////////////////////////////////////////////////////////////

function moveNodes() {
    for (var key in nodeListByName) {
        console.log($('#' + key))
        // $('#' + key).style.left = "100px"
        document.getElementById(key).style.left = "-100px"
    }

    jsplumbUtils.repaintJsplumb(window.instance, {})
}

function run() {
    // alert("runrunrunrunrunrunrunrunrunrunrunrunrunrun")
    $.amaran({content: {color: COLORALERT.INFO, message: 'Running!', position: 'bottom right'}, inEffect: "slideRight"})

    // TODO : OK!: test for down side nodes idle

    // 0. switch run/stop
    if (currentStatus == STATUS.IDLE) {
        currentStatus = STATUS.BUSY
        runFlow()
    }
    else {
        stopFlow()
    }
}



function runFlow() {
    // _2.5 TODO: test for node parallel task
    runGraph()

    var node = {}
    // 0. check current node to run
    if (currentNodeId == null) {
        // alert("Please choose a node!")
        // $.amaran({content: {color: COLORALERT.ALERT, message: 'Please choose a node!', position: 'bottom right'}, inEffect: "slideRight"})

        // runFlowDone()
        // return true

        // if current node is null, then run all with pseudo node.
        node.type = "widget"
        node.id = getNodeIdFromWidgetId(currentWidgetId)
    }
    else {
        // TODO: unshift up nodes until all is start node!!!
        node = getNodeById(currentWidgetId, currentNodeId)

        // 1. this node is done, then just show the info
        if (node.status == STATUS.DONE) {
            showNodeInfo(node)
            runFlowDone()
            return true
        }
    }


    // TODO : OK!: can not run widget!!!

    // get all node, from widget to widget!
    var enqueueFlag = getRunQueueFromNode(node)

    if (runNodesList.length == 0) {
        runFlowDone()
    }
    else {

        if (!enqueueFlag) {
            showNodeInfo(runNodesList[0])
            runFlowDone()
            // alert("Some nodes need inputs! Please check!")
            $.amaran({content: {color: COLORALERT.ALERT, message: 'Some nodes need inputs! Please check!', position: 'bottom right'}, inEffect: "slideRight"})
            return true
        }

        console.log("run nodes list is ")
        console.log(runNodesList)


        // 2.2 get enqueue list then change icon to stop
        $("#run_button_img").attr("src", "../static/img/stop.png"); 

        // 2.3 change nodes color for wait
        for (var i = runNodesList.length - 1; i >= 0; i--) {
            setNodeRunStatus(runNodesList[i], STATUS.WAIT)
        }


        // 2.4 first run del var/import
        runDelVar()

        // 2.5 run nodes upside-down, one-by-one
        runOneStep(runNodesList[0])
    }

    
}

function getAllNodes(node, nodeList) {
    if (node.type == "widget") {
        var widget = getWidgetById(getWidgetIdFromNodeId(node.id))
        for (var nodeId in widget.nodes) {
            console.log("node in widget")
            console.log(nodeId)
            var newNode = widget.nodes[nodeId]
            getAllNodes(newNode, nodeList)
        }
    }
    else {
        nodeList.push(node)
    }

    return nodeList
}

function getRunQueueFromNode(node) {

    // console.log("upInfo")
    // console.log(upInfo)
    runNodesList = []
    var runQueue = []

    var nodes = getAllNodes(node, [])

    runQueue = nodes.slice(0)
    runNodesList = nodes.slice(0)
    delete nodes

    var enqueueFlag = true

    while (!(runQueue.length == 0)) {
        var node = runQueue.shift()
        
        // TODO: when in widget, get all up nodes/widget
        // @deprecated
        // var upNodeList = getUpNodes(currentInstanceRunning, node.id)
        var upNodeList = []
        // if (!(typeof upInfo[node.id] == "undefined" || upInfo[node.id] == null)) {
        //     upNodeList = upInfo[node.id].nodes
        // }
        for (var i = 0; i < node.input.value.length; i++) {
            var input = node.input.value[i]
            if (!(typeof input == "undefined" || input == null)) {
                input.index = i
                upNodeList.push(input)
            }
        }

        // check whether all inputs feeded
        if (upNodeList.length != node.input.count) {
            enqueueFlag = false
            runQueue = []
            break
        }
        else { 
            // if inputs OK, then assemble inputs

            // 1.1 get pair from endpoint

            // 1.2 assemble input output


            var inputAssembleList = {}
            // 1. get pair from input, and push to run queue
            for (var i = 0; i < upNodeList.length; i++) {
                var input = upNodeList[i]
                var upNode = getNodeById(input.widgetId, input.nodeId)
                // TODO: need not use found... enqueue all the input, and uplift the input
                // when run node, if already done, then ignore
                // but, what if cycle?
                if (upNode.status == STATUS.IDLE) {
                    runQueue.push(upNode)
                    runNodesList.unshift(upNode)
                }

                inputAssembleList[node.input.name[input.index]] = input.outputId
            }


            // 2. get pair from default
            for (var i = 0; i < node.input.default.length; i++) {
                // inputAssembleList.push(node.input.name[node.input.count + i] + "=" + node.input.default[i])
                inputAssembleList[node.input.name[node.input.count + i]] = node.input.default[i]
            }

            // 3. set node input value
            node.input.valuePair = inputAssembleList
            
            console.log(node)
        }



        // console.log(runQueue.length)
    }

    console.log("getRunQueueFromNode")
    console.log(runNodesList)
    return enqueueFlag
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}


function stopFlow() {
    // TODO: stop current flow

    var getResponse = function (result) {
        console.log("get stop command")
        console.log(result)

        // 2. reset run node list, left last node
        // clearNodeInfo()
        // $("#func-output").append(result.statusText);
        // alert(result.statusText)

        // . all done
        runFlowDone()

        $.amaran({content: {color: COLORALERT.ALERT, message: 'Running stoped!', position: 'bottom right'}, inEffect: "slideRight"})

    }

    // 1. send stop message
    _xsrf = getCookie("_xsrf");

    console.log(_xsrf)
    console.log("send stop command")

    $.ajax({
        url: "http://localhost:8008/run_command",
        data: { "_xsrf": _xsrf, "command": "stop", "kernelId": kernelId },
        type: 'post',
        dataType: 'json',
        success: function(ret){
           getResponse(ret)
        },
        error: function(ret){
           getResponse(ret)
        }
    })

}

function runDelVar() {
    // TODO: run del var as script
}

function getAssembleId(widgetId, nodeId) {
    return widgetId + "_" + nodeId
}

function getIdsFromAssembleId(id) {
    return id.split("_")
}

function runGraph() {
    // TODO: go here PARALLEL!!!
    return 

    // TODO: pseudo node
    var node = {}
    node.type = "widget"
    node.id = getNodeIdFromWidgetId(currentWidgetId)
    var nodes = getAllNodes(node, [])
    console.log("run graph")
    console.log(nodes)

    var nodesId = []
    var edges = []

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        var nodeAssembleId = getAssembleId(node.widgetId, node.id)

        nodesId.push(nodeAssembleId)

        for (var j = 0; j < node.input.value.length; j++) {
            if (node.input.value[j] !== null && node.input.value[j] !== undefined) {
                edges.push([getAssembleId(node.input.value[j].widgetId, node.input.value[j].nodeId), nodeAssembleId])

            }
        }
    }    

    console.log(nodesId)
    console.log(edges)
    console.log(getIdsFromAssembleId(edges[0][0]))

    var uid = getFlowId("testwidget", node.id)

    var content = {
            "nodesId": nodesId,
            "edges": edges,
            "nodes": {},
            "delete": runDelVarList,
        }

    for (var i = 0; i < nodesId.length; i++) {
        var nodeAssembleId = nodesId[i]
        var widgetIdnodeId = getIdsFromAssembleId(nodeAssembleId)
        var node = getNodeById(widgetIdnodeId[0], widgetIdnodeId[1])
        content["nodes"][nodeAssembleId] = {
            widget: node.widgetId,
            node: node.id,
            module: node.module,
            func: node.func,
            input: node.input.valuePair,
            output: node.output.default,
        }
    }


    // content["nodes"] =  {
    //     widget: node.widgetId,
    //     node: node.id,
    //     module: node.module,
    //     func: node.func,
    //     input: node.input.valuePair,
    //     output: node.output.default,
    //     delete: runDelVarList,
    // }

    var flow = getScript(uid, "graph", content)

    runNodeMessage[uid] = flow

    // 4. send this message
    var message = JSON.stringify(flow)
    console.log("send graph")
    updater.socket.send(message);

}

// TODO: 
function getScript(uid, channel, content) {

    var flow = {
        "id": uid,
        "kernelId": kernelId,
        "channel": channel,
        "content": content,
    }

    return flow
}

function getFlowId(widgetId, nodeId) {
    return widgetId + nodeId + new Date().getTime()
}

function runOneStep(node) {

    // 0. if stop run, then return
    if (currentStatus == STATUS.IDLE) return

    // 1. if already done, then return
    if (node.status == STATUS.DONE) {
        
        // TODO: already done, then run next!!!
        runOneStepDone(null)
        return true
    }

    // 2. assemble flow message

    pushDelVar(node)

    var content = {
        widget: node.widgetId,
        node: node.id,
        module: node.module,
        func: node.func,
        input: node.input.valuePair,
        output: node.output.default,
        delete: runDelVarList,
    }

    // var uid = node.widgetId + node.id + new Date().getTime()
    var uid = getFlowId(node.widgetId, node.id)
    // alert(uid)

    // var flow = {
    //     "id": uid,
    //     "kernelId": kernelId,
    //     "channel": "flow",
    //     "content": content,
    // }

    var flow = getScript(uid, "flow", content)

    runNodeMessage[uid] = flow

    // 3. set current node busy
    setNodeRunStatus(node, STATUS.BUSY)

    // 4. send this message
    var message = JSON.stringify(flow)
    console.log()
    updater.socket.send(message);

    // 5. runDelVarList set empty
    clearDelVar()
    

    return true
}

function runOneStepDone(message) {
    console.log("run result message!!!!!!!!")
    console.log(message)

    var node = runNodesList.shift()

    if (message != null && node !== undefined && node !== null) {
        var status = message.status

        // TODO:GET AND SET FIRST OUTPUT VALUE
        node.output.value = []
        for (var i = 0; i < node.output.default.length; i++) {
            var outputName = node.output.default[i]

            // console.log("message.content[outputName]")
            // console.log(message.content[outputName])
            if (typeof node.output.value[i] != "undefined" || node.output.value[i] != null) {
                node.output.value[i] = (node.output.value[i] + message.content[outputName])
            }
            else {
                node.output.value[i] = message.content[outputName]
            }

            
        }

        // TODO: func error should show out
        node.output.value[0] = message.content["func"] + node.output.value[0]


        console.log("node run one step result")
        console.log(node)

        if (status == "ok") {
            setNodeRunStatus(node, STATUS.DONE)

            $.amaran({content: {color: COLORALERT.INFO, message: 'Run ' + node.name + ' done!', position: 'bottom right'}, inEffect: "slideRight"})
        }
        else if (status == "error") {
            setDownNodesIdle(node.widgetId, node.id)
            runFlowDone()

            $.amaran({content: {color: COLORALERT.ALERT, message: 'Run ' + node.name + ' error!', position: 'bottom right'}, inEffect: "slideRight"})
        }
    }

    showNodeInfo(node)

    if (runNodesList.length == 0) {
        runFlowDone()
    }
    else {
        runOneStep(runNodesList[0])
    }

}

function runFlowDone() {
    // 0. set status
    currentStatus = STATUS.IDLE

    // 1. set image
    $("#run_button_img").attr("src", "../static/img/run.png"); 

    // 2. for all nodes in run list, set idle
    for (var i = 0; i < runNodesList.length; i++) {
        setNodeRunStatus(runNodesList[i], STATUS.IDLE)
    }

    runNodesList = []

    $.amaran({content: {color: COLORALERT.INFO, message: 'Running all done!', position: 'bottom right'}, inEffect: "slideRight"})
}

function setNodeRunStatus(node, status) {

    // 0. set status
    node.status = status

    // 1. node is in the widget?!
    var widgetId = node.widgetId
    var nodeId = node.id
    while (true) {
        nId = "#" + nodeId

        if ($(nId).length > 0){ 

            if (status == STATUS.WAIT) {
                $(nId).css("background-color", COLORSTATUS.WAIT)

            }
            else if (status == STATUS.BUSY) {
                $(nId).css("background-color", COLORSTATUS.BUSY)

            }
            else if (status == STATUS.DONE) {
                $(nId).css("background-color", COLORSTATUS.DONE)

            }
            else if (status == STATUS.IDLE) {
                $(nId).css("background-color", COLORSTATUS.IDLE)

            }
            
        }

        // TODO: stop search when source node status == node status?!
        var widget = getWidgetById(widgetId)
        if (widget === undefined || widget === null) {
            break
        }

        var sourceNodeId = widget.sourceNodeId
        if ((sourceNodeId === undefined) || (sourceNodeId === null)) {
            break
        }

        nodeId = widget.sourceNodeId
        widgetId = widget.sourceId


    }
}


function setCurrentNode(nodeId) {
    $("#"+currentNodeId).css("box-shadow", "")
    $("#"+currentNodeId).css("-o-box-shadow", "")
    $("#"+currentNodeId).css("-webkit-box-shadow", "")
    $("#"+currentNodeId).css("-moz-box-shadow", "")

    currentNodeId = nodeId

    if (nodeId == "" || nodeId == null) {

    }
    else {

        $("#"+currentNodeId).css("box-shadow", "2px 2px 16px #444")
        $("#"+currentNodeId).css("-o-box-shadow", "2px 2px 16px #444")
        $("#"+currentNodeId).css("-webkit-box-shadow", "2px 2px 16px #444")
        $("#"+currentNodeId).css("-moz-box-shadow", "2px 2px 16 px #fff")
    }
}

function getNodeColorById(widgetId, nodeId) {
    var nodeType = getNodeById(widgetId, nodeId).mainType
    return COLORNODE[nodeType]
}


// TODO: output var not editable!!!

// For node: 
// "module" -> module
// "func" -> func
// For widget: 
// "module" -> default "customize"
// "func" -> widget defination

function getNodeIdFromWidgetId(widgetId) {
    return widgetId.slice(0, -6)
}

function getWidgetIdFromNodeId(nodeId) {
    return nodeId + "Widget"  
}

function getCanvasIdFromWidgetId(widgetId) {
    return widgetId + "Canvas"
}

function getTabIdFromWidgetId(widgetId) {
    return widgetId + "Tab"
}

function getTabCloseIdFromTabId(tabId) {
    return tabId + "Close"
}

function getWidgetIdFromTabId(tabId) {
    return tabId.slice(0, -3)
}

// from user input widget name, get widgetId uuid
function getPureString(text) {
    var text = text.replace(/\s+/g, "")
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]")
    var specialstr = "";
    for(var i = 0; i < text.length; i++) {
        specialstr += text.substr(i, 1).replace(pattern,'');
    }

    return specialstr + new Date().getTime()
}

// TODO: need a better uuid, for widget's same type nodes
function getNodeUUID(mainType, subType) {
    return mainType + subType + new Date().getTime() + Math.ceil(Math.random()*100)
}


function addWidgetToList(widget) {
    widgetList[widget.id] = widget
}

function resetCurrentWidget() {

    for (var i = 0; i < widgetList[currentWidgetId].nodes.length; i++) {
        delNodeFromWidget(widgetList[currentWidgetId].nodes[i])
    }

    widgetList[currentWidgetId].nodes = {}
    widgetList[currentWidgetId].conns = {}


    
}

// when enter a new widget, then add to list!
// create widget need not do this!
function initWidgetToList(soureWidgetId, sourceNodeId, widgetId) {
    
    widgetList[widgetId] = {}
    widgetList[widgetId].id = widgetId
    widgetList[widgetId].nodes = {}
    widgetList[widgetId].conns = {}
    widgetList[widgetId].instance = null
    widgetList[widgetId].container = null
    widgetList[widgetId].sourceWidgetId = soureWidgetId
    widgetList[widgetId].sourceNodeId = sourceNodeId
    widgetList[widgetId].newOldPair = {}

    return widgetList[widgetId]
}

function delWidgetFromList(widgetId) {
    widgetList[widgetId] = null
    delete widgetList[widgetId]
}

function addNewOldPairToWidget(widgetId, nodeIdNewOld) {
    widgetList[widgetId].newOldPair = nodeIdNewOld
}

function addNodeToWidget(widgetId, node) {

    widgetList[widgetId].nodes[node.id] = node
}

function delNodeFromWidget(widgetId, nodeId) {
    console.log("delNodeFromWidget(widgetId, nodeId)")
    console.log(widgetId)
    console.log(nodeId)
    console.log(currentWidgetId)
    console.log(currentNodeId)

    var node = widgetList[widgetId].nodes[nodeId]

    if (node.type == "widget") {
        var widgetIdFromNodeId = getWidgetIdFromNodeId(node.id)
        if (widgetList[widgetIdFromNodeId].instance != undefined || widgetList[widgetIdFromNodeId].instance != null) {

            closeTab(widgetIdFromNodeId)
        }
        
        delWidgetFromList(widgetIdFromNodeId)
        
    }


    delete node

    console.log("remove node!!!!!")

    widgetList[widgetId].nodes[nodeId] = null
    delete widgetList[widgetId].nodes[nodeId]

}

function addConnToWidget(widgetId, conn) {
    widgetList[widgetId].conns[conn.id] = conn
}

function delConnFromWidget(widgetId, connId) {
    widgetList[widgetId].conns[connId] = null
    delete widgetList[widgetId].conns[connId]
}

// TODO: delete widget, if create a new widget contains widget-node!
function hasWidget(widgetId) {
    if (typeof widgetList[widgetId] === "undefined" || widgetList[widgetId] === null) {
        return false
    }
    else {
        return true
    }
}

function updateWidgetTabName(node) {
    var widgetId = getWidgetIdFromNodeId(node.id)
    var tabId = getTabIdFromWidgetId(widgetId)

    console.log("update tab name")
    console.log(widgetId)
    if (document.getElementById(tabId)) {
        console.log("update tab ok!!!!")
        $("#"+tabId).text(node.name)
    } else {
        console.log("no tab to update!!!!")
    } 

    showNodeInfo(node)
}

function getWidgetById(widgetId) {
    return widgetList[widgetId]
}

// TODO: save and construct widget in and like widget type list
function saveWidget(widgetDict) {

    var widgetName = widgetDict.widgetName
    var widgetDescription = widgetDict.widgetDescription
    var widgetOutput = widgetDict.outputList

    // 0. get widget name
    var widgetId = getPureString(widgetName)
    console.log("widgetName")
    console.log(widgetName)
    console.log(widgetId)

    // 1. add tree, use widgetId as 'mainType: subType -> "Customize: widgetId"'
    // get all nodes/conns from current widget's canvas, and generate new widget type!!!
    console.log(widgetList[currentWidgetId])

    // 1. generate new widget type
    var newWidgetType = {}
    newWidgetType.nodes = {}
    newWidgetType.conns = []
    newWidgetType.inputs = []
    newWidgetType.outputs = []

    var inputNull = []
    var inputNot = []


    for (var key in widgetList[currentWidgetId].nodes) {
        // for each node:
        // 2. nodes[nodeX] = {name, mainType, subType, inputs.default, position}
        var node = widgetList[currentWidgetId].nodes[key]
        node.position = $("#"+key).position()

        // nodes info
        var nodeId = node.id
        newWidgetType.nodes[nodeId] = {}
        newWidgetType.nodes[nodeId].name = node.name
        newWidgetType.nodes[nodeId].mainType = node.mainType
        newWidgetType.nodes[nodeId].subType = node.subType
        // Two kinds of input: 1. from default(here) 2. from connection(4)
        newWidgetType.nodes[nodeId].inputsDefault = node.input.default.slice(0)
        newWidgetType.nodes[nodeId].position = {left: node.position.left, top: node.position.top}

        // inputs(default)
        // push default input name into inputs
        for (var i = 0; i < node.input.default.length; i++) {
            inputNot.push({
                name: node.name + "_" + node.input.name[i + node.input.count], 
                type: node.input.type[i + node.input.count],
                default: node.input.default[i],
                node: nodeId, 
                // value: node.input.id[i + node.input.count]
                index: i + node.input.count})

        }

        // outputs
        // push output
        // for (var i = 0; i < node.output.default.length; i++) {
        //     newWidgetType.outputs.push({
        //         name: node.name + "_" + node.output.name[i],
        //         type: node.output.type[i],
        //         node: nodeId,
        //         index: i,
        //     })
        // }

        // conns
        // 3. get up connections, if has connection then (4), if not then (5)
        var upConnections = jsplumbUtils.getUpConnections(currentInstance, node.id)
        for (var inputJsId in upConnections) {
            var conn = upConnections[inputJsId]
            if (conn == null) {
                // 5. inputs.push(name: node.name + "_" + node.input.name, value:{nodeX: x})
                var inputIndex = node.input.id.indexOf(inputJsId)
                var inputName = node.input.name[inputIndex]
                var inputType = node.input.type[inputIndex]
                inputNull.push({
                    name: node.name + "_" + inputName, 
                    type: inputType,
                    default: null,
                    node: nodeId, 
                    index: inputIndex})
            }
            else {
                // 4. conns.push(output:{nodeY: y}, input:{nodeX: x}) node.input.id.indexOf(nodeInputId)
                console.log("connnnnnnnnnnnnnnnnn")
                console.log(conn)
                var inputIdIndex = null
                var outputIdIndex = null
                var eps = conn.endpoints
                for (var j = 0; j < eps.length; j++) {
                    if (eps[j].isTarget) {
                        inputIdIndex = node.input.id.indexOf(eps[j].inputJsId)
                    }
                    else {
                        var sourceNode = getNodeById(currentWidgetId, conn.sourceId)
                        outputIdIndex =  sourceNode.output.id.indexOf(eps[j].outputJsId)
                    }
                }
                newWidgetType.conns.push({
                    input: {node: nodeId, index: inputIdIndex}, 
                    output: {node: conn.sourceId, index: outputIdIndex}})
            }
        }
    }


    for (var i = 0; i < widgetOutput.length; i++) {
        var outputCheck = widgetOutput[i]
        var node = getNodeById(currentWidgetId, outputCheck.nodeId)
        
        newWidgetType.outputs.push({
            name: node.name + "_" + node.output.name[outputCheck.outputIndex],
            type: node.output.type[outputCheck.outputIndex],
            node: outputCheck.nodeId,
            index: outputCheck.outputIndex,
        })

    }


    // for (var i = 0; i < node.output.default.length; i++) {
    //     newWidgetType.outputs.push({
    //         name: node.name + "_" + node.output.name[i],
    //         type: node.output.type[i],
    //         node: nodeId,
    //         index: i,
    //     })
    // }


    newWidgetType.inputs.push(inputNull)
    newWidgetType.inputs.push(inputNot)
    newWidgetType.inputs = ([].concat.apply([],newWidgetType.inputs))

    console.log(newWidgetType)

    widgetTypeList[widgetId] = newWidgetType

    console.log(widgetTypeList)



    // TODO: from new widget type, create one newNodeType!!! And add to tree!
    var newNodeInput = {}
    newNodeInput.name = []
    newNodeInput.type = []
    newNodeInput.default = []

    // sooooooooooooooo bad............
    // because default.length != inputs.length....
    // bad design...
    // so, we first push null(with connect endpoint)
    // then, we push not null(with defaults...)
    var nameNull = []
    var typeNull = []
    var defaultNull = []
    var nameNot = []
    var typeNot = []
    var defaultNot = []

    for (var i = 0; i < newWidgetType.inputs.length; i++) {
        var input = newWidgetType.inputs[i]
        if (input.default == null) {
            nameNull.push(input.name)
            typeNull.push(input.type)
            // defaultNull.push(input.default)
        }
        else {
            nameNot.push(input.name)
            typeNot.push(input.type)
            defaultNot.push(input.default)
        }
    }

    newNodeInput.name = ([].concat.apply(nameNull,nameNot)).slice(0)
    newNodeInput.type = ([].concat.apply(typeNull,typeNot)).slice(0)
    newNodeInput.default = ([].concat.apply(defaultNull,defaultNot)).slice(0)

    newNodeInput.count = newNodeInput.name.length - newNodeInput.default.length
    newNodeInput.value = []
    newNodeInput.valuePair = {}


    var newNodeOutput = {}
    newNodeOutput.name = []
    newNodeOutput.type = []

    for (var i = 0; i < newWidgetType.outputs.length; i++) {
        var output = newWidgetType.outputs[i]
        newNodeOutput.name.push(output.name)
        newNodeOutput.type.push(output.type)
    }
    newNodeOutput.count = newWidgetType.outputs.length
    newNodeOutput.default = null
    newNodeOutput.value = null
    newNodeOutput.connNodes = []

    var newNodeType = {
            display: widgetName, 
            description: widgetDescription,
            type: "widget",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "widget",    
                func: widgetId,
                input: newNodeInput,
                output: newNodeOutput,                
            },
        }

    nodeTypeList.Customize[widgetId] = newNodeType

    console.log(nodeTypeList.Customize)

    // append to customize tree
    var t = "<div class=\"panel-body\" id=\"" + 
        widgetId + "\" draggable=\"true\" ondragend=\"addNode(\'Customize\', \'" + 
        widgetId +"\', event)\" onclick=\"showHelp(\'Customize\', \'" + 
        widgetId + "\')\">" +
        widgetName + "</div>"


    console.log(t)

    $("#collapseCustomize").append(t)



    // clear current canvas!!!
    jsplumbUtils.emptyCanvas(window.instance)

    // TODO: REMOVE WIDGET OF WIDGET-NODE!
    resetCurrentWidget()


    // TODO: change all alert!!!
    // alert("Widget added!")
    $.amaran({content: {color: COLORALERT.INFO, message: 'Widget added!', position: 'bottom right'}, inEffect: "slideRight"})


    return
}

function initWidgetNodes(widgetId, widgetType) {
    // 1. init node
    var nodeIdNewOld = {}
    var nodes = []

    var widgetTypeInfo = widgetTypeList[widgetType]
    for (var nodeId in widgetTypeInfo.nodes) {
        var node = widgetTypeInfo.nodes[nodeId]
        var name = node.name
        var mainType = node.mainType
        var subType = node.subType
        var inputsDefault = node.inputsDefault.slice(0)
        var inputs = {}
        inputs.default = inputsDefault
        inputs.nodeName = name
        var outputs = null
        var position = {}
        position.left = node.position.left
        position.top = node.position.top

        var newNode = initNode(mainType, subType, widgetId, inputs, outputs, position)

        addNodeToWidget(widgetId, newNode)

        nodeIdNewOld[nodeId] = newNode.id

        nodes.push(newNode)
    }

    console.log("nodeIdNewOld")
    console.log(nodeIdNewOld)

    addNewOldPairToWidget(widgetId, nodeIdNewOld)


    // check all nodes, and init widget
    console.log("init widget")
    console.log(nodes)
    for (var i = 0; i < nodes.length; i++) {
        var newNode = nodes[i]
        if (newNode.type == "widget") {
            console.log("add new widget from widget")
            console.log(widgetId)
            console.log(widgetList)
            var newWidgetId = getWidgetIdFromNodeId(newNode.id)
            initWidgetToList(widgetId, newNode.id, newWidgetId)
            initWidgetNodes(newWidgetId, newNode.widgetType)
            console.log("Add new widget-node!!!!!!!!!!!!!!!!!")
            console.log(widgetList)
        }
    }
}

function initWidgetConns(widgetId, widgetType) {

    var widgetTypeInfo = widgetTypeList[widgetType]
    var nodeIdNewOld = getWidgetById(widgetId).newOldPair
    var nodes = getWidgetById(widgetId).nodes
    // 2. init conns
    for (var i = 0; i < widgetTypeInfo.conns.length; i++) {

        var connOld = widgetTypeInfo.conns[i]
        // var conn = {}
        var outputNodeId = nodeIdNewOld[connOld.output.node]
        var outputIndex = connOld.output.index
        var inputNodeId = nodeIdNewOld[connOld.input.node]
        var inputIndex = connOld.input.index


        // addConnToWidget(widgetId, conn)
        // fake endpoints
        // bad....................
        var outputNode = getNodeById(widgetId, outputNodeId)
        var inputNode = getNodeById(widgetId, inputNodeId)
        var outputEp = {outputJsId: outputNode.output.id[outputIndex]}
        var inputEp = {inputJsId: inputNode.input.id[inputIndex]}
        connectionAdded(widgetId, outputNodeId, outputEp, inputNodeId, inputEp)
    }


    console.log("init conns!~~~~~~~~~~~~~~")
    console.log(nodes)
    for (var nodeId in nodes) {
        var newNode = nodes[nodeId]
        if (newNode.type == "widget") {
            console.log("add new widget from widget")
            console.log(widgetId)
            console.log(widgetList)
            var newWidgetId = getWidgetIdFromNodeId(newNode.id)

            initWidgetConns(newWidgetId, newNode.widgetType)

            console.log("Add new widget-node!!!!!!!!!!!!!!!!!")
            console.log(widgetList)
        }
    }
}

// TODO: re-construct widget from widget type list
function initWidget(widgetId, widgetType) {

    // 0. init nodes first, or conn will die!!!
    initWidgetNodes(widgetId, widgetType)

    // 1. init conns
    initWidgetConns(widgetId, widgetType)

 

    // TODO: OK!: init one widget, and add to list!
    // TODO: OK!: initNode when widget-node added!
    // TODO: OK!: paint jsPlumb when tab entered!


}

// common method for enter widget, 
// like switch current widget/running widget
// switch current canvas container
function enterWidget(widgetId, newCanvas) {

    // set current node null
    setCurrentNode(null)

    // widget
    currentWidgetId = widgetId
    currentWidgetIdRunning = widgetId

    var currentWidget = getWidgetById(currentWidgetId)

    console.log("current widget is ")
    console.log(currentWidget)
    console.log("current widget id is ")
    console.log(currentWidgetId)
    console.log("current widget list is ")
    console.log(widgetList)

    if (newCanvas) {
        var canvasId = getCanvasIdFromWidgetId(currentWidgetId)
        var jsInstance = initJsPlumb(canvasId)
        currentWidget.instance = jsInstance
        currentWidget.container = canvasId   

        currentInstance = jsInstance
        currentInstanceRunning = currentInstance
        window.instance = currentInstance

        drawWidgetNodes(currentWidget)
    }
    else {

        currentInstance = getWidgetById(currentWidgetId).instance
        currentInstanceRunning = currentInstance
        window.instance = currentInstance
    }


    console.log("enter tab!!!")
    console.log(currentWidgetId)
    console.log(currentInstance)
    console.log(window.instance.getContainer())
}

function closeTab(widgetId) {
    if (widgetId == null) widgetId = currentWidgetId

    var sourceWidgetId = widgetList[widgetId].sourceWidgetId

    var l = getTabIdFromWidgetId(widgetId)
    $("#" + l).hide()


    // jsplumbUtils.emptyCanvas(widgetList[widgetId].instance)

    // widgetList[widgetId].instance = null
    // widgetList[widgetId].container = null


    // console.log("close tab enter widget")



    enterWidget(sourceWidgetId, false)

    $('#widgetTabs a[href=#' + sourceWidgetId + ']').tab('show')
}

function drawWidgetNodes(widget) {

    // TODO: draw nodes
    for (var nodeId in widget.nodes) {
        var newNode = widget.nodes[nodeId]
        var x = newNode.position.left
        var y = newNode.position.top
        jsplumbUtils.newNode(window.instance, x, y, newNode);

        setNodeRunStatus(newNode, newNode.status)
    }

    var conns = []
    for (var connId in widget.conns) {
        var conn = widget.conns[connId]
        var inputEp = getNodeById(widget.id, conn.input.node).input.id[conn.input.index]
        var outputEp = getNodeById(widget.id, conn.output.node).output.id[conn.output.index]
        conns.push([outputEp, inputEp])

    }

    jsplumbUtils.initWidgetJsPlumb(window.instance, conns)

}

function getConnectionUUID(outputNodeId, outputIndex, inputNodeId, inputIndex) {
    // id = outputNodeId + index + inputNodeId + index!!!
    return outputNodeId + outputIndex + inputNodeId + inputIndex
}

// find node inside widgetS, one by one
function getInputNodeIndepth(node, index) {
    if (node.type == "node") {
        return {node: node, index: index}
    }
    else {
        // 1. get widge type
        var widgetType = widgetTypeList[node.widgetType]
        // var input = nodeTypeList[node.mainType][node.subType].input.
        var widgetTypeInput = widgetType.inputs[index]

        // 2. get node from widget with this input
        var widgetId = getWidgetIdFromNodeId(node.id)
        var widget = widgetList[widgetId]
        var newNodeId = widget.newOldPair[widgetTypeInput.node]
        var newIndex = widgetTypeInput.index
        var newNode = getNodeById(widgetId, newNodeId)

        return getInputNodeIndepth(newNode, newIndex)
    }
 
}

// find node inside widgetS, one by one
function getOutputNodeIndepth(node, index) {
    if (node.type == "node") {
        return {node: node, index: index}
    }
    else {
        // 1. get widge type
        var widgetType = widgetTypeList[node.widgetType]
        var widgetTypeOutput = widgetType.outputs[index]

        // 2. get node from widget with this input
        var widgetId = getWidgetIdFromNodeId(node.id)
        var widget = widgetList[widgetId]
        var newNodeId = widget.newOldPair[widgetTypeOutput.node]
        var newIndex = widgetTypeOutput.index
        var newNode = getNodeById(widgetId, newNodeId)

        return getOutputNodeIndepth(newNode, newIndex)
    }
 
}

function connectionAdded(widgetId, outputNodeId, outputEp, inputNodeId, inputEp) {

    console.log("connection!!!!")

    // 1. add to widget
    var conn = {}

    var inputNode = getNodeById(widgetId, inputNodeId)
    var outputNode = getNodeById(widgetId, outputNodeId)

    var inputIndex = inputNode.input.id.indexOf(inputEp.inputJsId)
    var outputIndex = outputNode.output.id.indexOf(outputEp.outputJsId)
    // widgetId, inputEp, outputEp, 
    conn.id = getConnectionUUID(outputNodeId, outputIndex, inputNodeId, inputIndex)
    conn.output = {node: outputNodeId, index: outputIndex}
    conn.input = {node: inputNodeId, index: inputIndex}

    addConnToWidget(widgetId, conn)

    // 2. conn to nodes
    var inputIndepth = getInputNodeIndepth(inputNode, inputIndex)
    var outputIndepth = getOutputNodeIndepth(outputNode, outputIndex)

    var inputIndepthNode = inputIndepth.node
    var inputIndepthIndex = inputIndepth.index

    var outputIndepthNode = outputIndepth.node
    var outputIndepthIndex = outputIndepth.index

    inputIndepthNode.input.value[inputIndepthIndex] = {}
    inputIndepthNode.input.value[inputIndepthIndex].widgetId = outputIndepthNode.widgetId
    inputIndepthNode.input.value[inputIndepthIndex].nodeId = outputIndepthNode.id
    inputIndepthNode.input.value[inputIndepthIndex].outputId = outputIndepthNode.output.id[outputIndepthIndex]

    outputIndepthNode.output.connNodes.push(inputIndepthNode)


    console.log("connectionAdded")
    console.log(widgetList)

}

function connectionDetached(widgetId, outputNodeId, outputEp, inputNodeId, inputEp) {
    
    // 1. from widget
    // widgetId, inputEp, outputEp, conn_id
    var inputNode = getNodeById(widgetId, inputNodeId)
    var outputNode = getNodeById(widgetId, outputNodeId)

    var inputIndex = inputNode.input.id.indexOf(inputEp.inputJsId)
    var outputIndex = outputNode.output.id.indexOf(outputEp.outputJsId)
    // widgetId, inputEp, outputEp, 
    var connId = getConnectionUUID(outputNodeId, outputIndex, inputNodeId, inputIndex)

    delConnFromWidget(widgetId, connId)


    // 2. from nodes
    var inputIndepth = getInputNodeIndepth(inputNode, inputIndex)
    var outputIndepth = getOutputNodeIndepth(outputNode, outputIndex)

    var inputIndepthNode = inputIndepth.node
    var inputIndepthIndex = inputIndepth.index

    var outputIndepthNode = outputIndepth.node
    var outputIndepthIndex = outputIndepth.index

    inputIndepthNode.input.value[inputIndepthIndex] = null
    outputIndepthNode.output.connNodes.splice(outputIndepthNode.output.connNodes.indexOf(inputIndepthNode), 1)


    console.log("connectionDetached")
    console.log(widgetList)
}

function enterWidgetFromNode(node) {

    // 1. create tab/canvas
    // 1.1 create tab
    var h = getWidgetIdFromNodeId(node.id)
    var tabId = getTabIdFromWidgetId(h)
    var tabCloseId = getTabCloseIdFromTabId(tabId)

    var widget = getWidgetById(h)
    if (widget.container != null) {

        console.log(widget.container)

        $("#" + tabId).show()
        $('#widgetTabs a[href=#' + h + ']').tab('show')
        return 
    }

    // 1.2.
    var l = document.createElement("li")
    l.innerHTML =  "<a href='#" + h + "' data-toggle='tab' id='" + tabId + "'>"  + node.name + "</a> "
        

    $("#widgetTabs").append(l)

    bindTab(tabId)
    
    // 1.3 create content
    var c = getCanvasIdFromWidgetId(h)
    var d = document.createElement("div")
    d.className = "tab-pane fade in active"
    d.id = h
    d.innerHTML = "<div class='jtk-demo-main'>" +
        "<div class='jtk-demo-canvas canvas-wide source-target-demo jtk-surface jtk-surface-nopan canvas' id='" +
        c + "'></div></div>" 
    $("#widgetTabContent").append(d)

    // 1.4 buttons
    // var buttonsDiv = document.createElement("div")
    // buttonsDiv.className = "canvas-button"

    // var closeButton = document.createElement("button")
    // closeButton.className = "btn btn-default btn-xs"
    // closeButton.onclick = function () {
    //     closeTab(currentWidgetId)
    // }
    // $(closeButton).text("X")

    // $(buttonsDiv).append(closeButton)

    // $(d).append(buttonsDiv)

    // $("#" + tabCloseId).onclick = function () {
    //     closeTab(currentWidgetId)
    // }

    // 2. active tab
    $('#widgetTabs a[href=#' + h + ']').tab('show')
    
    // 3. init widget
    enterWidget(h, true)


}

function initNode(mainType, subType, widgetId, inputs, outputs, position) {
    var nodeType = nodeTypeList[mainType][subType]

    var nodeId = getNodeUUID(mainType, subType)

    // 0. init a node
    var node = {}

    node.id = nodeId
    node.name = nodeType.display

    node.mainType = mainType
    node.subType = subType
    node.widgetId = widgetId

    node.type = nodeType.type
    node.display = nodeType.display
    node.description = nodeType.description
    // 1. inputs
    node.module = nodeType.content.module
    node.func = nodeType.content.func
    node.widgetType = nodeType.content.func


    node.input = {}
    node.input.name = nodeType.content.input.name.slice(0) // input name: not change, not unique
    node.input.type = nodeType.content.input.type.slice(0)
    node.input.count = nodeType.content.input.count
    node.input.value = [] // input value should be up nodes output default
    node.input.valuePair = {}
    node.input.id = node.input.name.map(function(value, index){ // input id: not change, unique
        return "input" + node.id + getPureString(value) + index
    });

    if (inputs != null) {
        node.name = inputs.nodeName
        node.input.default = inputs.default.slice(0) // input default: not change, not unique
    }
    else {
        node.input.default = nodeType.content.input.default.slice(0) // input default: not change, not unique

    }


    // 2. output
    node.output = {} 
    node.output.name = nodeType.content.output.name.slice(0) // name: not change, not unique
    node.output.type = nodeType.content.output.type.slice(0)
    node.output.count = nodeType.content.output.count
    node.output.default = node.output.name.map(function(value, index){ // output default: change, unique
        return "output" + node.id + getPureString(value) + index
    });
    node.output.connNodes = []
    node.output.value = null // output value should be result from server
    node.output.id = node.output.default.slice(0) // output id: not change, unique


    node.status = STATUS.IDLE
    node.found = false
    
    node.position = {}
    if (position != null) {
        node.position.top = position.top
        node.position.left = position.left 
    }
    else {
        node.position.top = null
        node.position.left = null 
    }

    return node
} 




// from html event(e) to add one jsplumb node
function addNode(mainType, subType, e) {

    // 0. add node info to node list
    // mainType, subType, widgetId, inputs, outputs
    var newNode = initNode(mainType, subType, currentWidgetId, null, null, null)
    // 1. add this node to current widget
    addNodeToWidget(currentWidgetId, newNode)

    if (newNode.type == "widget") {
        var widgetId = getWidgetIdFromNodeId(newNode.id)
        initWidgetToList(currentWidgetId, newNode.id, widgetId)
        initWidget(widgetId, newNode.widgetType)
        console.log("Add new widget-node!!!!!!!!!!!!!!!!!")
        console.log(widgetList)
    }


    // offset of cursor
    // TODO: use node width/height to set diffX/diffY
    var diffX = 9 * 16 / 2
    var diffY = 4 * 16 / 2 + 36

    var canvasId = getCanvasIdFromWidgetId(currentWidgetId)
    var X = $('#' + canvasId).offset().left + diffX
    var Y = $('#accordion').offset().top + diffY

    jsplumbUtils.newNode(window.instance, e.clientX - X, e.pageY - Y, newNode);

    // 2. add description/inputs/output at console
    showNodeInfo(newNode)

    // 3. set current node is this
    setCurrentNode(newNode.id)
    

    console.log("current widget is !!!!")
    console.log(widgetList)
}

function clearNodeInfo() {
    $("#func-description").empty()
    $("#func-inputs").empty()
    $("#func-output").empty()
}

function getNodeById(widgetId, nodeId) {
    console.log(widgetList)
    console.log(widgetList[widgetId].nodes[nodeId])
    return widgetList[widgetId].nodes[nodeId]
}

// @depracate
function getNodeByName(widgetId, nodeName) {
    return getNodeById(widgetId, nodeName)
}

function showNodeInfo(node) {

    if (node === undefined || node === null || node.input === undefined || node.input === null || node.output === undefined || node.output === null) return

    showDescription(node)
    showInputs(node)
    showOutput(node) 
}

function showDescription(node) {
    if (node === undefined || node === null) return

    // TODO:func-description
    $("#func-description").empty()
    var d = document.createElement("pre")

    d.innerHTML = node.name + "\n" + "Type: " + node.display + "\n" + node.description

    $("#func-description").append(d)

}

function showInputs(node) {
    $("#func-inputs").empty()

    for (var i = 0; i < node.input.default.length; i++) {
        var index = node.input.count + i

        var d = document.createElement("div")
        d.className = "input-group"

        var s = document.createElement("span")
        s.className = "input-group-addon"
        s.innerHTML = node.input.name[index]

        var t = document.createElement("input")
        t.type = "text"
        t.className = "form-control"
        // t.value = node.input.default[i]
        t.value = getInputHtml(node, index)
        t.id = "text" + node.id + "input" + index


        $(t).on('change input propertychange', function(e) {
            // console.log(e)
            var node = getNodeById(currentWidgetId, currentNodeId)

            var notIdLength = ("text" + node.id + "input").length
            var notIdIndex = e.currentTarget.id.substring(notIdLength)
            // node.input.default[e.currentTarget.id.substring(notIdLength)] = $(this).val()

            var nodeIndepth = getInputNodeIndepth(node, notIdIndex)
            nodeIndepth.node.input.default[nodeIndepth.index - nodeIndepth.node.input.count] = $(this).val()

            console.log("change input ")
            console.log(nodeIndepth)

            // change all nodes downside of status idle
            setDownNodesIdle(nodeIndepth.node.widgetId, nodeIndepth.node.id)
        });

        d.append(s)
        d.append(t)

        $("#func-inputs").append(d)
    }
}

function showOutput(node) {
    $("#func-output").empty()

    // TODO!!!!!!!!!!!!!!
    var ul = document.createElement("ul")
    ul.id = "outputTab"
    ul.className = "nav nav-tabs"

    var uc = document.createElement("div")
    uc.id = "outputContent"
    uc.className = "tab-content"

    for (var i = 0; i < node.output.name.length; i++) {
        var li = document.createElement("li")

        var a = document.createElement("a")
        $(a).attr('href', "#" + node.output.name[i])
        $(a).attr('data-toggle', "tab")
        a.innerHTML = node.output.name[i]

        li.append(a)
        ul.append(li)

        var dc = document.createElement("div")
        dc.className = "tab-pane fade"
        dc.id = node.output.name[i]

        if (i == 0) {
            li.className = "active"
            dc.className = dc.className + " in active"
        }

        var v = getOutputHtml(node, i)
        var vDiv = document.createElement("div")
        vDiv.innerHTML = v

        dc.append(vDiv)  

        uc.append(dc)

    }

    $("#func-output").append(ul)
    $("#func-output").append(uc)

    // change table style
    var tc = $("table").attr("class")
    $("table").attr("class", tc + " table table-striped")


}

function getInputHtml(node, index) {
    var inputIndepth = getInputNodeIndepth(node, index)

    var inputIndepthNode = inputIndepth.node
    var inputIndepthIndex = inputIndepth.index


    return inputIndepthNode.input.default[inputIndepthIndex - inputIndepthNode.input.count]
}

function getOutputHtml(node, index) {
    var outputIndepth = getOutputNodeIndepth(node, index)

    var outputIndepthNode = outputIndepth.node
    var outputIndepthIndex = outputIndepth.index

    

    if (outputIndepthNode.output.value == null || outputIndepthNode.output.value.length == 0) {
        return ""
    }
    else {
        var value = outputIndepthNode.output.value[outputIndepthIndex] 
        if (typeof value == "undefined" || value == null) {
            return ""
        }
        else {
            return value
        }
    }

}

function getUpInfoFromWidgetConns(widgetId) {
    var widget = getWidgetById(widgetId)
    var conns = widget.conns

    var upNodes = {}

    for (var connId in conns) {
        var conn = conns[connId]
        if (typeof upNodes[conn.input.node] == "undefined" || upNodes[conn.input.node] == null) {
            upNodes[conn.input.node] = {}
            upNodes[conn.input.node].nodes = []
            upNodes[conn.input.node].upInputList = []
            upNodes[conn.input.node].upOutputList = []
        }
        upNodes[conn.input.node].nodes.push(conn.output.node)

        var inputNode = getNodeById(widgetId, conn.input.node)
        var outputNode = getNodeById(widgetId, conn.output.node)
        upNodes[conn.input.node].upInputList.push(inputNode.input.name[conn.input.index])
        upNodes[conn.input.node].upOutputList.push(outputNode.output.default[conn.output.index])

    }

    return upNodes
}



// @deprecated
function getUpNodes(instance, nodeId) {
    return jsplumbUtils.getUpNodesList(instance, nodeId)
}

// @deprecated
function getDownNodes(instance, nodeId) {
    // from 2d to 1d
    var downNodesList = jsplumbUtils.getDownNodesList(instance, nodeId)
    console.log("getDownNodes")
    console.log(downNodesList)
    return [].concat.apply([],downNodesList)
}


function setDownNodesIdle(widgetId, nodeId) {

    // 0. TODO: check circle

    // 1. TODO: get all instance down the node
    // TEST: NOT NEEDED! could get node by widgetId and nodeId! : should be current running instance!!!

    setDownNodesIdleInInstance(widgetId, nodeId)
}

function setDownNodesIdleInInstance(widgetId, nodeId) {
    // var instance = widget.instance
    // 1. set down nodes
    var node = getNodeById(widgetId, nodeId)
    var downList = node.output.connNodes
    console.log("Show down list from setDownNodesIdle")
    console.log(downList)

    // recursive set node down to idle
    if (downList.length > 0) {
        for (var i = 0; i < downList.length; i++) {
            var downNode = downList[i]
            setDownNodesIdleInInstance(downNode.widgetId, downNode.id)
        }
    }

    setNodeRunStatus(node, STATUS.IDLE)

    // TODO: del var now or when run it?!
    // pushDelVar(node)

    return true
}

function pushDelVar(node) {
    runDelVarList = [].concat.apply(runDelVarList, node.output.default)

    console.log("runDelVarList")
    console.log(runDelVarList)


}

function clearDelVar() {
    runDelVarList = []
}

function showHelp(mainType, subType) {
    $("#func-description").empty()
    $("#func-inputs").empty()
    $("#func-output").empty()

    var d = document.createElement("pre")

    d.innerHTML = nodeTypeList[mainType][subType].description

    $("#func-description").append(d)


}

function bindWidgetModal() {

    $('#widgetModal').on('show.bs.modal', function () {
        $('#widgetModalInputName').val("")
        $('#widgetModalInputDescription').val("")
        $('#widgetModalCheckbox').empty()

        for (var key in widgetList[currentWidgetId].nodes) {
            var node = widgetList[currentWidgetId].nodes[key]


            // outputs
            // push output
            for (var i = 0; i < node.output.default.length; i++) {
                var dc = document.createElement("div")
                dc.className = "checkbox"

                var cl = document.createElement("label")
                cl.innerHTML = "<input type=\"checkbox\" checked node-id=\"" + node.id + "\" node-output-index=\"" + i + "\">" + node.name + "_" + node.output.name[i],

                dc.append(cl)

                $('#widgetModalCheckbox').append(dc)
            }

        }
    })

    $('#widgetModal').on('hidden.bs.modal', function () {

    })
}
function bindOutputModal() {

    $('#outputModal').on('show.bs.modal', function () {

        $('#collapse-output').collapse('hide')

        $("#outputModalLabel").text("")
        $("#outputModalBody").empty()

        console.log("0 close ... current node is ")
        console.log(node)

        if (currentNodeId == null || currentNodeId == undefined) {
            return 
        }

        var node = getNodeById(currentWidgetId, currentNodeId)

        console.log("close ... current node is ")
        console.log(node)

        $("#outputModalLabel").text(node.name)

        if (node.output.value != null) {
            // TODO!!!!!!!!!!!!!!
            var ul = document.createElement("ul")
            ul.id = "outputModalTab"
            ul.className = "nav nav-tabs"

            var uc = document.createElement("div")
            uc.id = "outputModalContent"
            uc.className = "tab-content"

            for (var i = 0; i < node.output.name.length; i++) {
                var li = document.createElement("li")

                var a = document.createElement("a")
                $(a).attr('href', "#" + node.output.name[i] + "Modal")
                $(a).attr('data-toggle', "tab")
                a.innerHTML = node.output.name[i]

                li.append(a)
                ul.append(li)

                var dc = document.createElement("div")
                dc.className = "tab-pane fade"
                dc.id = node.output.name[i] + "Modal"

                if (i == 0) {
                    li.className = "active"
                    dc.className = dc.className + " in active"
                }


                var v = getOutputHtml(node, i)
                var vDiv = document.createElement("div")
                vDiv.innerHTML = v

                dc.append(vDiv)  

                uc.append(dc)

            }

            $("#outputModalBody").append(ul)
            $("#outputModalBody").append(uc)

            // change table style
            var tc = $("table").attr("class")
            $("table").attr("class", tc + " table table-striped")

        }


    })

    $('#outputModal').on('hidden.bs.modal', function () {
        $('#collapse-output').collapse('show')

    })
}

function bindTab(tabId) {

    $("#" + tabId).on('shown.bs.tab', function (e) {
      // alert(e.target) // clicked tab
      // alert(e.relatedTarget) // prev tab
      // alert("change tab")
      console.log("tab!!!!!!!!")
      console.log(e)

      var tabId = e.target.id
      var widgetId = getWidgetIdFromTabId(tabId)
      console.log("widget id from tab is ")
      console.log(widgetId)

      enterWidget(widgetId, false)

      if (tabId !== defaultTabId) {
        $("#" + tabId).append("<img src='../static/img/closetab.png' class='closeTab' onclick='closeTab(null)'>")
      }

    })

    $("#" + tabId).on('hide.bs.tab', function (e) {

        $("#" + tabId + " img").remove()

    })

}

// @deprecated
function inputWidgetName() {

    $("#saveWidget").empty()

    $("#saveWidget").append("<div id=\"widgetConfirmCancel\" class=\"input-group\"> \
                    <input type=\"text\" class=\"form-control\" id=\"widgetDivInput\"> \
                    <span class=\"input-group-btn\"> \
                        <button class=\"btn btn-default\" onclick=\"confirmWidget()\">Confirm</button> \
                        <button class=\"btn btn-default\" onclick=\"cancelWidget()\">Cancel</button> \
                    </span> \
                </div>")
    console.log("widget list ")
    console.log(widgetList)
}

// @deprecated
function cancelWidget() {
    $("#saveWidget").empty()

    $("#saveWidget").append("<div class=\"input-group\" id=\"canvasButton\"> \
                    <button class=\"btn btn-default\" onclick=\"inputWidgetName()\" id=\"widgetButton\">Widget</button> \
                </div>")
}

// @deprecated
function confirmWidget() {
    // alert($("#widgetDivInput").val())

    saveWidget($("#widgetDivInput").val())

    // . change buttons
    $("#saveWidget").empty()

    $("#saveWidget").append("<div class=\"input-group\" id=\"canvasButton\"> \
                    <button class=\"btn btn-default\" onclick=\"inputWidgetName()\" id=\"widgetButton\">Widget</button> \
                </div>")
}

function saveCanvas() {
    var widgetDict = {}

    var outputList = []

    var checkList = $("#widgetModalCheckbox input[type='checkbox']")

    for (var i = 0; i < checkList.length; i++) {
        var cb = checkList[i]
        if (cb.checked) {
            var output = {}
            output.nodeId = $(cb).attr("node-id")
            output.outputIndex = $(cb).attr("node-output-index")

            outputList.push(output)
        }
    }

    widgetDict.outputList = outputList
    widgetDict.widgetName = $('#widgetModalInputName').val()
    widgetDict.widgetDescription = $('#widgetModalInputDescription').val()


    console.log("check box")
    console.log(widgetDict)

    $('#widgetModal').modal('hide')

    saveWidget(widgetDict)

}

/////////////////////////////////////////////////////
// websocket

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    $("#scriptform").bind("submit", function() {
        newScript($(this));
        return false;
    });

    $("#scriptform").bind("keypress", function(e) {
        if (e.keyCode == 13) {
            newScript($(this));
            return false;
        }
    });
    // $("#message").select();
    updater.start();

    // 1. init widget/canvas/jsplumb
    // All from a pseudo-node "workspace"! 
    // TODO: refactor?!
    defaultNodeId = "workspace"
    defaultWidgetId = getWidgetIdFromNodeId(defaultNodeId)
    var canvasId = getCanvasIdFromWidgetId(defaultWidgetId)
    defaultTabId = getTabIdFromWidgetId(defaultWidgetId)
    // 2. init widget of workspace
    initWidgetToList(null, null, defaultWidgetId)

    enterWidget(defaultWidgetId, true)

    // bind tab
    bindTab(defaultTabId)


    // 3. bind events
    // bindEventsOnReady()

    // TODO: init node type list & node list from server
    // initNodeList()
    // TODO: from node type list, generate node tree


    // bind modal
    bindWidgetModal()
    bindOutputModal()

});

// TODO: unified message assemble!!!
function newScript(form) {
    var message = form.formToDict()
    message.id = "script" + new Date().getTime()
    message.kernelId = kernelId
    updater.socket.send(JSON.stringify(message))
    // form.find("input[type=text]").val("").select();
}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

var updater = {
    socket: null,

    start: function() {
    	// alert("ws")
        var host = document.location.host
        var url = "ws://" + host + "/run_socket";
        updater.socket = new WebSocket(url);
        updater.socket.onmessage = function(event) {
            updater.showMessage(JSON.parse(event.data));
        }
    },

    showMessage: function(message) {
        parseMessage(message)
    }
};

function parseMessage(message) {

    kernelId = message.kernelId

    var mId = message.id
    var mChannel = message.channel
    var mStatus = message.status
    var mContent = message.content

    // TODO: dispatch message
    if (mChannel == "script") {
        // alert(mContent);
        clearNodeInfo()
        // var node = $(mContent);
        // $("#console").remove()
        for (var name in mContent) {
            $("#func-output").append(name);
            $("#func-output").append(mContent[name]);
        }

        // node.slideDown();
        $.amaran({content: {color: COLORALERT.INFO, message: 'Script returned!', position: 'bottom right'}, inEffect: "slideRight"})

    }
    else if (mChannel == "flow") {
        runOneStepDone(message)
        
    }
   
}