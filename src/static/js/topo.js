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

    var flow = {
        "channel": "run",
        "run": "tell me why..."
    }

    updater.socket.send(JSON.stringify(flow));
}

///////////////////////////////////////////////////
// add node

var nodeCount = 0
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

var inputsList = {}
var outputList = {}

// Get node type list from server when init
var nodeTypeList = {
    "Data": {
        "File": {
            display: "File", 
            description: "Read a data file as pandas dataframe. \n Inputs: - file: csv file \n - names: header names \n Output: pandas dataframe",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                func: {
                    funcName: "get_csv",
                    funcInputs: ["file", "names"], // node input endpoints <-- funcInputs - funcInputsDefaults
                    funcInputsDefaults: ["None"], // used for edit paras
                },
                output:{
                    name: null,
                    content: null,
                },
            },
        },

        "Merge": {
            display: "Merge", 
            description: "Merge two data files by columns. \n Inputs: - file1: dataframe \n - file2: dataframe - by: columns \n Output: pandas dataframe",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                func: {
                    funcName: "merge_df",
                    funcInputs: ["file1", "file2", "by"], // node input endpoints <-- funcInputs - funcInputsDefaults
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
    node.inputs = []
    node.outputName = "output" + nodeName
    node.output = null

    var funcInputs = nodeTypeList[mainType][subType].content.func.funcInputs
    var funcInputsDefaults = nodeTypeList[mainType][subType].content.func.funcInputsDefaults
    var lenInputs = funcInputs.length
    var lenInputsDefaults = funcInputsDefaults.length

    node.inputsJs = []
    for (var i = (lenInputs - lenInputsDefaults) - 1; i >= 0; i--) {
        node.inputsJs[i] = {}
        node.inputsJs[i].name = funcInputs[i]
        node.inputsJs[i].id = "input" + nodeName + funcInputs[i]
    }

    nodeList[mainType][subType][nodeName] = node

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
        inputs: newNode.inputsJs,
        output: [{id:newNode.outputName, name: newNode.outputName}]
    }

    jsplumbUtils.newNode(e.clientX - X, e.pageY - Y, node);

    // 2. add description/inputs/output at console


}

function showHelp(mainType, subType) {
    alert(mainType)
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