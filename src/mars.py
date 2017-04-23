#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.httpserver
import tornado.httpclient
import tornado.ioloop
import tornado.web
import os.path
import logging
import uuid

from runsocket import RunSocketHandler
from tornado import gen
from tornado.options import define, options, parse_command_line

define("port", default=8008, help="run on the given port", type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", HomeHandler),
            (r"/run_socket", RunSocketHandler),
            (r"/run_command", RunCommandHandler),
        ]
        settings = dict(
            mars_title=u"Machine Learning",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            debug=True,
            default_handler_class = HomeHandler,
            compress_response = True,
        )
        super(Application, self).__init__(handlers, **settings)



class HomeHandler(tornado.web.RequestHandler):
    """
    Main page handler
    """
    def get(self):

        # TODO: manage session/kernel id

        self.render('topo.html') 


class RunCommandHandler(tornado.web.RequestHandler):
    """
    Command handler
    """
    def handle_response(self, response):
        logging.info("response from jupyter of command interrupt")
        logging.info(response)
        if response.error:
            logging.info(response.error)
        else:
            logging.info(response.body)


    @gen.coroutine
    def post(self):
        command = self.get_argument("command")
        # kernel_id = self.get_argument("kernelId")
        kernel_id = RunSocketHandler.kernel_id

        logging.info("kernel id $$$$$$$$$$$$$$$$$")
        logging.info(kernel_id)

        if command == "stop":
            jport = RunSocketHandler.jport

            request = tornado.httpclient.HTTPRequest(
                url="http://localhost:" + jport +"/api/kernels/"+ kernel_id +"/interrupt", 
                method="POST",
                body="")

            logging.info(request)

            http_client = tornado.httpclient.AsyncHTTPClient()
            response = yield http_client.fetch(request, self.handle_response)

            logging.info("return response to command###################")

            self.write(response.body)

    def get(self):
        pass
        


def main():    
    parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)

    logging.info('Server started: http://localhost:' + str(options.port))

    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()