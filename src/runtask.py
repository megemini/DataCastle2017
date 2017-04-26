# -*- coding: utf-8 -*-

"""
Task with networkx
-------------------

"""
import logging

import networkx as nx 

from tornado import gen


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
		map(self.dag.add_node, graph_content['nodesId'])
		map(self.dag.add_edge, *(zip(*graph_content['edges'])))
		logging.info('DAG nodes id')
		logging.info(self.dag.node)
		logging.info('DAG edges')
		logging.info(self.dag.edge)

		logging.info('DAG nodes')
		logging.info(graph_content['nodes'])
		logging.info('Delete')
		logging.info(graph_content['delete'])

		for node in self.dag.node:
			logging.info(node + ' predecessors is:')
			logging.info(self.dag.predecessors(node))

	def get_graph(self):
		pass


	@gen.coroutine
	def run_flow(self, content):
		# 1. pass graph to kernel

		# 2. kernel: generate DAG from graph

		# 3. kernel: assign jobs

		# 4. kernel: wait for return

		# 5. kernel: print node output id

		# 6. kernel: print node output result

		# 7. local: generate job list

		pending = []
		results = {}

		while pending:
			msg = yield self.ws.read_message()

			# 1. get node output id, push to result.id

			# 2. get node output result, push to result.content

			# 3. pop one job from pending

			# 4. raise gen.Return(result)
