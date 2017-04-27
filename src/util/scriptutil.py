# -*- coding: utf-8 -*-

"""
Script util
-------------------

"""
import sys
sys.path.append('../')

import logging
import func
import script

from util import funcutil


def get_script(module_name, func_name, inputs, output):
	"""
	Assemble script 
	-------------------

	All inputs are string, with inputs_type, get original types with func get_para_xxx(para)

	inputs_type: original without parse, like variable/int/float; string with parse, like path

	inputs_type is NOT types of func: data type like dataframe/list/xxx, 

	"""

	# TODO: init source before call
	# logging.info("module name")
	# logging.info(module_name)
	# module = __import__(module_name)
	# logging.info(dir(func))
	func_ref = getattr(getattr(func, module_name), func_name)

	func_name, func_inputs, func_defaults, func_source  = funcutil.get_func_info(func_ref)

	logging.info(func_source)
	logging.info(inputs)

	paras = []

	for k, v in inputs.items():
		paras.append(("%s=" % k) +  v)
		# if v.get('type') == 'o':
		# 	paras.append(("%s=" % k) +  v.get('value'))

		# if v.get('type') == 's':
		# 	paras.append(("%s=" % k) +  get_para_string(v.get('value')))


	paras_input = ','.join(paras)

	paras_output = ','.join(output)

	logging.info(paras_input)

	func_script = (
		func_source + "\n" + # need move to init_script
		paras_output + " = " + func_name + "(" + paras_input + ")" # not return output
		# + "\n" + output
		)

	return func_script

def get_delete_script(delete):
	func_script = ""
	for var in delete:
		func_script = func_script + "if '" + var + "' in dir(): del " + var + "\n"
	 
	return func_script


def get_para_string(para):
	return '\"' + para + '\"'

def init_script():
	"""
	Init jupyter import
	"""
	init_list = [
		"import numpy as np",
		"import pandas as pd",
		"import matplotlib.pyplot as plt",
		"import seaborn as sns",
		"sns.set_style('whitegrid')",
		"from sklearn.preprocessing import StandardScaler",
		"from sklearn.model_selection import train_test_split",
		"from sklearn.ensemble import RandomForestClassifier",
		"from sklearn.metrics import roc_auc_score",
		"from xgboost.core import Booster",
		"import xgboost as xgb",
		"import keras",
		"from keras.models import Sequential",
		"from keras.layers import Dense, Dropout, Flatten",
		"from keras.layers import Conv2D, MaxPooling2D",
	]


	return "\n".join(init_list)

def init_script_import():
	pass

def init_parallel_script(func_dict):
	"""
	Init jupyter parallel import
	with funcs

	"""
	init_list = [
		"import networkx as nx",
		"import seaborn as sns",
		"sns.set_style('whitegrid')",
		"from ipyparallel import Client",
		"dag = nx.DiGraph()",
		"rc = Client()",
		"jobs = {}",
		"results = {}",
		"lview = rc.load_balanced_view()",
		"with rc[:].sync_imports():"
		"	import numpy",
		"	import pandas",
		"	import matplotlib.pyplot",
		"	import seaborn",
		"	import xgboost",
		"	import keras",
		"	from sklearn.preprocessing import StandardScaler",
		"	from sklearn.model_selection import train_test_split",
		"	from sklearn.ensemble import RandomForestClassifier",
		"	from sklearn.metrics import roc_auc_score",
		"	from xgboost.core import Booster",
		"	from keras.models import Sequential",
		"	from keras.layers import Dense, Dropout, Flatten",
		"	from keras.layers import Conv2D, MaxPooling2D",
		"	from ipyparallel import Client",
		"%px np = numpy",
		"%px pd = pandas",
		"%px plt = matplotlib.pyplot",
		"%px xgb = xgboost",
	]

	for module_name in func.__all__:
		# import funcs 
		for func_name in module_name.__all__:
			func_ref = getattr(getattr(func, module_name), func_name)
			_, _, _, func_source  = funcutil.get_func_info(func_ref)
			init_list.append(func_source)

	for module_name, func_list in func_dict.items():
		# import scripts for parallel
		for func_name in func_list:
			func_ref = getattr(getattr(script, module_name), func_name)
			_, _, _, func_source  = funcutil.get_func_info(func_ref)
			init_list.append(func_source)

	return "\n".join(init_list)

