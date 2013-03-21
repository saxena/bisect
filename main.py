#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import webapp2
import jinja2
import json
import logging

from google.appengine.ext import db
from google.appengine.api import users

####################
def GetBT(req, tree_id):
    user = users.get_current_user()
    logging.info('GetBT: %s', ','.join(map(str,(user,tree_id))))
    tree = BisectionTree.get_by_id(tree_id)
    return tree

def AddBT(req):
    user = users.get_current_user()
    nodes = req.body
    is_public = False if req.get('is_public') is '' else True
    tree = BisectionTree(user=user, is_public=is_public, nodes=nodes)
    tree.put()
    tree_id = tree.key().id()
    logging.info('AddBT: %s', ','.join(map(str,(user,is_public,tree_id,nodes))))
    return tree_id

def EditBT(req, tree_id):
    tree = GetBT(req, tree_id)
    if tree is not None:
        tree.is_public = False if req.get('is_public') is '' else True
        tree.nodes = req.body
        tree.put()
        return tree.key().id()
    else:
        return None

def DelBT(req, tree_id):
    user = users.get_current_user()
    tree = BisectionTree.get(tree_id)
    if tree is not None:
        tree.delete()
        return tree_id
    else:
        return None

class BisectionTree(db.Model):
    user = db.UserProperty(required=False, auto_current_user=False)
    is_public = db.BooleanProperty()
    nodes = db.TextProperty()
####################
def GetUser():
    u = users.get_current_user()
    u_nick = u.nickname() if u else None
    u_url = users.create_logout_url("/tree") if u else users.create_login_url("/tree")
    return (u_nick, u_url)
####################
class NewTreeHandler(webapp2.RequestHandler):
    def get(self):
        usr,usr_url = GetUser()
        self.response.out.write(tree_tmpl.render({
                    "jtree": None,
                    "user": usr,
                    "user_url": usr_url
                    }))

    def post(self):
        status = AddBT(self.request)
        self.response.status_int = 202 if status else 404
        self.response.write(json.dumps({"id":str(status)}))

class TreeHandler(webapp2.RequestHandler):
    def get(self, tree_id):
        usr,usr_url = GetUser()
        tree = GetBT(self.request, int(tree_id))
        self.response.out.write(tree_tmpl.render({
                    "jtree": tree,
                    "user": usr,
                    "user_url": usr_url
                    }))

    def put(self, tree_id):
        status = EditBT(self.request, int(tree_id))
        self.response.status_int = 202 if status else 404
        self.response.write(json.dumps(status))

    def delete(self, tree_id):
        status = DelBT(self.request)
        self.response.status_int = 202 if status else 404
        self.response.write(json.dumps(status))

app = webapp2.WSGIApplication([
        (r'/tree/(\w+)', TreeHandler),
        (r'/tree', NewTreeHandler)
        ], debug=True)

jenv = jinja2.Environment(loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'assets', 'tmpl')))

tree_tmpl = jenv.get_template('first-banner.html')

def main():
    logging.getLogger().setLevel(logging.DEBUG)

if __name__ == "__main__":
    main()
