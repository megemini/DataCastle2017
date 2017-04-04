# -*- coding: utf-8 -*-

"""
**data** module
-------------------

"""
import pandas as pd

def get_csv(file="", names=None):
	"""
	get csv use pandas
	"""
	# 1. get absolute path

	with open(file, "rb") as f:
		df = pd.read_csv(f, header=None, names=names)

	return df

def merge_df(data1, data2, on="id"):
	df = pd.merge(data1, data2, on=on)
	return df