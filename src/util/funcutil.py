# -*- coding: utf-8 -*-

"""
Script util
-------------------

Get functions/widgets inputs/output/description...

"""
import inspect

def get_func_info(func):
	return func.__name__, get_inputs(func), get_inputs_with_default(func), get_func_source(func)

def get_inputs(func):
	return inspect.getargspec(func).args

def get_inputs_with_default(func):
	return inspect.getargspec(func).defaults

def get_func_source(func):
	return inspect.getsource(func)