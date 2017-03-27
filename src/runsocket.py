
import tornado.web
import tornado.websocket
import os.path
import logging
import uuid

from uuid import uuid4
from tornado.escape import json_encode, json_decode, url_escape
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.websocket import websocket_connect
from tornado import gen

from tornado.options import define, options

define("jport", default=8890, help="jupyter kernel gateway port", type=int)
define("lang", default="python", help="The kernel language if a new kernel will be created.")
define("kernel-id", default=None, help="The id of an existing kernel for connecting and executing code. If not specified, a new kernel will be created.")


# Ref:
# jupyter kernel gateway python demo
# tornado Chat demo 
# http://www.jianshu.com/p/6e890428744c
class RunSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = []
    cache_size = 200

    # def __init__(self):
    #     waiters = set()
    #     cache = []
    #     cache_size = 200

    #     base_url = os.getenv('BASE_GATEWAY_HTTP_URL', 'http://localhost:'+str(options.jport))
    #     base_ws_url = os.getenv('BASE_GATEWAY_WS_URL', 'ws://localhost:'+str(options.jport))

    #     auth_username = "demouser"
    #     auth_password = "demopass"

    #     logging.info(base_url)
    #     logging.info(base_ws_url)
        
    #     client = AsyncHTTPClient()
    #     kernel_id = options.kernel_id
    #     if not kernel_id:
    #         response = yield client.fetch(
    #             '{}/api/kernels'.format(base_url),
    #             method='POST',
    #             auth_username=auth_username,
    #             auth_password=auth_password,
    #             body=json_encode({'name' : options.lang})
    #         )
    #         kernel = json_decode(response.body)
    #         kernel_id = kernel['id']
    #         logging.info(
    #             '''Created kernel {0}. Connect other clients with the following command:
    #             docker-compose run client --kernel-id={0}
    #             '''.format(kernel_id)
    #         )
            
    #     ws_req = HTTPRequest(url='{}/api/kernels/{}/channels'.format(
    #             base_ws_url,
    #             url_escape(kernel_id)
    #         ),
    #         auth_username=auth_username,
    #         auth_password=auth_password
    #     )

    #     ws = yield websocket_connect(ws_req)
    #     logging.info('Connected to kernel websocket')

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        # TODO: init with jupyter(import/session management)
        RunSocketHandler.waiters.add(self)

    def on_close(self):
        # TODO: init with jupyter(import/session management)
        RunSocketHandler.waiters.remove(self)

    @classmethod
    def update_cache(cls, run_results):
        cls.cache.append(run_results)
        if len(cls.cache) > cls.cache_size:
            cls.cache = cls.cache[-cls.cache_size:]

    @classmethod
    def send_updates(cls, run_results):
        # TODO: send to user with session id
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(run_results)
            except:
                logging.error("Error sending message", exc_info=True)


    @gen.coroutine
    def on_message(self, message):

        logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)

        channel = parsed["channel"]

        run_results = {}

        run_results["content"] = ""

        # get results from jupyter

        base_url = os.getenv('BASE_GATEWAY_HTTP_URL', 'http://localhost:'+str(options.jport))
        base_ws_url = os.getenv('BASE_GATEWAY_WS_URL', 'ws://localhost:'+str(options.jport))

        auth_username = "demouser"
        auth_password = "demopass"

        logging.info(base_url)
        logging.info(base_ws_url)
        
        client = AsyncHTTPClient()
        kernel_id = options.kernel_id
        if not kernel_id:
            response = yield client.fetch(
                '{}/api/kernels'.format(base_url),
                method='POST',
                auth_username=auth_username,
                auth_password=auth_password,
                body=json_encode({'name' : options.lang})
            )
            kernel = json_decode(response.body)
            kernel_id = kernel['id']
            logging.info(
                '''Created kernel {0}. Connect other clients with the following command:
                docker-compose run client --kernel-id={0}
                '''.format(kernel_id)
            )
            
        ws_req = HTTPRequest(url='{}/api/kernels/{}/channels'.format(
                base_ws_url,
                url_escape(kernel_id)
            ),
            auth_username=auth_username,
            auth_password=auth_password
        )

        ws = yield websocket_connect(ws_req)
        logging.info('Connected to kernel websocket')

        if channel == "flow":
            run_results["content"] = self.run_flow(parsed["flow"], ws)

        elif channel == "script":
            # for msg in self.run_script(parsed["code"], ws):
            msg = self.run_script(parsed["code"], ws)
            msg = json_decode(msg)
            msg_type = msg['msg_type']

            logging.info('Received message type:', msg_type)

            if msg_type == 'error':
                logging.info('ERROR')
                run_results["content"] = msg

            parent_msg_id = msg['parent_header']['msg_id']
            if msg_type == 'stream' and parent_msg_id == msg_id:
                logging.info('  Content:', msg['content']['text'])
                run_results["content"] = msg['content']['text']

            

        logging.info("run_script is : " + run_results["content"])        


        run_results["html"] = tornado.escape.to_basestring(
            render_string("console.html", results=run_results["content"]))

        RunSocketHandler.update_cache(run_results)
        RunSocketHandler.send_updates(run_results)


    def run_flow(self, shell, ws):
        logging.info("Running shell")
        logging.info(shell)
        logging.info('Sending message ')

        l = len(shell)
        while l > 0:
            l = l -1
            yield "ok"


    @gen.coroutine
    def run_script(self, script, ws):
        auth_username = "demouser"
        auth_password = "demopass"

        logging.info("Running script")
        logging.info(script)
        logging.info('Sending message ')

        msg_id = uuid4().hex
        # Send an execute request
        ws.write_message(json_encode({
            'header': {
                'username': auth_username,
                'version': '5.0',
                'session': '',
                'msg_id': msg_id,
                'msg_type': 'execute_request'
            },
            'parent_header': {},
            'channel': 'shell',
            'content': {
                'code': script,
                'silent': False,
                'store_history': True,
                'user_expressions' : {},
                'allow_stdin' : False
            },
            'metadata': {},
            'buffers': {}
        }))

        return ws.read_message()
        
