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

var canvasDict = {}
var currentInstanceRunning = null
// set runNodesList as global var
var runNodesList = []
var runNodeMessage = []
var runDelVarList = []
var kernelId = ""


function runFlow() {
    runNodesList = []

    // TEST:!!!!!!!!!! widgets should find its instance
    currentInstanceRunning = window.instance 

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
        
        // TODO: when in widget, get all up nodes/widget
        var upNodeList = getUpNodes(currentInstanceRunning, node.name)


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


            var outInPair = jsplumbUtils.getOutInPairsFromEps(currentInstanceRunning, node.name)
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

    pushDelVar(node)

    var content = {
        node: node.id,
        module: node.module,
        func: node.func,
        input: node.input.value,
        output: node.output.default,
        delete: runDelVarList,
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
var nodeList = {}
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
}


function initNodeList() {
    for (var mainType in nodeTypeList) {
        nodeList[mainType] = {}

        for (var subType in nodeTypeList[mainType]) {
            nodeList[mainType][subType] = {}
            nodeList[mainType][subType].count = 0
        }

    }

// nodeTypeList

//     var nodeList = {
//         "Data": {
//             "File": {
//                 count: 0,
//                 },

//             "Merge": {
//                 count: 0,
//                 },
//             },
//         }
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
    node.input.name = nodeType.content.input.name.slice(0) // input name: not change, not unique
    node.input.type = nodeType.content.input.type.slice(0)
    node.input.count = nodeType.content.input.count
    node.input.default = nodeType.content.input.default.slice(0) // intput default: not change, not unique
    node.input.id = node.input.name.map(function(value){ // input id: not change, unique
        return "input" + nodeName + value;
    });
    node.input.value = null // input value should be up nodes output default

    // 2. output
    node.output = {} 
    node.output.name = nodeType.content.output.name.slice(0) // name: not change, not unique
    node.output.type = nodeType.content.output.type.slice(0)
    node.output.count = nodeType.content.output.count
    node.output.default = node.output.name.map(function(value){ // output default: change, unique
        return "output" + nodeName + value;
    });
    node.output.id = node.output.default.slice(0) // output id: not change, unique


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

    // offset of cursor
    // TODO: use node width/height to set diffX/diffY
    var diffX = 9 * 16 / 2
    var diffY = 4 * 16 / 2

    var X = $('#myCanvas').offset().left + diffX
    var Y = $('#accordion').offset().top + diffY

    var nodeStyle = {"border": '3px solid ' + getNodeColorById(newNode.id)}

    jsplumbUtils.newNode(window.instance, e.clientX - X, e.pageY - Y, newNode, nodeStyle);

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

        $(t).on('change input propertychange', function(e) {
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

        var t = document.createElement("input")
        t.type = "text"
        t.className = "form-control"
        t.value = node.output.default[i]
        t.id = "text" + node.name + "output" + i

        $(t).on('change input propertychange', function(e) {
            // console.log(e)
            var node = getNodeById(currentNodeId)

            var notIdLength = ("text" + node.name + "output").length
            node.output.default[e.currentTarget.id.substring(notIdLength)] = $(this).val()

            // node.output.default[i] = $(this).val()

            // console.log(node)

            // change all nodes downside of status idle
            setDownNodesIdle(node.name)

            // if connect to a target, then change label name
            jsplumbUtils.setConnectionLabels(window.instance, node)
        });

        dc.append(t)

        if (node.output.value != null) {
            var v = node.output.value[i]
            var vDiv = document.createElement("div")
            vDiv.innerHTML = v

            dc.append(vDiv)    
        }

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

function getUpNodes(instance, nodeName) {
    return jsplumbUtils.getUpNodesList(instance, nodeName)
}

function getDownNodes(instance, nodeName) {
    // from 2d to 1d
    var downNodesList = jsplumbUtils.getDownNodesList(instance, nodeName)
    console.log("getDownNodes")
    console.log(downNodesList)
    return [].concat.apply([],downNodesList)
}

function setDownNodesIdle(nodeName) {

    // 0. TODO: check circle

    // 1. TODO: get all instance down the node
    var instance = currentInstanceRunning

    setDownNodesIdleInInstance(instance, nodeName)
}

function setDownNodesIdleInInstance(instance, nodeName) {
    // 1. set down nodes
    var downList = getDownNodes(instance, nodeName)
    console.log("Show down list from setDownNodesIdle")
    console.log(downList)

    // recursive set node down to idle
    if (downList.length > 0) {
        for (var i = downList.length - 1; i >= 0; i--) {
            setDownNodesIdleInInstance(instance, downList[i])
        }
    }

    var node = getNodeByName(nodeName)

    setNodeRunStatus(node, STATUS.IDLE)

    // pushDelVar(node)

    return true
}

function pushDelVar(node) {
    runDelVarList = [].concat.apply(runDelVarList,node.output.default)

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

    // 1. init jsplumb
    var jsInstance = initJsPlumb("myCanvas")
    canvasDict["myCanvas"] = jsInstance


    // TODO: init node type list & node list from server
    initNodeList()
    // TODO: from node type list, generate node tree


    bindTab()
});

function bindTab() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      // alert(e.target) // 激活的标签页
      // alert(e.relatedTarget) // 前一个激活的标签页
      console.log(e)

      var container = e.relatedTarget.id
      if (container == "maintab1") {
        container = "myCanvas2"
      }
      else {
        container = "myCanvas"
      }

      // jsplumbUtils.changeContainer(container)

    })

}

function inputWidgetName() {
    $("#widgetDivInput").val("")
    $("#groupButton").css('display','none'); 
    $("#groupConfirmCancel").css('display','block'); 
}

function cancelGroup() {
    $("#groupButton").css('display','block'); 
    $("#groupConfirmCancel").css('display','none'); 
}

function confirmGroup() {
    alert($("#widgetDivInput").val())
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