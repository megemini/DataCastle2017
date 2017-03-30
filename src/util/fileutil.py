# -*- coding: utf-8 -*-

"""
Get file absolute path from script & file type.
-------------------

"""
import pandas as pd
import os

def get_path(file):

	path = os.path.abspath("../src/data/" + file)

	return path