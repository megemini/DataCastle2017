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

function runFlow() {
    // 0. check current node to run
    if (currentNodeId == null) {
        alert("Please choose a node!")
        currentStatus = STATUS.IDLE
        return true
    }

    // TODO: unshift up nodes until all is start node!!!
    var node = getNodeById(currentNodeId)

    // 1. this node is done, then just show the info
    if (node.status == STATUS.DONE) {
        showNodeInfo(node)
        currentStatus = STATUS.IDLE
        return true
    }

    // 2. this node is idle, need run 
    // 2.1 recursive get run flow node list
    var runNodesList = []
    var runQueue = []
    runQueue.push(node)
    runNodesList.unshift(node)
    var enqueueFlag = true
    while (!(runQueue.length == 0)) {
        var n = runQueue.shift()
        

        var upList = getUpNodes(n.name)

        // console.log("shift node is ")
        // console.log(n)
        // console.log("uplist ")
        // console.log(upList)

        if (upList.length != n.inputsJs.length) {
            enqueueFlag = false
            runQueue = []
            break
        }

        for (var i = upList.length - 1; i >= 0; i--) {
            var upNode = getNodeById(upList[i])

            // TODO: need not use found... enqueue all the input, and uplift the input
            // when run node, if already done, then ignore
            // but, what if cycle?
            if (upNode.status == STATUS.IDLE && !upNode.found) {
                upNode.found = true
                runQueue.push(upNode)
                runNodesList.unshift(upNode)
            }
        }

        // console.log(runQueue.length)
    }

    if (!enqueueFlag) {
        showNodeInfo(node)
        currentStatus = STATUS.IDLE
        alert("Some nodes need inputs! Please check!")
        return true
    }

    console.log("run nodes list is ")
    console.log(runNodesList)

    currentStatus = STATUS.IDLE

    return
    // 2.2 get enqueue list then change icon to stop

    // 2.3 run nodes upside-down, one-by-one
    var test = function () {
        alert("test")
    }

    // 1. get nodes downside-up
    for (var i = Things.length - 1; i >= 0; i--) {
        Things[i]
    }


    var flow = {
        "channel": "run",
        "run": "tell me why..."
    }

    alert("current node is " + currentNodeId)

    // updater.socket.send(JSON.stringify(flow));
}

function stopFlow() {

}

function runOneStep(node) {
    if (node.status == STATUS.DONE) {
        return true
    }


}

function isStartNode(node) {
    if (node.inputsJs.length == 0) {
        return true
    }
    else {
        return false
    }
}

function isEndNode(node) {
    // TODO: 
    return false
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
    IDLE : 0,
    BUSY : 1,
    DONE : 2,
}

var currentStatus = STATUS.IDLE

