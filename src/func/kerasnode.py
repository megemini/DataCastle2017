# -*- coding: utf-8 -*-

"""
**keras node** module
-------------------

"""

__all__ = ['get_sequential', 'add_dense', 'add_conv2D', 'add_dropout', 'add_maxPooling2D', 'add_flatten', 'set_compile', 'model_fit']

def get_sequential():
	return Sequential()

def add_dense(Keras_model, units, activation, input_dim):
	Keras_model.add(Dense(units=units, activation=activation, input_dim=input_dim))
	return Keras_model

def add_conv2D(Keras_model, filters, kernel_size, strides, activation, input_shape):
	Keras_model.add(Conv2D(filters=filters, kernel_size=kernel_size, strides=strides, activation=activation, input_shape=input_shape))
	return Keras_model

def add_dropout(Keras_model, rate):
	Keras_model.add(Dropout(rate=rate))
	return Keras_model

def add_maxPooling2D(Keras_model, pool_size):
	Keras_model.add(MaxPooling2D(pool_size=pool_size))
	return Keras_model

def add_flatten(Keras_model):
	Keras_model.add(Flatten())
	return Keras_model

def set_compile(Keras_model, optimizer, loss):
	Keras_model.compile(loss=loss, optimizer=optimizer)
	return Keras_model

def model_fit(Keras_model, X, y, epochs, batch_size):
	Keras_model.fit(X.values.astype(np.float32), y.values.astype(np.float32), batch_size=batch_size, epochs=epochs)
	return Keras_model
