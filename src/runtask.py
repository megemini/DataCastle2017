# -*- coding: utf-8 -*-

"""
Task with networkx
-------------------

"""
import logging

import networkx as nx 

class Runtask():
	"""
	docstring for Runtask
	"""
	def __init__(self, graph_content):
		# self.graph_content = graph_content
		logging.info(graph_content)

		self.dag = nx.DiGraph()

		self.set_graph(graph_content)

	def set_graph(self, graph_content):
		map(self.dag.add_node, graph_content["nodesId"])
		map(self.dag.add_edge, *(zip(*graph_content['edges'])))
		logging.info(self.dag.node)
		logging.info(self.dag.edge)

		for node in self.dag.node:
			logging.info(node + " predecessors is:")
			logging.info(self.dag.predecessors(node))

	def get_graph(self):
		pass


		