// Get node type list from server when init
var nodeTypeList = {
    "Data": {
        "File": {
            display: "File", 
            description: "Read a data file as pandas dataframe. \n Inputs: \n - file: csv file \n - names: header names \n Output: pandas dataframe",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                func: {
                    funcName: "get_csv",
                    funcInputs: ["file", "names"], // node input endpoints <-- funcInputs - funcInputsDefaults
                    funcInputsCount: 0,
                    funcInputsDefaults: ["user_info_train.txt", "None"], // used for edit paras
                },
                output:{
                    name: null,
                    content: null,
                },
            },
        },

        "Merge": {
            display: "Merge", 
            description: "Merge two data files by columns. \n Inputs: \n - file1: dataframe \n - file2: dataframe - by: columns \n Output: pandas dataframe",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                func: {
                    funcName: "merge_df",
                    funcInputs: ["file1", "file2", "by"], // node input endpoints <-- funcInputs - funcInputsDefaults
                    funcInputsCount: 2,
                    funcInputsDefaults: ["id"], // used for edit paras
                },
                output:{
                    name: null,
                    content: null,
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
    var nodeId = nodeList[mainType][subType].count
    nodeList[mainType][subType].count = nodeId + 1

    var node = {}
    node.name = mainType + subType + nodeId
    var nodeName = node.name

    node.mainType = mainType
    node.subType = subType
    node.inputs = [] // save up node's output
    node.outputName = "output" + nodeName
    node.output = null

    var funcInputs = nodeTypeList[mainType][subType].content.func.funcInputs
    var funcInputsCount = nodeTypeList[mainType][subType].content.func.funcInputsCount
    var funcInputsDefaults = nodeTypeList[mainType][subType].content.func.funcInputsDefaults
    var description = nodeTypeList[mainType][subType].description
    var display = nodeTypeList[mainType][subType].display

    node.funcInputs = funcInputs.slice(0)
    node.funcInputsCount = funcInputsCount
    node.funcInputsDefaults = funcInputsDefaults.slice(0)

    node.display = display
    node.description = description

    // inputs.length === inputsjs.length then could recursive run flow
    node.inputsJs = []
    for (var i = funcInputsCount - 1; i >= 0; i--) {
        node.inputsJs[i] = {}
        node.inputsJs[i].name = funcInputs[i]
        node.inputsJs[i].id = "input" + nodeName + funcInputs[i]
    }

    node.status = STATUS.IDLE
    // node.status = STATUS.BUSY
    node.found = false

    nodeList[mainType][subType][nodeName] = node
    nodeListByName[nodeName] = node


    return node
} 

function editNodeInputs(node, inputs) {
    var mainType = node.mainType
    var subType = node.subType
    var nodeName = node.name
    nodeList[mainType][subType][nodeName].inputs = inputs
}

function editNodeOutputName(node, outputName) {
    var mainType = node.mainType
    var subType = node.subType
    var nodeName = node.name
    nodeList[mainType][subType][nodeName].outputName = outputName
}

function editNodeOutput(node, output) {
    var mainType = node.mainType
    var subType = node.subType
    var nodeName = node.name
    nodeList[mainType][subType][nodeName].output = output
}

function deleteNode(node) {
    var mainType = node.mainType
    var subType = node.subType
    var nodeName = node.name
    nodeList[mainType][subType][nodeName] = null
}

// from html event(e) to add one jsplumb node
function addNode(mainType, subType, e) {

    // offset of cursor
    var diffX = 12.5 * 16 / 2
    var diffY = 4 * 16 / 2

    var X = $('#canvas').offset().left + diffX
    var Y = $('#accordion').offset().top + diffY

    // 0. add node info to node list
    var newNode = initNode(mainType, subType)

    // 1. add node for jsplumb at canvas
    var node = {
        id: newNode.name,
        name: subType,
        inputs: newNode.inputsJs,
        output: [{id:newNode.outputName, name: newNode.outputName}]
    }

    jsplumbUtils.newNode(e.clientX - X, e.pageY - Y, node);

    // 2. add description/inputs/output at console
    showNodeInfo(newNode)

    // 3. set current node is this
    currentNodeId = newNode.name
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

    for (var i = node.funcInputsDefaults.length - 1; i >= 0; i--) {
        var d = document.createElement("div")
        d.className = "input-group"

        var s = document.createElement("span")
        s.className = "input-group-addon"
        s.innerHTML = node.funcInputs[node.funcInputsCount + i]

        var t = document.createElement("input")
        t.type = "text"
        t.className = "form-control"
        t.value = node.funcInputsDefaults[i]
        t.id = node.name + "input" + i

        $(t).on('change', function(e) {
            // console.log(e)
            var notIdLength = (node.name + "input").length
            node.funcInputsDefaults[e.currentTarget.id.substring(notIdLength)] = $(this).val()

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
    s.innerHTML = "Output Name"

    var t = document.createElement("input")
    t.type = "text"
    t.className = "form-control"
    t.value = node.outputName
    t.id = node.name + "output"

    $(t).on('change', function(e) {
        // console.log(e)
        node.outputName = $(this).val()
        // console.log(node)

        // change all nodes downside of status idle
        setDownNodesIdle(node.name)
    });

    d.append(s)
    d.append(t)

    $("#func-output").append(d)
}

function getUpNodes(nodeName) {
    return jsplumbUtils.getUpNodes(nodeName)
}

function getDownNodes(nodeName) {
    return jsplumbUtils.getDownNodes(nodeName)
}

function setDownNodesIdle(nodeName) {
    var downList = getDownNodes(nodeName)
    console.log("Show down list from setDownNodesIdle")
    console.log(downList)

    // recursive set node down to idle
    if (downList.length > 0) {
        for (var i = downList.length - 1; i >= 0; i--) {
            setDownNodesIdle(downList[i])
        }
    }

    getNodeByName(nodeName).status = STATUS.IDLE

    return true
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
        newMessage($(this));
        return false;
    });

    $("#scriptform").bind("keypress", function(e) {
        if (e.keyCode == 13) {
            newMessage($(this));
            return false;
        }
    });
    // $("#message").select();
    updater.start();



    // TODO: init node type list & node list from server

    // TODO: from node type list, generate node tree

});



function newMessage(form) {
    var message = form.formToDict();
    updater.socket.send(JSON.stringify(message));
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
        alert(message.html);
        var node = $(message.html);
        $("#console").remove()
        $("#console-output").append(node);
        node.slideDown();
    }
};