# -*- coding: utf-8 -*-

"""
**visualize** module
-------------------

"""

def show_hist(data, bins=10, orientation='vertical'):
	# df = pd.concat([dataX,dataY], axis=1)
	# df.hist(bins=bins, orientation=orientation).get_figure()
	return data.plot(kind='hist', bins=bins, orientation=orientation).get_figure()


def show_scatter(dataX, dataY):
	df = pd.concat([dataX,dataY], axis=1)
	return df.plot(kind="scatter", x=dataX.columns[0], y=dataY.columns[0]).get_figure()

def show_plot(dataX, dataY, method="count", kind='line'):

	if method == "count":
		return pd.concat([dataX,dataY], axis=1).groupby(dataX.columns[0]).count().plot(kind=kind).get_figure()

	elif method == "sum":
		return pd.concat([dataX,dataY], axis=1).groupby(dataX.columns[0]).sum().plot(kind=kind).get_figure()

	elif method == None:
		return pd.concat([dataX,dataY], axis=1).plot(kind=kind).get_figure()
