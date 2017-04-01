# -*- coding: utf-8 -*-

"""
Script util
-------------------

"""
import logging
from util import funcutil

def get_script(func, inputs, output):
	"""
	Assemble script 
	-------------------

	All inputs are string, with inputs_type, get original types with func get_para_xxx(para)

	inputs_type: original without parse, like variable/int/float; string with parse, like path

	inputs_type is NOT types of func: data type like dataframe/list/xxx, 

	"""

	# TODO: init source before call
	func_name, func_inputs, func_defaults, func_source  = funcutil.get_func_info(func)

	logging.info(func_source)
	logging.info(inputs)

	paras = []

	for k, v in inputs.items():
		if v.get('type') == 'o':
			paras.append(("%s=" % k) +  v.get('value'))

		if v.get('type') == 's':
			paras.append(("%s=" % k) +  get_para_string(v.get('value')))


	paras_input = ','.join(paras)

	script = (
		func_source + "\n" + # need remove
		output + " = " + func_name + "(" + paras_input + ")" + "\n" +
		output
		)

	return script


def get_para_string(para):
	return '\"' + para + '\"'

def init_script():
	"""
	Init jupyter import
	"""

	return u'import numpy as np\nimport pandas as pd\n'

def init_script_import():
	pass

