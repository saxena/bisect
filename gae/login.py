import os
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

from google.appengine.api import users

class LoginHandler(webapp.RequestHandler):
    def get(self):
        cont = self.request.get('continue')
        template_values = {'continue': cont}
        path = os.path.join(os.path.dirname(__file__), 'login.html')
        self.response.out.write(template.render(path, template_values))
        
    def post(self):
        cont = self.request.get('continue')
        #openid = self.request.get('openid_url')
        openid = self.request.get('openid_identifier')
        if openid:
            logging.info('creating login url for openid: %s' % openid)
            login_url = users.create_login_url(cont, None, federated_identity=openid)
            logging.info('redirecting to url: %s' % login_url)
            self.redirect(login_url)
        else:
            self.error(400)

def main():
    application = webapp.WSGIApplication([('/_ah/login_required', LoginHandler)], debug=True)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
