# -*- coding: utf-8 -*-

"""
**model** module
-------------------

"""

__all__ = ['cls_rfc', 'cls_xgb']

def cls_rfc(X, y, n_estimators=10):
	model = RandomForestClassifier(n_estimators=n_estimators)

	model.fit(X, y)

	return model

def cls_xgb(X, y, objective='binary:logistic'):
	params = {'max_depth':5, 'eta':0.3, 'silent':0, 'objective':objective }

	dtrain = xgb.DMatrix( X, label=y)

	model = xgb.train(params=params, dtrain=dtrain)

	return model
