# -*- coding: utf-8 -*-

"""
**evaluate** module
-------------------

"""

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from xgboost.core import Booster

import numpy as np
import pandas as pd
import xgboost as xgb

def eva_predict(model, X):
	
	if isinstance(model, (Booster)):

		dtest = xgb.DMatrix(X)

		return (model.predict(dtest) > 0.5).astype(np.int)

	else:
		return model.predict(X)

	

def eva_predict_proba(model, X):

	if isinstance(model, (Booster)):
		
		dtest = xgb.DMatrix(X)

		return model.predict(dtest)

	else:
		return model.predict_proba(X)


def eva_roc_auc_score(y_true, y_score):

	return roc_auc_score(y_true, y_score)
