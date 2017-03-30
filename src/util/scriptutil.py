# -*- coding: utf-8 -*-

"""
Script util
-------------------

"""
import logging

import inspect

def get_script(func, inputs, output):
	"""
	Assemble script 
	-------------------

	"""
	func_name = func.__name__
	# func_paras = inspect.getargspec(func).args
	func_source = inspect.getsource(func)

	logging.info(func_source)
	
	# file = "/home/shun/Projects/Pkbigdata/gitProject/DataCastle2017/src/data/loan_time_train.txt"
	file = inputs.get("file")

	script = func_source + "\n" + output + " = " + func_name + "(" + "\"" + file + "\"" + ")"

	return script

def init_script():
	"""
	Init jupyter import
	"""

	return u'import numpy as np\nimport pandas as pd\n'