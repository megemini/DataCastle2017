# -*- coding: utf-8 -*-

"""
**evaluate** module
-------------------

"""

__all__ = ['eva_predict', 'eva_predict_proba', 'eva_roc_auc_score']

def eva_predict(model, X, threshold=0.5, batch_size=1, verbose=0):
	
	if isinstance(model, (Booster)):

		dtest = xgb.DMatrix(X)

		return (model.predict(dtest) > threshold).astype(np.int)

	elif isinstance(model, (keras.models.Sequential)):

		return (model.predict(X, batch_size=batch_size, verbose=verbose) > threshold).astype(np.int)

	else:
		return model.predict(X)

	

def eva_predict_proba(model, X, batch_size=1, verbose=0):

	if isinstance(model, (Booster)):
		
		dtest = xgb.DMatrix(X)

		return model.predict(dtest)

	elif isinstance(model, (keras.models.Sequential)):

		return model.predict(X, batch_size=batch_size, verbose=verbose)

	else:
		return model.predict_proba(X)


def eva_roc_auc_score(y_true, y_score):

	return roc_auc_score(y_true, y_score)
