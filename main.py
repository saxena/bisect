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
def DBTree(tree):
    #HACK overwriting id!
    t = json.loads(tree.nodes)["nodes"]["tree"]
    t["id"] = tree.key().id()
    return t
####################
def ListBT():
    tlist = BisectionTree.all().filter('is_public =', True).fetch(limit=10)
    return [DBTree(t) for t in tlist]

def AddBT(user, req):
    userid = user.user_id() if user else ''
    nodes = req.body
    is_public = True if req.get('is_public') is '' else False
    tree = BisectionTree(userid=userid, is_public=is_public, nodes=nodes)
    tree.put()
    tree_id = tree.key().id()
    logging.info('AddBT:%s', ','.join(map(str,(userid,is_public,tree_id))))
    return tree_id

def EditBT(req, tree_id):
    tree = BisectionTree.get_by_id(tree_id)
    if tree:
        if req.get('is_public') is not '':
            tree.is_public = True
        tree.nodes = req.body
        tree.put()
        return tree.key().id()
    else:
        return None

def DelBT(req, tree_id):
    tree = BisectionTree.get_by_id(tree_id)
    if tree:
        tree.delete()
        return tree_id
    else:
        return None

class BisectionTree(db.Model):
    userid = db.StringProperty(required=False)
    is_public = db.BooleanProperty(required=True)
    nodes = db.TextProperty(required=True)

####################
def UserCanGetBT(user, tree_id):
    tree = BisectionTree.get_by_id(tree_id)
    if not tree:
        return None
    elif tree.is_public :
        return tree
    elif user and tree.userid is user.user_id() :
        return tree
    else:
        return None

def UserCanAddBT(user, tree_id=0):
    return True

def UserCanEditBT(user, tree_id):
    tree = BisectionTree.get_by_id(tree_id)
    if tree and user and tree.userid is user.user_id():
        return tree
    else:
        return None
####################
def GetUserData():
    u = users.get_current_user()
    u_url = users.create_logout_url("/tree") if u else users.create_login_url("/tree")
    return (u, u_url)

def RenderTreeTmpl(u,u_url,tree, t_list ):
    return tree_tmpl.render({
        "jtree": tree,
        "tlist": t_list,
        "user": u.nickname() if u else None,
        "uurl": u_url
    })
####################
class NewTreeHandler(webapp2.RequestHandler):
    def get(self):
        u,u_url = GetUserData()
        t_list = ListBT()
        self.response.out.write(RenderTreeTmpl(u,u_url,None,t_list))

    def post(self):
        u,u_url = GetUserData()
        status = None
        if UserCanAddBT(u):
            tree_id = AddBT(u, self.request)
            self.response.status_int = 202
            self.response.write(json.dumps({"id":str(tree_id)}))
        else:
            self.response.status_int = 401

class TreeHandler(webapp2.RequestHandler):
    def get(self, tree_id):
        u,u_url = GetUserData()
        tree = UserCanGetBT(u, int(tree_id))
        if tree :
            self.response.out.write(RenderTreeTmpl(u,u_url,tree,None))
        else:
            self.response.status_int = 401

    def put(self, tree_id):
        u = users.get_current_user()
        if UserCanEditBT(u, int(tree_id)):
            status = EditBT(self.request, int(tree_id))
            self.response.status_int = 202 if status else 404
            self.response.write(json.dumps(status))

    def delete(self, tree_id):
        u = users.get_current_user()
        if UserCanEditBT(u, int(tree_id)):
            status = DelBT(self.request, int(tree_id))
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
