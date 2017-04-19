/*


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


// var NodeTypeList = {
//  // Data: 1.file 2.numpy 3.merge 4.sklearn-pre 
//  "Data": {
//      "File": {
//          inputs: null, 
//          outputs: ["File"], 
//          paras: null},
//      "Merge": {          
//          inputs: ["File_1", "File_2"], 
//          outputs: ["File"], 
//          paras: ["By"]},
//      "Split": {},
//      "Shuffle": {},
//      "Impute": {},
//      "Normalize": {},
//  },
//  // Mining: 1.sklearn-mining 2.tensorflow 3.xgboost
//  "Model": {
//      "RandomForest": {},
//      "SVM": {},
//      "XGBoost": {},
//  },
//  "Evaluate": {
//      "Prediction": {},
//  },
//  "Visualize": {
//      "Hist": {},
//      "Scatter": {},
//  }
// };
// inputs/outputs with endpoints, paras with default value and editable
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
                module: "data",
                func: "get_csv",
                input: {
                    name: ["file", "names"],
                    type: ["File", "String"],
                    count: 0,
                    default: ["''", "None"],
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
            description: "Merge two data files on columns. \n Inputs: \n - data1: dataframe \n - data2: dataframe \n - on: columns \n Output: pandas dataframe",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
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

        Filter: {
            display: "Filter Data", 
            description: "Filter Data by conditions. \n Inputs: \n - data: Data \n - by: conditions, String \n Output: Data, (default get all columns)",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                module: "data",
                func: "filter_df",
                input: {
                    name: ["data", "by"],
                    type: ["Data", "String"],
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

        Split: {
            display: "Split Data", 
            description: "Get part columns of data. \n Inputs: \n - data: Data \n - columns: columns, List \n Output: Data, (default get all columns)",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
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
            description: "Predict. \n Inputs: \n - model: Model \n - X: predict data, Data \n - threshold: default 0.5 \n - batch_size: for keras \n - verbose: for keras \n Output: predict",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                module: "evaluate",
                func: "eva_predict",
                input: {
                    name: ["model", "X", "threshold", "batch_size", "verbose"],
                    type: ["Model", "Data", "Number", "Number", "Number"],
                    count: 2,
                    default: ["0.5", "1", "0"],
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
            description: "Predict Probability. \n Inputs: \n - model: Model \n - X: predict data, Data \n - batch_size: for keras \n - verbose: for keras \n Output: predict",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "evaluate",    
                func: "eva_predict_proba",
                input: {
                    name: ["model", "X", "batch_size", "verbose"],
                    type: ["Model", "Data", "Number", "Number"],
                    count: 2,
                    default: ["1", "0"],
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
            description: "Get part columns of data. \n Inputs: \n - data: Data \n - columns: columns, List \n Output: Data, (default get all columns)",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
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

    Visualize: {
        Hist: {
            display: "Hist", 
            description: "A histogram of data. \n Inputs: \n - data: Data \n - bins: Number \n - orientation: orientation, String \n Output: - Image",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                module: "visualize",
                func: "show_hist",
                input: {
                    name: ["data", "bins", "orientation"],
                    type: ["Data", "Number", "String"],
                    count: 1,
                    default: ["10", "'vertical'"],
                    value: null,
                },
                output:{
                    name: ["image"],
                    type: ["Image"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        Scatter: {
            display: "Scatter", 
            description: "A scatter of data. \n Inputs: \n - dataX: Data \n - dataY: Data \n Output: - Image",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                module: "visualize",
                func: "show_scatter",
                input: {
                    name: ["dataX", "dataY",],
                    type: ["Data", "Data"],
                    count: 2,
                    default: [],
                    value: null,
                },
                output:{
                    name: ["image"],
                    type: ["Image"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },

        Plot: {
            display: "Plot", 
            description: "A plot of data. \n Inputs: \n - dataX: Data \n - dataY: Data \n - method: \"count\" or \"sum\", String \n - kind: \"line\" or \"area\", String \n Output: - Image",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null, // name for save this node
                // 2. func information, from funcutil.get_func_info(func), just for display
                module: "visualize",
                func: "show_plot",
                input: {
                    name: ["dataX", "dataY", "method", "kind"],
                    type: ["Data", "Data", "String", "String"],
                    count: 2,
                    default: ["'count'", "'line'"],
                    value: null,
                },
                output:{
                    name: ["image"],
                    type: ["Image"],
                    count: 1,
                    default: null,
                    value: null,
                },
            },
        },
    },

    Customize: {
        Merge3: {
            display: "Merge 3 Data", 
            description: "Merge 3 data files on columns. \n Inputs: \n - data1: dataframe \n - data2: dataframe \n - data3: dataframe \n - on: columns \n Output: pandas dataframe",
            type: "widget",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
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

    Keras: {
        Sequential: {
            display: "Keras Sequential", 
            description: "Keras sequential model. \n Inputs: \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "get_sequential",
                input: {                    
                    name: [],
                    type: [],
                    count: 0,
                    default: [],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Dense: {
            display: "Keras Dense", 
            description: "Keras Dense layer, regular densely-connected NN layer. \n Inputs: \n - Keras_model: Keras model \n - units: hidden units \n - activation: activation type \n - input_dim: input dimention \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "add_dense",
                input: {                    
                    name: ["Keras_model", "units", "activation", "input_dim"],
                    type: ["KerasModel", "Number", "String", "Number"],
                    count: 1,
                    default: ["64", "'relu'", "0"],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Conv2D: {
            display: "Keras Conv2D", 
            description: "Keras Conv2D layer. 2D convolution layer. \n Inputs: \n - Keras_model, Keras model \n - filters: filters \n - kernel_size: kernel_size \n - strides: strides \n - activation: activation \n - input_shape: input_shape \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "add_conv2D",
                input: {                    
                    name: ["Keras_model", "filters", "kernel_size", "strides", "activation", "input_shape"],
                    type: ["KerasModel", "Number", "Array", "Array", "String", "Array"],
                    count: 1,
                    default: ["0", "(0, 0)", "(1, 1)", "'relu'", "(0, 0)"],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Dropout: {
            display: "Keras Dropout", 
            description: "Keras Dropout layer. Applies Dropout to the input. \n Inputs: \n - Keras_model, Keras model \n - rate: dropout rate \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "add_dropout",
                input: {                    
                    name: ["Keras_model", "rate"],
                    type: ["KerasModel", "Number"],
                    count: 1,
                    default: ["0.5"],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        MaxPooling2D: {
            display: "Keras MaxPooling2D", 
            description: "Keras MaxPooling2D layer. Max pooling operation for spatial data. \n Inputs: \n - Keras_model, Keras model \n - pool_size: pool size  \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "add_maxPooling2D",
                input: {                    
                    name: ["Keras_model", "pool_size"],
                    type: ["KerasModel", "Array"],
                    count: 1,
                    default: ["(0, 0)"],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Flatten: {
            display: "Keras Flatten", 
            description: "Keras Flatten layer. Flattens the input. Does not affect the batch size. \n Inputs: \n - Keras_model, Keras model \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "add_flatten",
                input: {                    
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: [],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Compile: {
            display: "Keras Compile", 
            description: "Keras Compile. Configures the learning process. \n Inputs: \n - Keras_model, Keras model \n - optimizer: An optimizer is one of the two arguments required for compiling a Keras model \n - loss: A loss function (or objective function, or optimization score function) \n Output: Keras model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "set_compile",
                input: {                    
                    name: ["Keras_model", "optimizer", "loss"],
                    type: ["KerasModel", "String", "String"],
                    count: 1,
                    default: ["'sgd'","'binary_crossentropy'"],
                    value: null,
                },
                output:{
                    name: ["Keras_model"],
                    type: ["KerasModel"],
                    count: 1,
                    default: null,
                    value: null,
                },                
            },
        },

        Fit: {
            display: "Keras Fit", 
            description: "Keras Fit. Trains the model for a fixed number of epochs (iterations on a dataset). \n Inputs: \n - Keras_model, Keras model \n - X: features, Data \n - y: labels, Data \n- epochs: epochs \n - batch_size: batch_size \n Output: model",
            type: "node",
            content: {
                // 1. basic infomation, from user edit
                name: null,
                // 2. func information, from funcutil.get_func_info(func)
                module: "kerasnode",    
                func: "model_fit",
                input: {                    
                    name: ["Keras_model", "X", "y", "epochs", "batch_size"],
                    type: ["KerasModel", "Data", "Data", "Number", "Number"],
                    count: 3,
                    default: ["0","0"],
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
}

var widgetTypeList = {
    widgetMerge3 : {
        nodes: {
            node1: {
                name: "File1",
                mainType: "Data",
                subType: "Merge",
                inputsDefault: ["'id'"],
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
                position: {
                    left: 550,
                    top: 550,
                },
            },
        },
        conns: [
            {output: {node: "node1", index: 0}, input: {node: "node2", index: 0}}, 
        ],
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