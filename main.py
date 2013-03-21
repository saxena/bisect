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
    user = users.get_current_user()
    #tree_id = req.get('id')
    logging.info('EditBT: %s', ','.join(map(str,(user,tree_id))))
    tree = BisectionTree.get_by_id(tree_id)
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


class NewTreeHandler(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('first-banner.html')
        self.response.out.write(template.render({}))

    def post(self):
        status = AddBT(self.request)
        self.response.status_int = 202 if status else 404
        self.response.write(json.dumps({"id":str(status)}))

class TreeHandler(webapp2.RequestHandler):
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

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'assets', 'tmpl')
    ))

def main():
    logging.getLogger().setLevel(logging.DEBUG)

if __name__ == "__main__":
    main()
