/*
Node Structure

<div class="node" id=nodeType+No.>
    <strong>nodeType</strong>
    <a href="#" id="removeNode">x</a>
</div>




Node = {
	nodeType: nodeType;
	nodeName: nodeName;	
	inputs: endpoints_list; // top
	outputs: endpoints_list; // bottom
	
}


# Demo Flow
. Add train_x.txt, train_y.txt, test_x.txt 
. Merge train_x/train_y By id
. Shuffle merged
. Split train_x/train_y
. Pre-process train_x with impute/normarlize
. Fit/Train train_x/train_y with RFC/SVM/NN/RNN/XGBoost
. Predict test_x
. Show Predict with plain text
. Show Predict with draw hist/scatter
*/

    // var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
    //     for (var i = 0; i < sourceAnchors.length; i++) {
    //         var sourceUUID = toId + sourceAnchors[i];
    //         instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
    //             anchor: sourceAnchors[i], uuid: sourceUUID
    //         });
    //     }
    //     for (var j = 0; j < targetAnchors.length; j++) {
    //         var targetUUID = toId + targetAnchors[j];
    //         instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
    //     }
    // };


// // TODO: node color
// // TODO: save node vars, and auto-name var
// var NodeList = null

// // TODO: save node structures as json, 
// // TODO: code python func, inspect.getsource to jupyter. 
// // Call func: 
// // (outputName + count) or edited name = 
// //     func.name + ( + input paras of outputName from up node... + )
// // TODO: connect two node:
// //     down node paras = up node ouputName or input/pre-set
// var NodeStructure = {
//     "Data": {
//         "File": {
//             disName: "File", 
//             descript: "Read a data file as pandas dataframe.",
//             func: {
//                 name: "read_csv",
//                 input: {
//                     names: ["File Name", "Header Names"],
//                     paras: null,
//                     types: ["file", "list"],
//                     descripts: ["Please choose the file.", "Enter the header names"],
//                     editable: [false, true], // true then edit at web
//                 },
//                 output: {
//                     name: ["Data", ],
//                     outputName: ["data", ],
//                     types: ["pandas dataframe"]
//                     descripts: ["Data from the file.", ],
//                     content: null,
//                 },
//             },
//         },

//         "Merge": {
//             disName: "Merge", 
//             descript: "Merge two data files.",
//             func: {
//                 name: "merge_df",
//                 input: {
//                     names: ["Data 1", "Data 2", ],
//                     paras: null,
//                     types: ["pandas dataframe", "pandas dataframe"],
//                     descripts: ["Please choose the data.", "Please choose the data.",],
//                     editable: [false, false, ],
//                 },
//                 output: {
//                     name: ["Data", ],
//                     outputName: ["merge", ],
//                     types: ["pandas dataframe"]
//                     descripts: ["Data merged from two files.", ],
//                     content: null,
//                 },
//             },
//         },   
//     }

// }

// var NodeTypeList = {
// 	// Data: 1.file 2.numpy 3.merge 4.sklearn-pre 
// 	"Data": {
// 		"File": {
// 			inputs: null, 
// 			outputs: ["File"], 
// 			paras: null},
// 		"Merge": {			
// 			inputs: ["File_1", "File_2"], 
// 			outputs: ["File"], 
// 			paras: ["By"]},
// 		"Split": {},
// 		"Shuffle": {},
// 		"Impute": {},
// 		"Normalize": {},
// 	},
// 	// Mining: 1.sklearn-mining 2.tensorflow 3.xgboost
// 	"Model": {
// 		"RandomForest": {},
// 		"SVM": {},
// 		"XGBoost": {},
// 	},
// 	"Evaluate": {
// 		"Prediction": {},
// 	},
// 	"Visualize": {
// 		"Hist": {},
// 		"Scatter": {},
// 	}
// };







// inputs/outputs with endpoints, paras with default value and editable
// function NodeFactory(mainType, subType) {
// 	this.nodeType = NodeTypeList[mainType][subType];

// 	this.inputs = this.nodeType.inputs;
// 	this.outputs = this.nodeType.outputs;
// 	this.paras = this.nodeType.paras;

// 	return node
// }

// function AddJsplumb(node, e) {
// 	// body...
// }

function run() {
    alert("runrunrunrunrunrunrunrunrunrunrunrunrunrun")

    // TODO: test for down side nodes idle
    // for (var key in nodeListByName)  {
    //     console.log(nodeListByName[key])
    // }

    // return

    // 0. switch run/stop
    if (currentStatus == STATUS.IDLE) {
        currentStatus = STATUS.BUSY
        runFlow()
    }
    else {
        stopFlow()
    }
}

