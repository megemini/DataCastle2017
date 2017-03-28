
import tornado.web
import tornado.websocket
import os.path
import logging

from uuid import uuid4
from tornado.escape import json_encode, json_decode, url_escape
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.websocket import websocket_connect
from tornado import gen

from time import sleep

from tornado.options import define, options

define("jport", default=8888, help="jupyter kernel gateway port", type=int)
define("lang", default="python", help="The kernel language if a new kernel will be created.")
# define("kernel-id", default=None, help="The id of an existing kernel for connecting and executing code. If not specified, a new kernel will be created.")


# Ref:
# jupyter kernel gateway python demo
# tornado Chat demo 
# http://www.jianshu.com/p/6e890428744c
class RunSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = []
    cache_size = 200

    kernel_id = None
    ws = None

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        # TODO: init with jupyter(import/session management)
        RunSocketHandler.waiters.add(self)

    def on_close(self):
        # TODO: init with jupyter(import/session management)
        # TODO: close ws from jupyter?!
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

        # 1. get websocket from jupyter if not        
        if self.ws == None:
            self.ws = yield self.get_jupyter_ws()

        # 2. run script from web
        # TODO: run flow should use js script list one-by-one
        if channel == "flow":
            run_results["content"] = yield self.run_flow(parsed["flow"])

        elif channel == "script":
            run_results["content"] = yield self.run_script(parsed["code"])

        logging.info(type(run_results["content"]))

        run_results["html"] = tornado.escape.to_basestring(
            self.render_string("console.html", results=run_results["content"]))

        RunSocketHandler.update_cache(run_results)
        RunSocketHandler.send_updates(run_results)


    @gen.coroutine
    def get_jupyter_ws(self, k_id=None):
        """
        Get jupyter kernel websocket 

        """

        base_url = os.getenv('BASE_GATEWAY_HTTP_URL', 'http://localhost:'+str(options.jport))
        base_ws_url = os.getenv('BASE_GATEWAY_WS_URL', 'ws://localhost:'+str(options.jport))

        auth_username = "demouser"
        auth_password = "demopass"

        logging.info(base_url)
        logging.info(base_ws_url)

        client = AsyncHTTPClient()

        if k_id != None:
            self.kernel_id = k_id
        
        if not self.kernel_id:
            logging.info("fetching!!!!!!!!!!")
            response = yield client.fetch(
                '{}/api/kernels'.format(base_url),
                method='POST',
                auth_username=auth_username,
                auth_password=auth_password,
                body=json_encode({'name' : options.lang})
            )
            kernel = json_decode(response.body)
            self.kernel_id = kernel['id']
            logging.info(
                '''Created kernel {0}. Connect other clients with the following command:
                docker-compose run client --kernel-id={0}
                '''.format(self.kernel_id)
            )
            
        ws_req = HTTPRequest(url='{}/api/kernels/{}/channels'.format(
                base_ws_url,
                url_escape(self.kernel_id)
            ),
            auth_username=auth_username,
            auth_password=auth_password
        )

        ws = yield websocket_connect(ws_req)
        logging.info('Connected to kernel websocket')

        raise gen.Return(ws)


    @gen.coroutine
    def run_flow(self, shell):
        logging.info("Running shell")
        logging.info(shell)
        logging.info('Sending message ')

        l = len(shell)
        while l > 0:
            l = l -1
            yield "ok"


    @gen.coroutine
    def run_script(self, script):
        """
        Run script with jupyter kernel gateway

        """
        auth_username = "demouser"
        auth_password = "demopass"

        logging.info("Running script")
        logging.info(script)
        logging.info('Sending message ')

        msg_id = uuid4().hex

        # Send an execute request
        self.ws.write_message(json_encode({
            'header': {
                'username': '',
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

        # Read all messages from jupyter, 
        # and find the response of this msg_id to return
        while 1:
            msg = yield self.ws.read_message()
            logging.info("read msg!!!!!!!!!!!")
            logging.info(type(msg))
            logging.info("MSG IS " + msg)
            msg = json_decode(msg)
            msg_type = msg['msg_type']

            logging.info('Received message type:', msg_type)

            if msg_type == 'error':
                logging.info('ERROR')
                raise gen.Return(msg['content'])

            parent_msg_id = msg['parent_header']['msg_id']

            if msg_type == 'stream' and parent_msg_id == msg_id:
                logging.info('  Content:', msg['content']['text'])
                raise gen.Return(msg['content']['text'])

            if msg_type == 'execute_result' and parent_msg_id == msg_id:
                raise gen.Return(msg['content']['data']['text/plain'])
                        
            # TODO: msg_type of assign a var!!!!!!!!!!!!!!