# -*- coding: utf-8 -*-

import tornado.web
import tornado.websocket
import logging
import os

from uuid import uuid4
from tornado.escape import json_encode, json_decode, url_escape
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.websocket import websocket_connect
from tornado import gen
from tornado.options import define, options

from util import fileutil, scriptutil
from func import *

define("jport", default=8009, help="jupyter kernel gateway port", type=int)
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
        # TODO: close ws and shutdown kernel from jupyter?!
        # self.ws.close()
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

        # 0. get parsed message
        parsed = tornado.escape.json_decode(message)
        channel = parsed["channel"]

        run_results = {}
        run_results["content"] = ""

        # 1. get websocket from jupyter if not        
        if self.ws == None:
            yield self.get_jupyter_ws()

        # 2. run script from web
        # TODO: run flow should use js script list one-by-one
        if channel == "run":
            run_results["content"] = yield self.run_flow(parsed["run"])

        elif channel == "script":
            run_results["content"] = yield self.run_script(parsed["code"])

        logging.info("type(run_results content) is ")
        logging.info(type(run_results["content"]))

        if len(run_results["content"]) > 1:
            run_results["html"] = tornado.escape.to_basestring(
                self.render_string("image.html", results=(run_results["content"][0])))
        else:
            run_results["html"] = tornado.escape.to_basestring(
                self.render_string("console.html", results=(run_results["content"][0])))

        RunSocketHandler.update_cache(run_results)
        RunSocketHandler.send_updates(run_results)


    @gen.coroutine
    def get_jupyter_ws(self, user_id=None):
        """
        Get jupyter kernel websocket 

        TODO: with user id assign websocket
        """

        base_url = os.getenv('BASE_GATEWAY_HTTP_URL', 'http://localhost:'+str(options.jport))
        base_ws_url = os.getenv('BASE_GATEWAY_WS_URL', 'ws://localhost:'+str(options.jport))

        auth_username = "demouser"
        auth_password = "demopass"

        logging.info(base_url)
        logging.info(base_ws_url)

        client = AsyncHTTPClient()

        if user_id != None:
            raise gen.Return()
        
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

        self.ws = ws

        yield self.run_script(scriptutil.init_script())

        raise gen.Return()

    @gen.coroutine
    def run_flow(self, flow):
        logging.info("Running flow")
        logging.info(flow)
        logging.info('Sending message ')

        # TODO: run flow util stop/end
        # l = len(shell)
        # while l > 0:
        #     l = l -1
        #     yield "ok"


        # Get inputs from flow
        # ALL inputs are STRING!!!

        file_path = fileutil.get_path("user_info_train.txt")

        head_user_info = "['id', 'gender', 'job', 'education', 'marital', 'household']"

        # 
        logging.info(file_path)
        logging.info(data.get_csv(file_path))

        inputs = {
            'file': {'value': file_path, 'type': 's'}, 
            # 'names': {'value': head_user_info, 'type': 'o'}
            }

        output = "output_csv_1"

        f1 = scriptutil.get_script(data.get_csv, inputs, output)

        run_results = yield self.run_script(f1)

        raise gen.Return(run_results)

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

        if self.ws == None:
            yield self.get_jupyter_ws()

        try:
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
        except Exception as e:
            raise gen.Return(["Write jupyter message error!"])



        # Read all messages from jupyter, 
        # and find the response of this msg_id to return
        while 1:
            # try:
            msg = yield self.ws.read_message()

            logging.info("read msg!!!!!!!!!!!")
            logging.info(type(msg))
            # logging.info("MSG IS " + msg)

            msg = json_decode(msg)
            msg_type = msg['msg_type']
            msg_channel = msg['channel']
            parent_msg_id = msg['parent_header']['msg_id']

            # shell(execute_request) --> 
            # iopub(status: busy) --> 
            # iopub(execute_input) --> 
            # iopub(execute_result) -->
            # iopub(status: idle) --> 
            # shell(execute_reply)


            if msg_channel == "iopub":
                """
                read iopub message
                """

                if msg_type == 'error':
                    logging.info("ERROR!!!!!!!!!!!!!!!!!msg['content']['evalue']")
                    logging.info(msg['content']['evalue'])
                    raise gen.Return([msg['content']['evalue']])

                if msg_type == 'stream' and parent_msg_id == msg_id:
                    logging.info("!!!!!!!!!!!!!!!msg['content']['text']:")
                    logging.info(msg['content']['text'])
                    raise gen.Return([msg['content']['text']])

                if msg_type == 'execute_result' and parent_msg_id == msg_id:
                    logging.info("!!!!!!!!!!!!!!!msg['content']['data']['text/plain']:")
                    logging.info(msg['content']['data']['text/plain'])

                    # if there is text/html returned, then return this first, instead of text/plain
                    if msg['content']['data'].get('text/html'):
                        raise gen.Return([msg['content']['data']['text/html']])

                    raise gen.Return([msg['content']['data']['text/plain']])

                if msg_type == 'display_data' and parent_msg_id == msg_id:
                    logging.info("IMAGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                    raise gen.Return([msg['content']['data']['image/png'], "image"])

            elif msg_channel == "shell":
                """
                read shell message, the last message with a session
                """
                if msg_type == 'execute_reply' and parent_msg_id == msg_id:
                    if len(msg['content']['payload']) > 0:
                        logging.info("!!!!!!!!!!!!!!!msg['content']['payload'][0]['data']['text/plain']:")
                        raise gen.Return([msg['content']['payload'][0]['data']['text/plain']])   

                    logging.info("msg['content']['payload']:")
                    raise gen.Return(["OK"])


                    # TODO: msg_type of assign a var!!!!!!!!!!!!!!





