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


define("jport", default=8009, help="jupyter kernel gateway port", type=int)
define("lang", default="python", help="The kernel language if a new kernel will be created.")


class RunSocketHandler(tornado.websocket.WebSocketHandler):
    """
    Socket handler

    TODO: parallel pool
    """
    waiters = set()
    cache = []
    cache_size = 200

    jport = str(options.jport)
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
        # TODO: close ws and shutdown kernel from jupyter
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
        run_results["id"] = parsed["id"]
        run_results["channel"] = channel
        run_results["status"] = ""
        run_results["content"] = {}


        # 1. get websocket from jupyter if not   
        if parsed.get("kernelId") == "":
            ws_result = yield self.get_jupyter_ws()

            if ws_result[2] == True:
                run_results["kernelId"] = ws_result[0]

        else:
            run_results["kernelId"] = parsed["kernelId"]

        
        # 2. run script from web
        # TODO: run flow should use js script list one-by-one
        # TODO: compare id, then return
        run_list = None

        # channel: "flow"/"script"
        if channel == "flow":
            run_list = yield self.run_flow(parsed["content"])

        elif channel == "script":
            run_list = yield self.run_script(parsed["content"], "output")

        # status default is True
        logging.info(run_list)

        run_status = True
        for result in run_list:
            run_status = run_status and result["status"]
            run_results["content"] = dict(run_results["content"], **result["content"])


        run_results["status"] = run_status and "ok" or "error"

        RunSocketHandler.update_cache(run_results)
        RunSocketHandler.send_updates(run_results)


    @gen.coroutine
    def get_jupyter_ws(self, user_id=None):
        """
        Get jupyter kernel websocket 

        TODO: with user id assign websocket
        """

        base_url = os.getenv('BASE_GATEWAY_HTTP_URL', 'http://localhost:' + str(options.jport))
        base_ws_url = os.getenv('BASE_GATEWAY_WS_URL', 'ws://localhost:' + str(options.jport))

        auth_username = "demouser"
        auth_password = "demopass"

        logging.info(base_url)
        logging.info(base_ws_url)

        client = AsyncHTTPClient()

        # TODO: multi user
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

        yield self.run_script(scriptutil.init_script(), "init")


        # TODO: temp for test!!!
        RunSocketHandler.kernel_id = self.kernel_id

        raise gen.Return([self.kernel_id, "text", True])

    @gen.coroutine
    def run_flow(self, content):
        """
        Input message structure:

            var flow = {
                "id": uid,
                "kernelId": kernelId,
                "channel": "flow",
                "content": {        
                    widget: node.widgetId,
                    node: node.id,
                    module: node.module,
                    func: node.func,
                    input: node.input.valuePair,
                    output: node.output.default,
                    delete: runDelVarList,
                },
            }

            Output message structure:
            var output = {
                "id": uid,
                "kernelId": kernelId,
                "channel": "flow",
                "status": True/False
                "content": {
                    output1: xxxx, # for outputs
                    output2: xxxx,
                    output: xxxx, # for script
                    func: xxxx, # for func
                },
            }
        """

        logging.info("Running flow")
        logging.info(content)
        logging.info('Sending message ')

        # TODO: run flow content util stop/end
        # Get inputs from flow content
        # ALL inputs are STRING!!!

        s_module = content["module"]
        s_func = content["func"]
        s_input = content["input"]
        s_output = content["output"]
        s_delete = content["delete"]

        # 1. delete vars
        if len(s_delete) > 0: 
            yield self.run_script(scriptutil.get_delete_script(s_delete), "func")

        yield self.run_script(scriptutil.get_delete_script(s_output), "func")


        # 2. run func
        script = scriptutil.get_script(s_module, s_func, s_input, s_output)
        logging.info(script)


        run_results = []
        run_list = yield self.run_script(script, "func")

        logging.info("run result!!!!!!!!!")
        logging.info(run_list)

        run_results.extend(run_list)

        # 3. get var outputs
        for output in s_output:
            run_list = yield self.run_script(output, output)
            run_results.extend(run_list)

        raise gen.Return(run_results)


    def assemble_result(self, result, name):
        """
        Assembel result from script
        """

        content = None

        if result[1] == "image":
            content = tornado.escape.to_basestring(
                self.render_string("image.html", results=(result[0])))
        else:
            content = tornado.escape.to_basestring(
                self.render_string("console.html", results=(result[0])))

        return [{"status": result[2], "content": {name: content}}]

    @gen.coroutine
    def run_script(self, script, name):
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
            raise gen.Return(self.assemble_result(["Write jupyter message error!", "text", False], name))

        # Read all messages from jupyter, 
        # and find the response of this msg_id to return
        while 1:
            msg = yield self.ws.read_message()

            logging.info("read msg!!!!!!!!!!!")
            logging.info(type(msg))
            logging.info("MSG IS " + msg)

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
                    raise gen.Return(self.assemble_result(["Error: " + msg['content']['evalue'], "evalue", False], name))

                if msg_type == 'stream' and parent_msg_id == msg_id:
                    logging.info("!!!!!!!!!!!!!!!msg['content']['text']:")
                    logging.info(msg['content']['text'])
                    raise gen.Return(self.assemble_result([msg['content']['text'], "text", True], name))

                if msg_type == 'execute_result' and parent_msg_id == msg_id:
                    logging.info("!!!!!!!!!!!!!!!msg['content']['data']['text/plain']:")
                    logging.info(msg['content']['data']['text/plain'])

                    if msg['content']['data'].get('image/png'):
                        logging.info("IMAGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                        raise gen.Return(self.assemble_result([msg['content']['data']['image/png'], "image", True], name))


                    # if there is text/html returned, then return this first, instead of text/plain
                    if msg['content']['data'].get('text/html'):
                        raise gen.Return(self.assemble_result([msg['content']['data']['text/html'], "html", True], name))

                    raise gen.Return(self.assemble_result([msg['content']['data']['text/plain'], "text", True], name))

                # if msg_type == 'display_data' and parent_msg_id == msg_id:
                #     logging.info("IMAGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                #     raise gen.Return(self.assemble_result([msg['content']['data']['image/png'], "image", True], name))

            elif msg_channel == "shell":
                """
                read shell message, the last message with a session
                """
                if msg_type == 'execute_reply' and parent_msg_id == msg_id:
                    if msg['content'].get('payload') != None:
                        if len(msg['content']['payload']) > 0:
                            logging.info("!!!!!!!!!!!!!!!msg['content']['payload'][0]['data']['text/plain']:")
                            raise gen.Return(self.assemble_result([msg['content']['payload'][0]['data']['text/plain'], "text", True], name))   

                    logging.info("msg['content']['payload']:")
                    raise gen.Return(self.assemble_result(["Process: OK!", "text", True], name))

                    # TODO: msg_type of assign a var!