// set runNodesList as global var
var runNodesList = []
var runNodeMessage = []
var runDelVarList = []
var kernelId = ""


function runFlow() {
    runNodesList = []
    runDelVarList = []

    // 0. check current node to run
    if (currentNodeId == null) {
        alert("Please choose a node!")
        runFlowDone()
        return true
    }

    // TODO: unshift up nodes until all is start node!!!
    var node = getNodeById(currentNodeId)

    // 1. this node is done, then just show the info
    if (node.status == STATUS.DONE) {
        showNodeInfo(node)
        runFlowDone()
        return true
    }

    // 2. this node is idle, need run 
    // 2.0 TODO: check circle!!!



    // 2.1 recursive get run flow node list
    var runQueue = []
    runQueue.push(node)
    runNodesList.unshift(node)
    var enqueueFlag = true
    while (!(runQueue.length == 0)) {
        var node = runQueue.shift()
        

        var upNodeList = getUpNodes(node.name)


        // console.log("shift node is ")
        // console.log(n)
        // console.log("uplist ")
        // console.log(upList)

        // check whether all inputs feeded
        if (upNodeList.length != node.input.count) {
            enqueueFlag = false
            runQueue = []
            break
        }
        else { // if inputs OK, then assemble inputs
            // var endpointsList = jsplumbUtils.getNodeEndpoints(n.name)
            // for (var i = endpointsList.length - 1; i >= 0; i--) {
            //     console.log("endpoint is ")
            //     console.log(endpointsList[i].inputJsName)
            //     console.log(endpointsList[i])
            // }
            var inputAssembleList = {}

            // 1.1 get pair from endpoint
            var outInPair = jsplumbUtils.getOutInPairsFromEps(node.name)
            var upInputList = outInPair.upInputList
            var upOutputList = outInPair.upOutputList

            var lenIn = upInputList.length
            var lenOut = upOutputList.length

            if (lenIn != lenOut) {
                enqueueFlag = false
                runQueue = []
                break
            }

            // 1.2 assemble input output
            for (var i = lenIn - 1; i >= 0; i--) {
                // inputAssembleList[i] = upInputList[i] + "=" + upOutputList[i]
                inputAssembleList[upInputList[i]] = upOutputList[i]
            }

            console.log("inputAssembleList node")
            // console.log(inputAssembleList)

            // 2. get pair from default
            for (var i = node.input.default.length - 1; i >= 0; i--) {
                // inputAssembleList.push(node.input.name[node.input.count + i] + "=" + node.input.default[i])
                inputAssembleList[node.input.name[node.input.count + i]] = node.input.default[i]
            }

            // 3. set node input value
            node.input.value = inputAssembleList
            
            console.log(node)
        }

        for (var i = upNodeList.length - 1; i >= 0; i--) {
            var upNode = getNodeById(upNodeList[i])

            // TODO: need not use found... enqueue all the input, and uplift the input
            // when run node, if already done, then ignore
            // but, what if cycle?
            if (upNode.status == STATUS.IDLE) {
                runQueue.push(upNode)
                runNodesList.unshift(upNode)
            }
        }

        // console.log(runQueue.length)
    }

    if (!enqueueFlag) {
        showNodeInfo(node)
        runFlowDone()
        alert("Some nodes need inputs! Please check!")
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
        alert(result.statusText)

        // . all done
        runFlowDone()

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

// {
//     "name": "DataFile0",
//     "id": "DataFile0",
//     "mainType": "Data",
//     "subType": "File",
//     "func": "get_csv",
//     "input": {
//         "value": [
//             "names=None",
//             "file=user_info_train.txt"
//         ]
//     },
//     "output": {

//         "default": [
//             "outputDataFile0"
//         ],

//     },

// }

    var content = {
        node: node.id,
        module: node.module,
        func: node.func,
        input: node.input.value,
        output: node.output.default[0],
    }

    var uid = node.id + new Date().getTime()
    // alert(uid)

    var flow = {
        "id": uid,
        "kernelId": kernelId,
        "channel": "flow",
        "content": content,
    }

    runNodeMessage[uid] = flow

    // 3. set current node busy
    setNodeRunStatus(node, STATUS.BUSY)

    // 4. send this message
    var message = JSON.stringify(flow)
    console.log()
    updater.socket.send(message);

    return true
}

function runOneStepDone(message) {

    var node = runNodesList.shift()

    if (message != null) {
        var status = message.status
        node.output.value = message.content

        console.log("node run one step result")
        console.log(node)

        if (status == "ok") {
            setNodeRunStatus(node, STATUS.DONE)
        }
        else if (status == "error") {
            setDownNodesIdle(node.name)
            runFlowDone()
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
}

function setNodeRunStatus(node, status) {

    node.status = status

    var nId = "#" + node.name
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

// function isStartNode(node) {
//     if (node.inputsJs.length == 0) {
//         return true
//     }
//     else {
//         return false
//     }
// }

// function isEndNode(node) {
//     // TODO: 
//     return false
// }

function setCurrentNode(nodeId) {
    $("#"+currentNodeId).css("box-shadow", "")
    $("#"+currentNodeId).css("-o-box-shadow", "")
    $("#"+currentNodeId).css("-webkit-box-shadow", "")
    $("#"+currentNodeId).css("-moz-box-shadow", "")

    currentNodeId = nodeId

    if (nodeId == "" || nodeId == null) {

    }
    else {

        // var nodeColor = getNodeColorById(currentNodeId)
        // // alert(nodeColor)

        // $("#"+currentNodeId).css("box-shadow", "2px 2px 12px " + nodeColor)
        // $("#"+currentNodeId).css("-o-box-shadow", "2px 2px 12px " + nodeColor)
        // $("#"+currentNodeId).css("-webkit-box-shadow", "2px 2px 12px " + nodeColor)
        // $("#"+currentNodeId).css("-moz-box-shadow", "2px 2px 12px " + nodeColor)

        $("#"+currentNodeId).css("box-shadow", "2px 2px 16px #444")
        $("#"+currentNodeId).css("-o-box-shadow", "2px 2px 16px #444")
        $("#"+currentNodeId).css("-webkit-box-shadow", "2px 2px 16px #444")
        $("#"+currentNodeId).css("-moz-box-shadow", "2px 2px 16 px #fff")
    }
}

function getNodeColorById(nodeId) {
    var nodeType = getNodeById(nodeId).mainType
    return COLORNODE[nodeType]
}

///////////////////////////////////////////////////
// add node

// var nodeCount = 0
var nodeList = {
    "Data": {
        "File": {
            count: 0,
            },

        "Merge": {
            count: 0,
            },
        },
    }

var nodeListByName = {}
// var connectList = {}
// var inputsList = {}
// var outputList = {}
var currentNodeId = null

var STATUS = {
    IDLE : 0, // rgba(255, 255, 255, 0.2)
    BUSY : 1, // rgba(255, 0, 0, 0.2)
    DONE : 2, // rgba(0, 255, 0, 0.2)
    WAIT : 3, // rgba(255, 255, 111, 0.2)
}

var COLORSTATUS = {
    IDLE : "rgba(255, 255, 255, 0.2)",
    BUSY : "rgba(255, 0, 0, 0.4)",
    DONE : "rgba(0, 255, 0, 0.2)",
    WAIT : "rgba(255, 255, 111, 0.3)",
}

var COLORNODE = {
    "Data"        : "rgba(124,238,124,1)",
    "Model"       : "rgba(52,103,137, 1)",
    "Evaluate"    : "rgba(0,191,255,1)",
    "Visualize"   : "rgba(255,215,0,1)",
    "Customize"   : "rgba(139,69,19,1)",
}

var currentStatus = STATUS.IDLE


// Get node type list from server when init
var nodeTypeList = {
    Data: {
        File: {
            display: "Add File", 
            description: "Read a data file as pandas dataframe. \n Inputs: \n - file: csv file \n - names: header names \n Output: pandas dataframe",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                // func: {
                //     funcName: "get_csv",
                //     funcInputs: ["file", "names"], // node input endpoints <-- funcInputs - funcInputsDefaults
                //     funcInputsType: ["File", "String"],
                //     funcInputsCount: 0,
                //     funcInputsDefaults: ["user_info_train.txt", "None"], // used for edit paras
                // },
                module: "data",
                func: "get_csv",
                input: {
                    name: ["file", "names"],
                    type: ["File", "String"],
                    count: 0,
                    default: ["'/workspace/Projects/DataCastle2017/src/data/user_info_train.txt'", "None"],
                    value: null,
                },
                output:{
                    name: null,
                    type: "Data",
                    count: 1,
                    value: null,
                },
            },
        },

        Merge: {
            display: "Merge Data", 
            description: "Merge two data files on columns. \n Inputs: \n - file1: dataframe \n - file2: dataframe - on: columns \n Output: pandas dataframe",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                // func: {
                //     funcName: "merge_df",
                //     funcInputs: ["data1", "data2", "by"], // node input endpoints <-- funcInputs - funcInputsDefaults
                //     funcInputsType: ["Data", "Data", "String"],
                //     funcInputsCount: 2,
                //     funcInputsDefaults: ["id"], // used for edit paras
                // },
                module: "data",    
                func: "merge_df",
                input: {                    
                    name: ["data1", "data2", "on"],
                    type: ["Data", "Data", "String"],
                    count: 2,
                    default: ["'id'"],
                    value: null,
                },
                output:{
                    name: null,
                    type: "Data",
                    count: 1,
                    value: null,
                },                
            },
        },
    },
}


// function initNodeList() {
//     for (var i = nodeTypeList.length - 1; i >= 0; i--) {
//         var mainType = nodeTypeList.mainType
//         var subType = nodeTypeList.subType

//         if (typeof nodeList[mainType] === "undefined" && nodeList[mainType] === null) {
//             nodeList[mainType] = {}
//         }

//         if (typeof nodeList[mainType][subType] === "undefined" && nodeList[mainType][subType] === null) {
//             nodeList[mainType][subType] = {}
//             // count for node, in case of delete node, always + 1
//             nodeList[mainType][subType].count = 0
//         }
        
//     }
// }

function initNode(mainType, subType) {
    var nodeType = nodeTypeList[mainType][subType]

    var nodeId = nodeList[mainType][subType].count
    nodeList[mainType][subType].count = nodeId + 1

    // 0. init a node
    var node = {}

    // name == id, maybe not?!
    node.name = mainType + subType + nodeId
    node.id = node.name
    var nodeName = node.name

    node.mainType = mainType
    node.subType = subType
    node.display = nodeType.display
    node.description = nodeType.description
    // 1. inputs
    node.module = nodeType.content.module
    node.func = nodeType.content.func

    node.input = {} 
    node.input.name = nodeType.content.input.name.slice(0)
    node.input.type = nodeType.content.input.type.slice(0)
    node.input.count = nodeType.content.input.count
    node.input.default = nodeType.content.input.default.slice(0)
    node.input.id = node.input.name.map(function(value){
        return "input" + nodeName + value;
    });
    node.input.value = null // input value should be up nodes output default

    // 2. output
    node.output = {} 
    node.output.name = ["output"] // should be output name like: return a, b, c; not id!
    node.output.type = [nodeType.content.output.type]
    node.output.count = nodeType.content.output.count
    node.output.default = ["output" + nodeName]
    node.output.id = ["output" + nodeName]
    node.output.value = null // output value should be result from server
    

    // var funcInputs = nodeType.content.func.funcInputs
    // var funcInputsType = nodeType.content.func.funcInputsType
    // var funcInputsCount = nodeType.content.func.funcInputsCount
    // var funcInputsDefaults = nodeType.content.func.funcInputsDefaults


    // node.funcInputs = funcInputs.slice(0)
    // node.funcInputsType = funcInputsType.slice(0)
    // node.funcInputsCount = funcInputsCount
    // node.funcInputsDefaults = funcInputsDefaults.slice(0)



    // inputs.length === inputsjs.length then could recursive run flow
    // node.inputsJs = []
    // for (var i = funcInputsCount - 1; i >= 0; i--) {
    //     node.inputsJs[i] = {}
    //     node.inputsJs[i].type = funcInputsType[i]
    //     node.inputsJs[i].name = funcInputs[i]
    //     node.inputsJs[i].id = "input" + nodeName + funcInputs[i]
    // }

    // node.outputJs = []
    // node.outputJs[0] = {}
    // node.outputJs[0].type = node.outputType
    // node.outputJs[0].name = node.outputName
    // node.outputJs[0].id = node.outputName

    node.status = STATUS.IDLE
    // node.status = STATUS.BUSY
    node.found = false

    nodeList[mainType][subType][nodeName] = node
    nodeListByName[nodeName] = node


    return node
} 

// function editNodeInputs(node, inputs) {
//     var mainType = node.mainType
//     var subType = node.subType
//     var nodeName = node.name

//     nodeList[mainType][subType][nodeName].inputs = inputs
// }

// function editNodeOutputDefault(node, outputName) {
//     node.output.default[0] = outputName
// }

// function editNodeOutput(node, output) {
//     var mainType = node.mainType
//     var subType = node.subType
//     var nodeName = node.name
//     nodeList[mainType][subType][nodeName].output = output
// }

// function deleteNode(node) {
//     var mainType = node.mainType
//     var subType = node.subType
//     var nodeName = node.name
//     nodeList[mainType][subType][nodeName] = null
// }

// from html event(e) to add one jsplumb node
function addNode(mainType, subType, e) {

    // offset of cursor
    var diffX = 12.5 * 16 / 2
    var diffY = 4 * 16 / 2

    var X = $('#canvas').offset().left + diffX
    var Y = $('#accordion').offset().top + diffY

    // 0. add node info to node list
    var newNode = initNode(mainType, subType)

    // var disName = newNode.display

    // // 1. add node for jsplumb at canvas
    // var nodeJs = {
    //     id: newNode.name,
    //     name: disName,
    //     disName: disName,
    //     inputsJs: newNode.input,
    //     outputJs: newNode.output,
    //     // inputsType: newNode.funcInputsType,
    //     // output: [{id:newNode.outputName, name: newNode.outputName}],
    //     // outputType: [newNode.outputType],
    // }

    jsplumbUtils.newNode(e.clientX - X, e.pageY - Y, newNode);

    // 2. add description/inputs/output at console
    showNodeInfo(newNode)

    // 3. set current node is this
    setCurrentNode(newNode.name)
    
}

function clearNodeInfo() {
    $("#func-description").empty()
    $("#func-inputs").empty()
    $("#func-output").empty()
}

function getNodeById(id) {
    return getNodeByName(id)
}

function getNodeByName(name) {
    return nodeListByName[name]
}

function showNodeInfo(node) {
    showDescription(node)
    showInputs(node)
    showOutput(node)
}

function showDescription(node) {
    // TODO:func-description
    $("#func-description").empty()
    var d = document.createElement("pre")

    d.innerHTML = node.description

    $("#func-description").append(d)

}

function showInputs(node) {
    $("#func-inputs").empty()

    for (var i = node.input.default.length - 1; i >= 0; i--) {
        var d = document.createElement("div")
        d.className = "input-group"

        var s = document.createElement("span")
        s.className = "input-group-addon"
        s.innerHTML = node.input.name[node.input.count + i]

        var t = document.createElement("input")
        t.type = "text"
        t.className = "form-control"
        t.value = node.input.default[i]
        t.id = "text" + node.name + "input" + i

        $(t).on('change', function(e) {
            // console.log(e)
            var node = getNodeById(currentNodeId)

            var notIdLength = ("text" + node.name + "input").length
            node.input.default[e.currentTarget.id.substring(notIdLength)] = $(this).val()

            // change all nodes downside of status idle
            setDownNodesIdle(node.name)
        });

        d.append(s)
        d.append(t)

        $("#func-inputs").append(d)
    }
}

function showOutput(node) {
    $("#func-output").empty()
    var d = document.createElement("div")
    d.className = "input-group"

    var s = document.createElement("span")
    s.className = "input-group-addon"
    s.innerHTML = "Output"

    var t = document.createElement("input")
    t.type = "text"
    t.className = "form-control"
    t.value = node.output.default[0]
    t.id = "text" + node.name + "output"

    $(t).on('change', function(e) {
        // console.log(e)
        var node = getNodeById(currentNodeId)

        node.output.default[0] = $(this).val()

        // console.log(node)

        // change all nodes downside of status idle
        setDownNodesIdle(node.name)

        // if connect to a target, then change label name
        jsplumbUtils.setConnectionLabels(node)
    });

    d.append(s)
    d.append(t)

    $("#func-output").append(d)
    $("#func-output").append(node.output.value)

}

function getUpNodes(nodeName) {
    return jsplumbUtils.getUpNodes(nodeName)
}

function getDownNodes(nodeName) {
    return jsplumbUtils.getDownNodes(nodeName)
}

function setDownNodesIdle(nodeName) {
    // 0. TODO: check circle

    // 1. set down nodes
    var downList = getDownNodes(nodeName)
    console.log("Show down list from setDownNodesIdle")
    console.log(downList)

    // recursive set node down to idle
    if (downList.length > 0) {
        for (var i = downList.length - 1; i >= 0; i--) {
            setDownNodesIdle(downList[i])
        }
    }

    var node = getNodeByName(nodeName)

    setNodeRunStatus(node, STATUS.IDLE)

    pushDelVar(node)

    return true
}

function pushDelVar(node) {
    runDelVarList.push(node.output.default[0])
}

function showHelp(mainType, subType) {
    $("#func-description").empty()
    $("#func-inputs").empty()
    $("#func-output").empty()

    var d = document.createElement("pre")

    d.innerHTML = nodeTypeList[mainType][subType].description

    $("#func-description").append(d)


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



    // TODO: init node type list & node list from server

    // TODO: from node type list, generate node tree

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
        var url = "ws://localhost:8008/run_socket";
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
        alert(mContent);
        clearNodeInfo()
        // var node = $(mContent);
        // $("#console").remove()
        $("#func-output").append(mContent);
        // node.slideDown();
    }
    else if (mChannel == "flow") {
        runOneStepDone(message)
    }
   
}