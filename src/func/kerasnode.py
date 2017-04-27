# -*- coding: utf-8 -*-

"""
**keras node** module
-------------------

"""

__all__ = ['get_sequential', 'add_dense', 'add_conv2D', 'add_dropout', 'add_maxPooling2D', 'add_flatten', 'set_compile', 'model_fit']

def get_sequential():
	return Sequential()

def add_dense(model, units, activation, input_dim):
	model.add(Dense(units=units, activation=activation, input_dim=input_dim))
	return model

def add_conv2D(model, filters, kernel_size, strides, activation, input_shape):
	model.add(Conv2D(filters=filters, kernel_size=kernel_size, strides=strides, activation=activation, input_shape=input_shape))
	return model

def add_dropout(model, rate):
	model.add(Dropout(rate=rate))
	return model

def add_maxPooling2D(model, pool_size):
	model.add(MaxPooling2D(pool_size=pool_size))
	return model

def add_flatten(model):
	model.add(Flatten())
	return model

def set_compile(model, optimizer, loss):
	model.compile(loss=loss, optimizer=optimizer)
	return model

def model_fit(model, X, y, epochs, batch_size):
	model.fit(X, y, batch_size=batch_size, epochs=epochs)
	return model
