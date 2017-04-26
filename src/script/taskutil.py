# -*- coding: utf-8 -*-

"""
Parallel task util func
-------------------

"""


def add_task(G):
	for node in nx.topological_sort(G):
		# get list of AsyncResult objects from nodes
		# leading into this one as dependencies
		deps = [ results[n] for n in G.predecessors(node) ]
		# submit and store AsyncResult object
		with view.temp_flags(after=deps, block=False):
			results[node] = view.apply(jobs[node])

	pending = set(results.values())
	while pending:
	    try:
	        rc.wait(pending, 1e-3)
	    except parallel.TimeoutError:
	        # ignore timeouterrors, since they only mean that at least one isn't done
	        pass
	    # finished is the set of msg_ids that are complete
	    finished = pending.difference(rc.outstanding)
	    # update pending to exclude those that just finished
	    pending = pending.difference(finished)
	    for msg_id in finished:
	        # we know these are done, so don't worry about blocking
	        ar = rc.get_result(msg_id, block=True)
	        
	        # first return output id for MARS results dict
	        print(node.outputId)

	        # second return output result 
	        print(node.result)


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