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

function moveNodes() {
    for (var key in nodeListByName) {
        console.log($('#' + key))
        // $('#' + key).style.left = "100px"
        document.getElementById(key).style.left = "-100px"
    }

    jsplumbUtils.repaintJsplumb(window.instance, {})
}

function run() {
    alert("runrunrunrunrunrunrunrunrunrunrunrunrunrun")

    // TEST!!!
    // moveNodes()


    // return

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

// var canvasDict = {}

// set runNodesList as global var
var runNodesList = []
var runNodeMessage = []
var runDelVarList = []
var kernelId = ""


function runFlow() {
    runNodesList = []

    // 0. check current node to run
    if (currentNodeId == null) {
        alert("Please choose a node!")
        runFlowDone()
        return true
    }

    // TODO: unshift up nodes until all is start node!!!
    var node = getNodeById(currentWidgetId, currentNodeId)

    // 1. this node is done, then just show the info
    if (node.status == STATUS.DONE) {
        showNodeInfo(node)
        runFlowDone()
        return true
    }

    // TODO: can not run widget!!!
    if (node.type == "widget") {
        alert("Please choose a node instead of widget!")
        showNodeInfo(node)
        runFlowDone()
        return true
    }
    // 2. this node is idle, need run 
    // 2.0 TODO: check circle!!!


    // 2.1 recursive get run flow node list
    // TEST:!!!!!!!!!! widgets should find its instance
    // var widget = getWidgetById(currentWidgetIdRunning)
    // currentInstanceRunning = widget.instance
    // from widget conns, get up nodes
    // we can also get index, if necessary


    // TODO: get all up info, from this widget upside! Not all widgets...
    // var upInfo = {}
    // for (var wId in widgetList) {
    //     upInfo[wId] = getUpInfoFromWidgetConns(wId)
    // }

    // upInfo = getUpInfo(upInfo)

    // console.log("upInfo!!!!!!!!!!!!!")
    // console.log(upInfo)

    // return


    // get all node, from widget to widget!
    var enqueueFlag = getRunQueueFromNode(node)

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

function getRunQueueFromNode(node) {

    // console.log("upInfo")
    // console.log(upInfo)

    var runQueue = []
    runQueue.push(node)

    runNodesList.unshift(node)

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
        for (var i = node.input.value.length - 1; i >= 0; i--) {
            var input = node.input.value[i]
            if (!(typeof input == "undefined" || input == null)) {
                input.index = i
                upNodeList.push(input)
            }
        }
     

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
            // var inputAssembleList = {}

            // 1.1 get pair from endpoint

            // @deprecated
            // var outInPair = jsplumbUtils.getOutInPairsFromEps(currentInstanceRunning, node.id)
            // var upInputList = outInPair.upInputList
            // var upOutputList = outInPair.upOutputList
            // var upInputList = []
            // var upOutputList = []
            // if (!(typeof upInfo[node.id] == "undefined" || upInfo[node.id] == null)) {
            //     upInputList = upInfo[node.id].upInputList
            //     upOutputList = upInfo[node.id].upOutputList
            // }
             

            // var lenIn = upInputList.length
            // var lenOut = upOutputList.length

            // if (lenIn != lenOut) {
            //     enqueueFlag = false
            //     runQueue = []
            //     break
            // }

            // // 1.2 assemble input output
            // for (var i = lenIn - 1; i >= 0; i--) {
            //     // inputAssembleList[i] = upInputList[i] + "=" + upOutputList[i]
            //     inputAssembleList[upInputList[i]] = upOutputList[i]
            // }

            // console.log("inputAssembleList node")
            // console.log(inputAssembleList)

            var inputAssembleList = {}
            // 1. get pair from input, and push to run queue
            for (var i = upNodeList.length - 1; i >= 0; i--) {
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
            for (var i = node.input.default.length - 1; i >= 0; i--) {
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

    var uid = node.widgetId + node.id + new Date().getTime()
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

    // 5. runDelVarList set empty
    clearDelVar()
    

    return true
}

function runOneStepDone(message) {
    console.log("run result message!!!!!!!!")
    console.log(message)

    var node = runNodesList.shift()

    if (message != null) {
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
        }
        else if (status == "error") {
            setDownNodesIdle(currentWidgetIdRunning, node.id)
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

    // 2. for all nodes in run list, set idle
    for (var i = runNodesList.length - 1; i >= 0; i--) {
        setNodeRunStatus(runNodesList[i], STATUS.IDLE)
    }

    runNodesList = []
}

function setNodeRunStatus(node, status) {

    // 0. set status
    node.status = status

    // 1. node is in the widget?!
    var widgetId = node.widgetId
    var nodeId = node.id
    while (widgetId != null) {
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
        nodeId = widget.sourceNodeId
        widgetId = widget.sourceId
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

function getNodeColorById(widgetId, nodeId) {
    var nodeType = getNodeById(widgetId, nodeId).mainType
    return COLORNODE[nodeType]
}

///////////////////////////////////////////////////
// add node

// var nodeCount = 0
// var nodeList = {}
// var nodeList = {
//     "Data": {
//         "File": {
//             count: 0,
//             },

//         "Merge": {
//             count: 0,
//             },
//         },
//     }

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
    "Data"        : "rgba(100,221,23,1)",
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
                    default: ["'/home/shun/Projects/Pkbigdata/gitProject/DataCastle2017/src/data/user_info_train.txt'", "None"],
                    value: null,
                    valuePair: null,
                },
                output:{
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                    connNodes: [],
                },
            },
        },

        Merge: {
            display: "Merge Data", 
            description: "Merge two data files on columns. \n Inputs: \n - data1: dataframe \n - data2: dataframe - on: columns \n Output: pandas dataframe",
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
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Fillna: {
            display: "Fill Missing", 
            description: "Fill missing value. \n Inputs: \n - data: Data \n - method: 'mean'/'median', String \n Output: Data",
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
                func: "fillna_df",
                input: {
                    name: ["data", "method"],
                    type: ["Data", "String"],
                    count: 1,
                    default: ["'mean'"],
                    value: null,
                },
                output:{
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        Split: {
            display: "Split Data", 
            description: "Get part columns of data. \n Inputs: \n - data: Data \n - columns: columns, List, String \n Output: Data, (default get all columns)",
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
                func: "split_df",
                input: {
                    name: ["data", "columns"],
                    type: ["Data", "List"],
                    count: 1,
                    default: ["None"],
                    value: null,
                },
                output:{
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        TrainTest: {
            display: "Get Train Test", 
            description: "Standardize data, and then split X, y to X1, X2, y1, y2. \n Inputs: \n - X: features, Data \n - y: labels, Data \n - train_size: The proportion of the train, Number \n Output: \n - X1: For train, Data \n - X2: For test, Data \n - y1: For train, Data \n - y2: For test, Data",
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
                func: "get_train_test",
                input: {
                    name: ["X", "y", "train_size"],
                    type: ["Data", "Data", "Number"],
                    count: 2,
                    default: ["0.5"],
                    value: null,
                },
                output:{
                    name: ["X1", "X2", "y1", "y2"],
                    type: ["Data", "Data", "Data", "Data"],
                    count: 4,
                    default: null,
                    value: null,
                },
            },
        },
    },
    Model: {
        RandomForestClassifier: {
            display: "Random Forest Classifier", 
            description: "Random Forest Classifier. \n Inputs: \n - X: features, Data \n - y: labels, Data \n - n_estimators: Number  \n Output: Model",
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
                module: "model",
                func: "cls_rfc",
                input: {
                    name: ["X", "y", "n_estimators"],
                    type: ["Data", "Data", "Number"],
                    count: 2,
                    default: ["10"],
                    value: null,
                },
                output:{
                    name: ["model"],
                    type: ["Model"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        XGBoost: {
            display: "XGBoost", 
            description: "XGBoost. \n Inputs: \n - Inputs: \n - X: features, Data \n - y: labels, Data \n - objective: logistic regression for binary classification  \n Output: Model",
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
                module: "model",    
                func: "cls_xgb",
                input: {                    
                    name: ["X", "y", "objective"],
                    type: ["Data", "Data", "String"],
                    count: 2,
                    default: ["'binary:logistic'"],
                    value: null,
                },
                output:{
                    name: ["model"],
                    type: ["Model"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },
    },
    Evaluate: {
        Predict: {
            display: "Predict", 
            description: "Predict. \n Inputs: \n - model: Model \n - X: predict data, Data \n Output: predict",
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
                module: "evaluate",
                func: "eva_predict",
                input: {
                    name: ["model", "X"],
                    type: ["Model", "Data"],
                    count: 2,
                    default: [],
                    value: null,
                },
                output:{
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        PredictProb: {
            display: "Predict Probability", 
            description: "Predict Probability. \n Inputs: \n - model: Model \n - X: predict data, Data \n Output: predict",
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
                module: "evaluate",    
                func: "eva_predict_proba",
                input: {
                    name: ["model", "X"],
                    type: ["Model", "Data"],
                    count: 2,
                    default: [],
                    value: null,
                },
                output:{
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                },              
            },
        },

        ROCAUCScore: {
            display: "ROC AUC Score", 
            description: "ROC AUC Score. \n Inputs: \n - y_true: Data \n - y_score: Data \n Output: Number",
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
                module: "evaluate",
                func: "eva_roc_auc_score",
                input: {
                    name: ["y_true", "y_score"],
                    type: ["Data", "Data"],
                    count: 2,
                    default: [],
                    value: null,
                },
                output:{
                    name: ["score"],
                    type: ["Number"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        Split: {
            display: "Split Data", 
            description: "Get part columns of data. \n Inputs: \n - data: Data \n - columns: columns, List, String \n Output: Data, (default get all columns)",
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
                func: "split_df",
                input: {
                    name: ["data", "columns"],
                    type: ["Data", "List"],
                    count: 1,
                    default: ["None"],
                    value: null,
                },
                output:{
                    name: ["data"],
                    type: ["Data"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        TrainTest: {
            display: "Get Train Test", 
            description: "Standardize data, and then split X, y to X1, X2, y1, y2. \n Inputs: \n - X: features, Data \n - y: labels, Data \n - train_size: The proportion of the train, Number \n Output: - X1: For train, Data \n - X2: For test, Data \n - y1: For train, Data \n - y2: For test, Data",
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
                func: "get_train_test",
                input: {
                    name: ["X", "y", "train_size"],
                    type: ["Data", "Data", "Number"],
                    count: 2,
                    default: ["0.5"],
                    value: null,
                },
                output:{
                    name: ["X1", "X2", "y1", "y2"],
                    type: ["Data", "Data", "Data", "Data"],
                    count: 4,
                    default: null,
                    value: null,
                },
            },
        },
    },

    Visualize: {},

    Customize: {
        Merge3: {
            display: "Merge 3 Data", 
            description: "Merge 3 data files on columns. \n Inputs: \n - data1: dataframe \n - data2: dataframe \n - data3: dataframe \n - on: columns \n Output: pandas dataframe",
            type: "widget",
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
                module: "widget",    
                func: "widgetMerge3",
                input: {                    
                    name: ["File1_data1", "File1_data2", "File2_data2", "File1_on", "File2_on"],
                    type: ["Data", "Data", "Data", "String", "String"],
                    count: 3,
                    default: ["'id'", "'id'"],
                    value: null,
                },
                output:{
                    name: ["File1_data", "File2_data"],
                    type: ["Data", "Data"],
                    count: 2,
                    default: null,
                    value: null,
                },                
            },
        },
    },
}

var widgetTypeList = {
    widgetMerge3 : {
        nodes: {
            node1: {
                name: "File1",
                mainType: "Data",
                subType: "Merge",
                inputsDefault: ["'id'"],
                // inputsId: ["xxxxx", "xxxxx"],
                // outputsId: ["yyyyy", "yyyyy"],
                position: {
                    left: 200,
                    top: 200,
                },
            },
            node2: {
                name: "File2",
                mainType: "Data",
                subType: "Merge",
                inputsDefault: ["'id'"],
                // inputsId: ["xxxxx", "xxxxx"],
                // outputsId: ["yyyyy", "yyyyy"],
                position: {
                    left: 550,
                    top: 550,
                },
            },
        },
        conns: [
            {output: {node: "node1", index: 0}, input: {node: "node2", index: 0}}, 
        ],
        // ["File1_data1", "File1_data2", "File2_data2", "File1_on", "File2_on"],
        inputs: [
            {name: "File1_data1", node: "node1", index: 0, type: "String", default: null},  
            {name: "File1_data2", node: "node1",  index: 1, type: "String", default: null},  
            {name: "File2_data2", node: "node2",  index: 1, type: "String", default: null},  
            {name: "File1_on", node: "node1",  index: 2, type: "Data", default: "id"},  
            {name: "File2_on", node: "node2",  index: 2, type: "Data", default: "id"},
        ],
        outputs: [
            {name: "File1_data", node: "node1", index: 0, type: "Data"},  
            {name: "File2_data", node: "node2",  index: 0, type: "Data"},  
        ],
    }

    

}

// function initNodeList() {
//     for (var mainType in nodeTypeList) {
//         nodeList[mainType] = {}

//         for (var subType in nodeTypeList[mainType]) {
//             nodeList[mainType][subType] = {}
//             nodeList[mainType][subType].count = 0
//         }

//     }
// }

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

// IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// About Widget
// 1. each widget contains: 
// id: user input, unique
// display: for display, default id
// description: xxxxx
// canvas: current canvas
// nodes: {node1/nodeId:[mainType, subType, type, inputs, outputs, position], xxxxx}
// conns: [[nodes[x1]:x2, nodes[y1]:y2], xxxxxx]
// [[getNodeById(node1.id).output.name[x], getNodeById(node2.id).output.name[y]], xxxxxxxxxxxxxx]

// 2. Widget init
// var widgetList = {
//     widgetId: widget,
//     xxxxxx
// }
// var widget = {
//     id: widgetId,
//     display: "Workspace"/input,
//     description: "",
//     container: currentInstanceId
//     instance: instance,
//     nodes: [],
//     conns: [],
// }

// 3. init node(nodeId = uuid!!!, not use nodeList!!!)
// paras input: [mainType, subType, type, widgetId, inputs=null, outputs=null, position=null]
// paras output: return node!
// push node in nodeList for search by widgetId/nodeId

// 4. if node type is widget, should init widget with class widget
// When, click enter, then batch draw canvas of jsPlumb, with canvasId from widget inited

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

function getWidgetIdFromTabId(tabId) {
    return tabId.slice(0, -3)
}

// from user input widget name, get widgetId uuid
function getWidgetUUID(widgetName) {
    // return widgetName + new Date().getTime()
    var widgetName = widgetName.replace(/\s+/g, "")
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]")
    var specialstr = "";
    for(var i = 0; i < widgetName.length; i++) {
        specialstr += widgetName.substr(i, 1).replace(pattern,'');
    }

    return specialstr + new Date().getTime()
}

function getNodeUUID(mainType, subType) {
    return mainType + subType + new Date().getTime() + Math.ceil(Math.random()*10)
}

var widgetList = {}
var currentWidgetId = null // fore-end user widget 
var currentInstance = null
var currentWidgetIdRunning = null // back-end running widget
var currentInstanceRunning = null

// function initWidgetList() {
//     widgetList[currentWidgetId] = {}
// }

function addWidgetToList(widget) {
    widgetList[widget.id] = widget
}

function resetCurrentWidget() {
    // widgetList[currentWidgetId] = {}
    // initWidgetToList(currentWidgetId)
    widgetList[currentWidgetId].nodes = {}
    widgetList[currentWidgetId].conns = {}
}

// when enter a new widget, then add to list!
// create widget need not do this!
function initWidgetToList(soureWidgetId, sourceNodeId, widgetId) {
    
    // var widget = {nodeIdxxxx:{ node: null,position: [null, null]}}
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
    // widgetList[widgetId].nodes[nodeId].node = node
    // widgetList[widgetId].nodes[nodeId].node.inputs = node.input
    // widgetList[widgetId].nodes[nodeId].node.outputs = node.output
    
    // widgetList[widgetId].nodes[nodeId].position = {}
    // widgetList[widgetId].nodes[nodeId].position.left = null
    // widgetList[widgetId].nodes[nodeId].position.top = null
}

function delNodeFromWidget(widgetId, nodeId) {
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

    // if (document.getElementById(node.id)) {
    //     var disLength = node.name.length * 8 + 64
    //     // alert(disLength)
    //     var inLength = (node.input.count + 1) * 50
    //     var outLength = (node.output.count + 1) * 50
    //     var maxLength = Math.max.apply(Math,[disLength, inLength, outLength])

    //     // alert(maxLength)
    //     $("#" + node.id).css("width", maxLength + "px")

    // }



}

function getWidgetById(widgetId) {
    return widgetList[widgetId]
}

// TODO: save and construct widget in and like widget type list
function saveWidget(widgetName) {

    // 0. get widget name
    var widgetId = getWidgetUUID(widgetName)
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
        // newWidgetType.nodes[nodeId].inputsId = node.input.id.slice(0)
        newWidgetType.nodes[nodeId].inputsDefault = node.input.default.slice(0)
        // newWidgetType.nodes[nodeId].outputsId = node.output.id.slice(0)
        newWidgetType.nodes[nodeId].position = {left: node.position.left, top: node.position.top}


        // inputs(default)
        // push default input name into inputs
        // for (var i = node.input.default.length - 1; i >= 0; i--) {
        for (var i = 0; i < node.input.default.length; i++) {
            // newWidgetType.inputs.push({
            //     name: node.name + "_" + node.input.name[i + node.input.count], 
            //     type: node.input.type[i + node.input.count],
            //     default: node.input.default[i],
            //     node: nodeId, 
            //     // value: node.input.id[i + node.input.count]
            //     index: i + node.input.count})

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
        // for (var i = node.output.default.length - 1; i >= 0; i--) {
        for (var i = 0; i < node.output.default.length; i++) {
            newWidgetType.outputs.push({
                name: node.name + "_" + node.output.name[i],
                type: node.output.type[i],
                node: nodeId,
                index: i,
            })
        }

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
                // newWidgetType.inputs.push({
                //     name: node.name + "_" + inputName, 
                //     type: inputType,
                //     default: null,
                //     node: nodeId, 
                //     index: inputIndex})

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
                // for (var j = eps.length - 1; j >= 0; j--) {
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

    // for (var i = newWidgetType.inputs.length - 1; i >= 0; i--) {
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
    // for (var i = newWidgetType.outputs.length - 1; i >= 0; i--) {
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
            description: widgetName,
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
    resetCurrentWidget()


   
    // NOT ADD TO LIST
    // addWidgetToList(widgetId)

    // 1. create one widget type, from current nodes!

    // 2. add widget type to customize.

    // TODO: 
    // 1.1 get all nodes info & positions

    // 1.2 jsPlumb.getConnections();jsPlumb.getAllConnections();  

    // 2. with widgetId from widgetInput, push in all nodes

    // 3.  clear current nodes
    // re-add current widget, means init it with empty


    // console.log(widgetList[currentWidgetId])



    // console.log(widgetList[currentWidgetId])

    // 4. add one node with type "widget", position center

    // 5. set current node is this widget, and show its info


    // 6. add widget to customize

    return
}

// TODO: re-construct widget from widget type list
function initWidget(widgetId, widgetType) {

    // widgetMerge3 : {
    //     nodes: {
    //         node1: {
    //             name: "File1",
    //             mainType: "Data",
    //             subType: "Merge",
    //             inputsDefault: ["'id'"],
    //             // inputsId: ["xxxxx", "xxxxx"],
    //             // outputsId: ["yyyyy", "yyyyy"],
    //             position: {
    //                 left: 100,
    //                 top: 100,
    //             },
    //         },
    //     },
    //     conns: [
    //         {output: {node: "node1", index: 0}, input: {node: "node2", index: 0}}, 
    //     ],
    //     // ["File1_data1", "File1_data2", "File2_data2", "File1_on", "File2_on"],
    //     inputs: [
    //         {name: "File1_data1", node: "node1", index: 0, type: "String", default: null},  
    //         {name: "File1_data2", node: "node1",  index: 1, type: "String", default: null},  
    //         {name: "File2_data2", node: "node2",  index: 1, type: "String", default: null},  
    //         {name: "File1_on", node: "node1",  index: 2, type: "Data", default: "id"},  
    //         {name: "File2_on", node: "node2",  index: 2, type: "Data", default: "id"},
    //     ],
    //     outputs: [
    //         {name: "File1_data", node: "node1", index: 0, type: "Data"},  
    //         {name: "File1_data", node: "node1",  index: 0, type: "Data"},  
    //     ],
    // }

    

    // TODO: init one widget, and add to list!
    // TODO: initNode when widget-node added!
    // paint jsPlumb when tab entered!

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
        // var inputsId = node.inputsId.slice(0)
        // var outputsId = node.outputsId.slice(0)
        var inputs = {}
        // inputs.id = inputsId
        inputs.default = inputsDefault
        inputs.nodeName = name
        // var outputs = {}
        // outputs.id = outputsId
        var outputs = null

        var position = {}
        position.left = node.position.left
        position.top = node.position.top

        var newNode = initNode(mainType, subType, widgetId, inputs, outputs, position)

        addNodeToWidget(widgetId, newNode)

        nodeIdNewOld[nodeId] = newNode.id

        nodes.push(newNode)
    }

    addNewOldPairToWidget(widgetId, nodeIdNewOld)

    // 2. init conns
    for (var i = widgetTypeInfo.conns.length - 1; i >= 0; i--) {
        var connOld = widgetTypeInfo.conns[i]
        var conn = {}
        var outputNodeId = nodeIdNewOld[connOld.output.node]
        var outputIndex = connOld.output.index
        var inputNodeId = nodeIdNewOld[connOld.input.node]
        var inputIndex = connOld.input.index
        conn.id = getConnectionUUID(outputNodeId, outputIndex, inputNodeId, inputIndex)
        conn.output = {node: outputNodeId, index: outputIndex}
        conn.input = {node: inputNodeId, index: inputIndex}

        // addConnToWidget(widgetId, conn)
        // fake endpoints
        var outputNode = getNodeById(widgetId, outputNodeId)
        var inputNode = getNodeById(widgetId, inputNodeId)
        var outputEp = {outputJsId: outputNode.output.id[outputIndex]}
        var inputEp = {inputJsId: inputNode.input.id[inputIndex]}
        connectionAdded(widgetId, outputNodeId, outputEp, inputNodeId, inputEp)
    }

    // check all nodes, and init widget
    for (var i = nodes.length - 1; i >= 0; i--) {
        var newNode = nodes[i]
        if (newNode.type == "widget") {
            var newWidgetId = getWidgetIdFromNodeId(newNode.id)
            initWidgetToList(widgetId, newNode.id, newWidgetId)
            initWidget(newWidgetId, newNode.widgetType)
            // addWidgetToList(newWidget)
            console.log("Add new widget-node!!!!!!!!!!!!!!!!!")
            console.log(widgetList)
        }
    }
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

function drawWidgetNodes(widget) {

    // TODO:

    for (var nodeId in widget.nodes) {
        var newNode = widget.nodes[nodeId]
        var x = newNode.position.left
        var y = newNode.position.top
        jsplumbUtils.newNode(window.instance, x, y, newNode);
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
    // body...
    // id = outputNodeId + index + inputNodeId + index!!!
    return outputNodeId + outputIndex + inputNodeId + inputIndex
}

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

    // 
    var inputIndepth = getInputNodeIndepth(inputNode, inputIndex)
    var outputIndepth = getOutputNodeIndepth(outputNode, outputIndex)

    var inputIndepthNode = inputIndepth.node
    var inputIndepthIndex = inputIndepth.index

    var outputIndepthNode = outputIndepth.node
    var outputIndepthIndex = outputIndepth.index

    inputIndepthNode.input.value[inputIndepthIndex] = {}
    inputIndepthNode.input.value[inputIndepthIndex].widgetId = outputIndepthNode.widgetId
    inputIndepthNode.input.value[inputIndepthIndex].nodeId = outputIndepthNode.id
    inputIndepthNode.input.value[inputIndepthIndex].outputId = outputIndepthNode.output.default[outputIndepthIndex]

    outputIndepthNode.output.connNodes.push(inputIndepthNode)

    // BUG: cannot connect widget indepth, means, only combine widget with nodes!!!
    // if node is widget, then also add connection to widget's node
    // if (inputNode.type == "widget" && outputNode.type == "node") {
    //     // 1. get widge type
    //     var inWidgetType = widgetTypeList[inputNode.widgetType]
    //     var inWidgetTypeInput = inWidgetType.inputs[inputIndex]
    //     // 2. get node from widget with this input
    //     var inWidgetIdOfWidgetType = getWidgetIdFromNodeId(inputNodeId)
    //     var inWidgetOfWidgetType = widgetList[inWidgetIdOfWidgetType]
    //     var inputNodeIdOfWidget = inWidgetOfWidgetType.newOldPair[inWidgetTypeInput.node]
    //     var inputNodeIndexOfWidget = inWidgetTypeInput.index
    //     var inputNodeOfWidget = getNodeById(inWidgetIdOfWidgetType, inputNodeIdOfWidget)

    //     // add input value to node
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget] = {}
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget].widgetId = widgetId
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget].nodeId = outputNodeId
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget].outputId = outputEp.outputJsId

    //     outputNode.output.connNodes.push(inputNodeOfWidget)

    // }
    // else if (outputNode.type == "widget" && inputNode.type == "node") {
    //     // 1. get widge type
    //     var outWidgetType = widgetTypeList[outputNode.widgetType]
    //     var outWidgetTypeOutput = outWidgetType.outputs[outputIndex]
    //     // 2. get node from widget with this input
    //     var outWidgetIdOfWidgetType = getWidgetIdFromNodeId(outputNodeId)
    //     var outWidgetOfWidgetType = widgetList[outWidgetIdOfWidgetType]
    //     var outputNodeIdOfWidget = outWidgetOfWidgetType.newOldPair[outWidgetTypeOutput.node]
    //     var outputNodeIndexOfWidget = outWidgetTypeOutput.index
    //     var outputNodeOfWidget = getNodeById(outWidgetIdOfWidgetType, outputNodeIdOfWidget)

    //     // add input value to node
    //     inputNode.input.value[inputIndex] = {}
    //     inputNode.input.value[inputIndex].widgetId = outWidgetIdOfWidgetType
    //     inputNode.input.value[inputIndex].nodeId = outputNodeIdOfWidget
    //     inputNode.input.value[inputIndex].outputId = outputNodeOfWidget.output.default[outputNodeIndexOfWidget]

    //     outputNodeOfWidget.output.connNodes.push(inputNode)
    // }
    // else if (inputNode.type == "widget" && outputNode.type == "widget"){
    //     // 1. get widge type
    //     var inWidgetType = widgetTypeList[inputNode.widgetType]
    //     var inWidgetTypeInput = inWidgetType.inputs[inputIndex]
    //     // 2. get node from widget with this input
    //     var inWidgetIdOfWidgetType = getWidgetIdFromNodeId(inputNodeId)
    //     var inWidgetOfWidgetType = widgetList[inWidgetIdOfWidgetType]
    //     var inputNodeIdOfWidget = inWidgetOfWidgetType.newOldPair[inWidgetTypeInput.node]
    //     var inputNodeIndexOfWidget = inWidgetTypeInput.index
    //     var inputNodeOfWidget = getNodeById(inWidgetIdOfWidgetType, inputNodeIdOfWidget)

    //     // 1. get widge type
    //     var outWidgetType = widgetTypeList[outputNode.widgetType]
    //     var outWidgetTypeOutput = outWidgetType.outputs[outputIndex]
    //     // 2. get node from widget with this input
    //     var outWidgetIdOfWidgetType = getWidgetIdFromNodeId(outputNodeId)
    //     var outWidgetOfWidgetType = widgetList[outWidgetIdOfWidgetType]
    //     var outputNodeIdOfWidget = outWidgetOfWidgetType.newOldPair[outWidgetTypeOutput.node]
    //     var outputNodeIndexOfWidget = outWidgetTypeOutput.index
    //     var outputNodeOfWidget = getNodeById(outWidgetIdOfWidgetType, outputNodeIdOfWidget)

    //     // add input value to node
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget] = {}
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget].widgetId = outWidgetIdOfWidgetType
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget].nodeId = outputNodeIdOfWidget
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget].outputId = outputNodeOfWidget.output.default[outputNodeIndexOfWidget]


    //     outputNodeOfWidget.output.connNodes.push(inputNodeOfWidget)
    // }
    // else {
    //     inputNode.input.value[inputIndex] = {}
    //     inputNode.input.value[inputIndex].widgetId = widgetId
    //     inputNode.input.value[inputIndex].nodeId = outputNodeId
    //     inputNode.input.value[inputIndex].outputId = outputEp.outputJsId

    //     outputNode.output.connNodes.push(inputNode)
    // }

    console.log("connectionAdded")
    console.log(widgetList)

}

function connectionDetached(widgetId, outputNodeId, outputEp, inputNodeId, inputEp) {
    // widgetId, inputEp, outputEp, conn_id
    var inputNode = getNodeById(widgetId, inputNodeId)
    var outputNode = getNodeById(widgetId, outputNodeId)

    var inputIndex = inputNode.input.id.indexOf(inputEp.inputJsId)
    var outputIndex = outputNode.output.id.indexOf(outputEp.outputJsId)
    // widgetId, inputEp, outputEp, 
    var connId = getConnectionUUID(outputNodeId, outputIndex, inputNodeId, inputIndex)

    delConnFromWidget(widgetId, connId)


    // 
    var inputIndepth = getInputNodeIndepth(inputNode, inputIndex)
    var outputIndepth = getOutputNodeIndepth(outputNode, outputIndex)

    var inputIndepthNode = inputIndepth.node
    var inputIndepthIndex = inputIndepth.index

    var outputIndepthNode = outputIndepth.node
    var outputIndepthIndex = outputIndepth.index

    inputIndepthNode.input.value[inputIndepthIndex] = null
    outputIndepthNode.output.connNodes.splice(outputIndepthNode.output.connNodes.indexOf(inputIndepthNode), 1)

    // if node is widget, then also add connection to widget's node
    // if (inputNode.type == "widget" && outputNode.type == "node") {
    //     // 1. get widge type
    //     var inWidgetType = widgetTypeList[inputNode.widgetType]
    //     var inWidgetTypeInput = inWidgetType.inputs[inputIndex]
    //     // 2. get node from widget with this input
    //     var inWidgetIdOfWidgetType = getWidgetIdFromNodeId(inputNodeId)
    //     var inWidgetOfWidgetType = widgetList[inWidgetIdOfWidgetType]
    //     var inputNodeIdOfWidget = inWidgetOfWidgetType.newOldPair[inWidgetTypeInput.node]
    //     var inputNodeIndexOfWidget = inWidgetTypeInput.index
    //     var inputNodeOfWidget = getNodeById(inWidgetIdOfWidgetType, inputNodeIdOfWidget)

    //     // add input value to node
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget] = null

    //     outputNode.output.connNodes.splice(outputNode.output.connNodes.indexOf(inputNodeOfWidget), 1)
    // }
    // else if (outputNode.type == "widget" && inputNode.type == "node") {
    //     // 1. get widge type
    //     var outWidgetType = widgetTypeList[outputNode.widgetType]
    //     var outWidgetTypeOutput = outWidgetType.outputs[outputIndex]
    //     // 2. get node from widget with this input
    //     var outWidgetIdOfWidgetType = getWidgetIdFromNodeId(outputNodeId)
    //     var outWidgetOfWidgetType = widgetList[outWidgetIdOfWidgetType]
    //     var outputNodeIdOfWidget = outWidgetOfWidgetType.newOldPair[outWidgetTypeOutput.node]
    //     var outputNodeIndexOfWidget = outWidgetTypeOutput.index
    //     var outputNodeOfWidget = getNodeById(outWidgetIdOfWidgetType, outputNodeIdOfWidget)

    //     // add input value to node
    //     inputNode.input.value[inputIndex] = null

    //     outputNodeOfWidget.output.connNodes.splice(outputNodeOfWidget.output.connNodes.indexOf(inputNode), 1)

    // }
    // else if (inputNode.type == "widget" && outputNode.type == "widget"){
    //     // 1. get widge type
    //     var inWidgetType = widgetTypeList[inputNode.widgetType]
    //     var inWidgetTypeInput = inWidgetType.inputs[inputIndex]
    //     // 2. get node from widget with this input
    //     var inWidgetIdOfWidgetType = getWidgetIdFromNodeId(inputNodeId)
    //     var inWidgetOfWidgetType = widgetList[inWidgetIdOfWidgetType]
    //     var inputNodeIdOfWidget = inWidgetOfWidgetType.newOldPair[inWidgetTypeInput.node]
    //     var inputNodeIndexOfWidget = inWidgetTypeInput.index
    //     var inputNodeOfWidget = getNodeById(inWidgetIdOfWidgetType, inputNodeIdOfWidget)

    //     // 1. get widge type
    //     var outWidgetType = widgetTypeList[outputNode.widgetType]
    //     var outWidgetTypeOutput = outWidgetType.outputs[outputIndex]
    //     // 2. get node from widget with this input
    //     var outWidgetIdOfWidgetType = getWidgetIdFromNodeId(outputNodeId)
    //     var outWidgetOfWidgetType = widgetList[outWidgetIdOfWidgetType]
    //     var outputNodeIdOfWidget = outWidgetOfWidgetType.newOldPair[outWidgetTypeOutput.node]
    //     var outputNodeIndexOfWidget = outWidgetTypeOutput.index
    //     var outputNodeOfWidget = getNodeById(outWidgetIdOfWidgetType, outputNodeIdOfWidget)

    //     // add input value to node
    //     inputNodeOfWidget.input.value[inputNodeIndexOfWidget] = null

    //     outputNodeOfWidget.output.connNodes.splice(outputNodeOfWidget.output.connNodes.indexOf(inputNodeOfWidget), 1)
    // }
    // else {
    //     inputNode.input.value[inputIndex] = null

    //     outputNode.output.connNodes.splice(outputNode.output.connNodes.indexOf(inputNode), 1)
    // }

    console.log("connectionDetached")
    console.log(widgetList)
}

function enterWidgetFromNode(node) {

    // 1. create tab/canvas
    // 1.1 create tab
    // var h = "widget" + node.id
    var h = getWidgetIdFromNodeId(node.id)

    var widget = getWidgetById(h)
    if (widget.container != null) {

        console.log(widget.container)

        $('#widgetTabs a[href=#' + h + ']').tab('show')
        return 
    }

    // 2.
    var l = document.createElement("li")
    var tabId = getTabIdFromWidgetId(h)
    l.innerHTML =  "<a href='#" + h + "' data-toggle='tab' id='" + tabId + "'>"  + node.name + "</a> "

    $("#widgetTabs").append(l)

    bindTab(tabId)
    
    // 1.2 create content
    // var c = h + "Canvas"
    var c = getCanvasIdFromWidgetId(h)
    var d = document.createElement("div")
    d.className = "tab-pane fade in active"
    d.id = h
    d.innerHTML = "<div class='jtk-demo-main'>" +
        "<div class='jtk-demo-canvas canvas-wide source-target-demo jtk-surface jtk-surface-nopan canvas' id='" +
        c + "'></div></div>" 
    $("#widgetTabContent").append(d)

    // 2. active tab
    $('#widgetTabs a[href=#' + h + ']').tab('show')
    
    // 3. init widget of workspace
    enterWidget(h, true)

    // TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!. init one widget
    // var widgetId = node.widgetId
    // var widgetType = node.func
    // var widget = initWidget(widgetId, widgetType)
    // var widget = initWidget(h, widgetType)

    // 4. draw nodes

    // 5. draw conns




}

function initNode(mainType, subType, widgetId, inputs, outputs, position) {
    var nodeType = nodeTypeList[mainType][subType]

    // var nodeId = nodeList[mainType][subType].count
    // nodeList[mainType][subType].count = nodeId + 1

    var nodeId = getNodeUUID(mainType, subType)

    // 0. init a node
    var node = {}

    // name == id, maybe not?!
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
    // node.input.value = inputs.value.slice(0) // input value should be up nodes output default
    node.input.value = [] // input value should be up nodes output default
    node.input.valuePair = {}
    node.input.id = node.input.name.map(function(value){ // input id: not change, unique
        return "input" + node.id + value;
    });

    if (inputs != null) {
        node.name = inputs.nodeName
        node.input.default = inputs.default.slice(0) // input default: not change, not unique
        // node.input.id = inputs.id.slice(0) // input id: not change, unique
    }
    else {
        node.input.default = nodeType.content.input.default.slice(0) // input default: not change, not unique

    }


    // 2. output
    node.output = {} 
    node.output.name = nodeType.content.output.name.slice(0) // name: not change, not unique
    node.output.type = nodeType.content.output.type.slice(0)
    node.output.count = nodeType.content.output.count
    node.output.default = node.output.name.map(function(value){ // output default: change, unique
        return "output" + node.id + value;
    });
    node.output.connNodes = []
    node.output.value = null // output value should be result from server
    node.output.id = node.output.default.slice(0) // output id: not change, unique

    // if (outputs != null) {
    //     // node.output.name = outputs.name.slice(0) // name: not change, not unique
    //     // node.output.type = outputs.type.slice(0)
    //     // node.output.count = outputs.count
    //     // node.output.default = outputs.default.slice(0)
    //     node.output.id = outputs.id.slice(0) // output id: not change, unique
    //     // node.output.value = outputs.value.slice(0) // output value should be result from server
    // }
    // else {
    //     node.output.id = node.output.default.slice(0) // output id: not change, unique
    // }

    node.status = STATUS.IDLE
    // node.status = STATUS.BUSY
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


    // nodeList[mainType][subType][nodeName] = node
    // nodeListByName[nodeName] = node

    // widgetList[widgetId].nodes[node.id] = node

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



    // 0. add node info to node list
    // mainType, subType, widgetId, inputs, outputs
    var newNode = initNode(mainType, subType, currentWidgetId, null, null, null)
    // 1. add this node to current widget
    addNodeToWidget(currentWidgetId, newNode)

    if (newNode.type == "widget") {
        var widgetId = getWidgetIdFromNodeId(newNode.id)
        initWidgetToList(currentWidgetId, newNode.id, widgetId)
        initWidget(widgetId, newNode.widgetType)
        // addWidgetToList(newWidget)
        console.log("Add new widget-node!!!!!!!!!!!!!!!!!")
        console.log(widgetList)
    }

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

    // offset of cursor
    // TODO: use node width/height to set diffX/diffY
    var diffX = 9 * 16 / 2
    var diffY = 4 * 16 / 2 + 36

    // var canvasId = getWidgetById(currentWidgetId).container
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

// depracate
function getNodeByName(widgetId, nodeName) {
    return getNodeById(widgetId, nodeName)
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

    d.innerHTML = node.name + "\n" + "Type: " + node.display + "\n" + node.description

    $("#func-description").append(d)

}

function showInputs(node) {
    $("#func-inputs").empty()

    // for (var i = node.input.default.length - 1; i >= 0; i--) {
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

        if (node.type == "widget") {
            $(t).attr("disabled", "true")
        }

        $(t).on('change input propertychange', function(e) {
            // console.log(e)
            var node = getNodeById(currentWidgetId, currentNodeId)

            var notIdLength = ("text" + node.id + "input").length
            node.input.default[e.currentTarget.id.substring(notIdLength)] = $(this).val()

            // change all nodes downside of status idle
            setDownNodesIdle(currentWidgetId, node.id)
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

/*
        var t = document.createElement("input")
        t.type = "text"
        t.className = "form-control"
        t.value = node.output.default[i]
        t.id = "text" + node.name + "output" + i

        $(t).on('change input propertychange', function(e) {
            // console.log(e)
            var node = getNodeById(currentWidgetId, currentNodeId)

            var notIdLength = ("text" + node.name + "output").length
            node.output.default[e.currentTarget.id.substring(notIdLength)] = $(this).val()

            // node.output.default[i] = $(this).val()

            // console.log(node)

            // change all nodes downside of status idle
            setDownNodesIdle(currentWidgetId, node.name)

            // if connect to a target, then change label name
            jsplumbUtils.setConnectionLabels(window.instance, node)
        });

        dc.append(t)
*/
        // if (node.output.value != null) {
        //     // var v = node.output.value[i]
        //     var v = getOutputHtml(node, i)
        //     var vDiv = document.createElement("div")
        //     vDiv.innerHTML = v

        //     dc.append(vDiv)    
        // }

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

    // for (var i = node.output.default.length - 1; i >= 0; i--) {
    //     var d = document.createElement("div")
    //     d.className = "input-group"

    //     var s = document.createElement("span")
    //     s.className = "input-group-addon"
    //     s.innerHTML = node.output.name[i]

    //     var t = document.createElement("input")
    //     t.type = "text"
    //     t.className = "form-control"
    //     t.value = node.output.default[i]
    //     t.id = "text" + node.name + "output"

    //     $(t).on('change', function(e) {
    //         // console.log(e)
    //         var node = getNodeById(currentNodeId)

    //         var notIdLength = ("text" + node.name + "output").length
    //         node.output.default[e.currentTarget.id.substring(notIdLength)] = $(this).val()

    //         // node.output.default[i] = $(this).val()

    //         // console.log(node)

    //         // change all nodes downside of status idle
    //         setDownNodesIdle(node.name)

    //         // if connect to a target, then change label name
    //         jsplumbUtils.setConnectionLabels(node)
    //     });

    //     d.append(s)
    //     d.append(t)

    //     $("#func-output").append(d)
    // }



    // $("#func-output").append(node.output.value[0])

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

// function getUpInfoFromParentWidget(node, upInfo) {

//     var widget = widgetList[node.widgetId]
//     if (widget.sourceWidgetId != null) {
                
//         upInfo = getUpInfoFromWidgetConns(widget.sourceWidgetId, upInfo)
//         upInfo = getUpInfoFromParentWidget(node, upInfo)

//         var sourceWidget = widgetList[widget.sourceWidgetId]

//         var souceNode = sourceWidget.nodes[widget.sourceNodeId]


//         var inputs = widgetTypeList[node.subType].inputs
//         for (var i = inputs.length - 1; i >= 0; i--) {
//             var newNodeId = widget.newOldPair[inputs[i].node]

            
//         }


//     }
    



//     return upInfo
// }

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
    // TEST: should be current running instance!!!
    // var instance = window.instance
    // var widget = getWidgetById(widgetId)

    setDownNodesIdleInInstance(widgetId, nodeId)
}

function setDownNodesIdleInInstance(widgetId, nodeId) {
    // var instance = widget.instance
    // 1. set down nodes
    // var downList = getDownNodes(instance, nodeId)
    var node = getNodeById(widgetId, nodeId)
    var downList = node.output.connNodes
    console.log("Show down list from setDownNodesIdle")
    console.log(downList)

    // recursive set node down to idle
    if (downList.length > 0) {
        for (var i = downList.length - 1; i >= 0; i--) {
            var downNode = downList[i]
            setDownNodesIdleInInstance(downNode.widgetId, downNode.id)
        }
    }

    // var node = getNodeById(widget.id, nodeId)

    setNodeRunStatus(node, STATUS.IDLE)

    // pushDelVar(node)

    return true
}

function pushDelVar(node) {
    runDelVarList = [].concat.apply(runDelVarList, node.output.default)

    console.log("runDelVarList")
    console.log(runDelVarList)

    // node.output.value = null

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
    var defaultNodeId = "workspace"
    var defaultWidgetId = getWidgetIdFromNodeId(defaultNodeId)
    var canvasId = getCanvasIdFromWidgetId(defaultWidgetId)
    var tabId = getTabIdFromWidgetId(defaultWidgetId)
    // 2. init widget of workspace
    initWidgetToList(null, null, defaultWidgetId)

    enterWidget(defaultWidgetId, true)

    // bind tab
    bindTab(tabId)

    // currentWidgetId = getWidgetUUID(defaultWidget)
    // currentWidgetIdRunning = currentWidgetId
    // var currentWidget = addWidgetToList(currentWidgetId)

    // var jsInstance = initJsPlumb(canvasId)
    // currentWidget.instance = jsInstance
    // currentWidget.container = canvasId

    // 3. bind events
    // bindEventsOnReady()

    // TODO: init node type list & node list from server
    // initNodeList()
    // TODO: from node type list, generate node tree


});

// function bindEventsOnReady() {

//     $(".unm,.email").dblclick(function(){   
//         id=$(this).attr("uid");   
//         value=$(this).text();   
//         f=$(this).attr("field");   
//         text_id=$(this).attr("id");   
//         if(value)   
//         {   
//             $(this).html("<input type='text' id="+id+"   name="+f+" value="+value+">");   
//             $(".unm > input,.email>input").focus().blur(function(){   
             
//                     $.ajax({   
//                      type: "POST",   
//                      url: "save.php",   
//                      data:   "id="+id+"&type="+f+"&value="+$("#"+id).val(),   
//                      success: function(msg){ $("#"+text_id).text(msg); }   
//                     });   
//                 })   
      
//         }   
           
//     })   
// }

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

    })

}

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

function cancelWidget() {
    $("#saveWidget").empty()

    $("#saveWidget").append("<div class=\"input-group\" id=\"canvasButton\"> \
                    <button class=\"btn btn-default\" onclick=\"inputWidgetName()\" id=\"widgetButton\">Widget</button> \
                </div>")
}

function confirmWidget() {
    alert($("#widgetDivInput").val())

    saveWidget($("#widgetDivInput").val())

    // . change buttons
    $("#saveWidget").empty()

    $("#saveWidget").append("<div class=\"input-group\" id=\"canvasButton\"> \
                    <button class=\"btn btn-default\" onclick=\"inputWidgetName()\" id=\"widgetButton\">Widget</button> \
                </div>")
}


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
        for (var name in mContent) {
            $("#func-output").append(name);
            $("#func-output").append(mContent[name]);
        }

        // node.slideDown();
    }
    else if (mChannel == "flow") {
        runOneStepDone(message)
    }
   
}