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

var NodeTypeList = {
	// Data: 1.file 2.numpy 3.merge 4.sklearn-pre 
	"Data": {
		"File": {
			inputs: null, 
			outputs: ["File"], 
			paras: null},
		"Merge": {			
			inputs: ["File_1", "File_2"], 
			outputs: ["File"], 
			paras: ["By"]},
		"Split": {},
		"Shuffle": {},
		"Impute": {},
		"Normalize": {},
	},
	// Mining: 1.sklearn-mining 2.tensorflow 3.xgboost
	"Model": {
		"RandomForest": {},
		"SVM": {},
		"XGBoost": {},
	},
	"Evaluate": {
		"Prediction": {},
	},
	"Visualize": {
		"Hist": {},
		"Scatter": {},
	}
};

var nodeList;

// from html event(e) to add one jsplumb node
function AddNode(mainType, subType, e) {
	// alert(mainType + subType)

	jsplumbUtils.newNode(500, 300);

	// AddJsplumb(NodeFactory(mainType, subType), e)


}

function Node(argument) {
	// body...
}

// inputs/outputs with endpoints, paras with default value and editable
function NodeFactory(mainType, subType) {
	this.nodeType = NodeTypeList[mainType][subType];

	this.inputs = this.nodeType.inputs;
	this.outputs = this.nodeType.outputs;
	this.paras = this.nodeType.paras;

	return node
}

function AddJsplumb(node, e) {
	// body...
}

function run() {
	alert("runrunrunrunrunrunrunrunrunrunrunrunrunrun")



}


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
});

function newMessage(form) {
	// alert(form)
    var message = form.formToDict();
    // alert(JSON.stringify(form))
    // updater.socket.send(JSON.stringify(message));
    updater.socket.send(JSON.stringify({"id":123, "message":"ok"}));
    // form.find("input[type=text]").val("").select();
}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    // alert(fields)
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
        // var existing = $("#console");
        // if (existing.length > 0) return;
        var node = $(message.html);
        node.hide();
        $("#console").append(node);
        node.slideDown();
    }
};