# -*- coding: utf-8 -*-

"""
Script util
-------------------

"""
import sys
sys.path.append('../')

import logging
import func

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

	script = (
		func_source + "\n" + # need move to init_script
		paras_output + " = " + func_name + "(" + paras_input + ")" # not return output
		# + "\n" + output
		)

	return script

def get_delete_script(delete):
	script = "del " + ','.join(delete)
	return script


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
	]


	return "\n".join(init_list)

def init_script_import():
	pass

