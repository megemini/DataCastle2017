#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import logging
import uuid

import util.gen_features


from tornado.options import define, options
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



class HomeHandler(tornado.web.RequestHandler):
    # def get(self):
    #     greeting = self.get_argument('greeting', 'Hello')
    #     self.write(greeting + ', friendly user!')

    def get(self):
        self.render('topo.html') 

# Ref: http://www.jianshu.com/p/6e890428744c
class RunSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = []
    cache_size = 200

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
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(run_results)
            except:
                logging.error("Error sending message", exc_info=True)

    def on_message(self, message):
        logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)
        run_scripts = {
            "id": str(uuid.uuid4()),
            "run_script": parsed["run_script"],
            }
        # chat["html"] = tornado.escape.to_basestring(
        #     self.render_string("message.html", message=chat))

        logging.info("run_script is : " + run_scripts["run_script"])        
        # TODO: get results from jupyter
        results = "some results"

        run_results = {}
        run_results["id"] = run_scripts["id"]
        # run_results["body"] = run_scripts["body"]
        run_results["html"] = tornado.escape.to_basestring(
            self.render_string("console.html", results=results))

        RunSocketHandler.update_cache(run_results)
        RunSocketHandler.send_updates(run_results)


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)

    logging.info('Server started : http://localhost' + str(options.port))

    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()