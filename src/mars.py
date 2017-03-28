#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.httpserver
import tornado.ioloop
import tornado.web
import os.path
import logging
import uuid

from runsocket import RunSocketHandler

from tornado.options import define, options, parse_command_line

define("port", default=8008, help="run on the given port", type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", HomeHandler),
            (r"/run_socket", RunSocketHandler),
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

        RunSocketHandler.get_jupyter_ws()


class HomeHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('topo.html') 



def main():    
    parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)

    logging.info('Server started: http://localhost:' + str(options.port))

    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()