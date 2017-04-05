# -*- coding: utf-8 -*-

"""
**data** module
-------------------

"""
import pandas as pd

def get_csv(file="", names=None):
	"""
	Read a data file as pandas dataframe.
	--------
	Inputs:
	- file: csv file, string
	- names: header names
	Output: 
	- output: Data
	"""
	# 1. 
	with open(file, "rb") as f:
		df = pd.read_csv(f, header=None, names=names)

	return df

def merge_df(data1, data2, on="id"):
	"""
	Merge two data as one.
	--------
	Inputs:
	- data1: Data
	- data2: Data
	Output:
	- output: Data
	"""
	df = pd.merge(data1, data2, on=on)
	return df

def fillna_df(data, method="mean"):
	"""
	Fill missing value with method "mean"/"median".
	--------
	Inputs:
	- data: Data
	- method: "mean"/"median"
	Ouput:
	- output: Data
	"""
	df = None

	if method == "mean":
		df = data.fillna(data.mean())
	elif method == "median":
		df = data.fillna(data.median())

	return df

def split_df(data, columns=None):
	"""
	Get part columns of data.
	--------
	Inputs:
	- data: Data
	- columns: columns list
	Output:
	- data: Data, default get all columns
	"""
	return data[columns]

