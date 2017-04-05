# -*- coding: utf-8 -*-

"""
**data** module
-------------------

"""
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def get_csv(file="", names=None):
	"""
	Read a data file as pandas dataframe.
	--------
	Inputs:
	- file: csv file, String
	- names: header names, List
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
	- method: "mean"/"median", String
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
	- columns: columns, List
	Output:
	- data: Data, (default get all columns)
	"""
	if columns == None:
		return data
	else:
		return data[columns]

def get_train_test(X, y, train_size=0.5):
	"""
	Standardize data, and then split X, y to X1, X2, y1, y2
	--------
	Inputs: 
	- X: features, Data
	- y: labels, Data
	- train_size: The proportion of the train, Number
	Outputs:
	- X1: For train, Data
	- X2: For test, Data
	- y1: For train, Data
	- y2: For test, Data
	"""
	columns_X = X.columns
	columns_y = y.columns

	scaler = StandardScaler()

	X = scaler.fit_transform(X)

	X1, X2, y1, y2 = train_test_split(X, y, train_size=train_size)

	X1 = pd.DataFrame(X1, columns=columns_X)
	X2 = pd.DataFrame(X2, columns=columns_X)
	y1 = pd.DataFrame(y1, columns=columns_y)
	y2 = pd.DataFrame(y2, columns=columns_y)

	return X1, X2, y1, y2
