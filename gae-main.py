import sys
import os
import urllib
import logging

from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.api import users
from google.appengine.api import mail
from google.appengine.api import memcache
from google.appengine.ext import blobstore
from google.appengine.ext import webapp
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

import webapp2

def ExceptionMailHandler(user, key, estr):
    from_str = "Inorg Server <rahul.k.saxena@gmail.com>"
    to_str = "<rahul.k.saxena@gmail.com>"
    subject_str = "Inorg User Upload Exception"
    body_str = "::".join((user,key,estr))
    mail.send_mail(sender=from_str, to=to_str,
                   subject=subject_str, body=body_str)

def GetBaseHtmlInfo(url):
    blob_url = logout_url = username = userprovider = None
    login_list = []
    user = users.get_current_user()
    if user:
        #if user.federated_identity():
        #    username = user.federated_identity()
        #else:
        username = user.nickname()
        #userprovider = user.federated_provider()
        logout_url = users.create_logout_url(url)
        blob_url= blobstore.create_upload_url('/upload')
        logging.debug ("Main Handler: Serving %s", username)
    else:
        blob_url = '#'
        #Generate Login URLs
        #urls are lower-case
        openid_providers = ['google.com/accounts/o8/id', 'yahoo.com']
        for p in openid_providers:
            p_name = p.split('.')[0] # take "AOL" from "AOL.com"
            p_url = p.lower()        # "AOL.com" -> "aol.com"
            login_list.append({ 'url': users.create_login_url(dest_url=url,
                                                              federated_identity=p_url),
                                'img': "/images/%sW.png" % p_name,
                                'name': p_name
                                })
    #Populate The Template
    return {
        'blobuploadurl':blob_url,
        'username': username,
        'userprovider': userprovider,
        'usersign': logout_url,
        'login_list': login_list,
        'debug': DEBUG,
        'dev_version': MAJOR_VERSION > 3
        }

class HtmlHandler(webapp2.RequestHandler):
    def get(self):
        template_values = GetBaseHtmlInfo(self.request.uri)
        path = os.path.join(os.path.dirname(__file__), 'web', 'assets', 'html', 'first-banner.html')
        self.response.out.write(template.render(path, template_values))

class BlobUploadUrlHandler(webapp.RequestHandler):
    def get(self):
        if not users.get_current_user():
            return self.error(404)

        form_html = """<h2>Upload a .tcx file</h2>
        <center><form id="upform" method="POST" enctype="multipart/form-data" action="%s">
        <input type="file" name="file">
        <input type="submit" name="upload" value="Go">
        </form></center>""" % (blobstore.create_upload_url('/upload'))
        self.response.out.write(form_html)

class BlobUploadUrlJsonHandler(webapp.RequestHandler):
    def get(self):
        if not users.get_current_user():
            return self.error(404)
        self.response.out.write(str(blobstore.create_upload_url('/upload')))

class UserMessageFormJsonHandler(webapp.RequestHandler):
    def get(self):
        self.response.out.write(str(os.times()))

class UserMessageHandler(webapp.RequestHandler):
    def post(self):
        user_email = self.request.get('email')
        user_body = self.request.get('body')
        #logging.info("%s:%s", user_email, user_body)
        #user_data = self.request.get'data')
        if user_email is not None and user_body is not None:
            from_str = "Inorg User Message <rahul.k.saxena@gmail.com>"
            to_str = "<rahul.k.saxena@gmail.com>"
            subject_str = "Inorg Message from %s" % user_email
            mail.send_mail(sender=from_str, to=to_str,
                           subject=subject_str, body=user_body)
            self.response.out.write("Email Sent")
        else:
            self.error(400)

class UserInfoHandler(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            user = users.User('rahul.k.saxena@gmail.com')
        self.response.out.write(user_list_activities(user))

class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            user = users.get_current_user()
            if not user: return self.error(404)

            #Assume that only a single blob is uploaded
            uploads = self.get_uploads()
            num_uploads = len(uploads)
            logging.info("Upload Handler: User %s(%s): %d blobs uploaded", user.email(), user.nickname(), num_uploads)
            if num_uploads > 0:
                blob_reader = blobstore.BlobReader(uploads[0].key(),
                                                   buffer_size = blobstore.MAX_BLOB_FETCH_SIZE)
                user_process_upload(user, blob_reader, uploads[0].key(), MAJOR_VERSION)
                if blob_reader: blob_reader.close()
                self.redirect('/')
        except:
            key = str(uploads[0].key())
            e_str = str(sys.exc_info()[0])
            ExceptionMailHandler(user.nickname(),key,e_str)
            #TODO Better Exception Handling
            logging.error ("Upload Handler: Exception: %s", e_str)
            self.error(500)
            #raise
        finally:
            logging.debug("Upload Handler: Calling Finally")


class RankHandler(webapp.RequestHandler):
    def get(self, act_type):
        #logging.debug("Fetching Rankings for %s", act_type)
        self.response.out.write(list_public_activities(act_type))

## Handle Activity related records
## GET key -- fetches blob; DELETE key -- deletes key + blobs
class ActivityHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            user = users.User('rahul.k.saxena@gmail.com')
        activity_key = self.request.str_params['key']
        blob_key = user_has_activity(user, activity_key)
        if blob_key is not None:
            self.send_blob(blob_key)
        else:
            self.error(404)

    def delete(self):
        user = users.get_current_user()
        if not user:
            self.error(401)
        activity_key = self.request.str_params.getall('key')
        logging.debug("delete key: %s", activity_key)
        if len(activity_key) == 1:
            response = user_delete_activity(user, activity_key[0])
            if response > 200:
                self.error(response)
        else:
            self.error(204)

    def post(self):
        user = users.get_current_user()
        if not user:
            self.error(401)
        activity_key = self.request.str_params['key']
        public_str= self.request.get('ispublic')
        if (activity_key is not None and public_str is not ''):
            public_bool = int(public_str) != 0
            response = user_mod_activity(user, activity_key, public_bool)
            if response > 200:
                self.error(response)
        else:
            self.error(204)

if __name__ == "__main__":
    DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')
    DEBUG = True
    MAJOR_VERSION = int(float(os.environ['CURRENT_VERSION_ID']))
    logging.getLogger().setLevel(logging.DEBUG)
    logging.debug("Starting app, MAJOR_VERSION = %s, DEBUG mode: %s", MAJOR_VERSION, DEBUG)

    app = webapp2.WSGIApplication([
            #(r'/rankings/(.*)', RankHandler),
            #UI Specific Handlers
            ('/', HtmlHandler)
            ], debug=DEBUG)
