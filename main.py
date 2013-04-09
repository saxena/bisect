#!/usr/bin/env python

import os
import webapp2
import jinja2
import json
import logging

from google.appengine.ext import db
from google.appengine.api import users

####################
def GetBTDesc(tree):
    #HACK overwriting id: "tree" id is always encoded as -1
    t = json.loads(tree.nodes)["nodes"]["tree"]
    t["id"] = str(tree.key().id())
    return t

def GetBTJson(tree):
    t = json.loads(tree.nodes)
    t["id"] = str(tree.key().id())
    return t

####################
def ListBT():
    tlist = BisectionTree.all().filter('is_public =', True).fetch(limit=10)
    return [GetBTDesc(t) for t in tlist]

def AddBT(user, req):
    userid = user.user_id() if user else None
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
    logging.info("UserCanEditBT: U: %s T: %s", user, tree.userid)
    if tree and tree.userid is None:
        return tree
    elif tree and user and tree.userid is user.user_id():
        return tree
    else:
        return None
####################
def GetUserData():
    u = users.get_current_user()
    if u: u_url = users.create_logout_url("/tree")
    else: u_url = users.create_login_url("/tree")
    return (u, u_url)

def RenderTreeTmpl(u,u_url,tree,t_list):
    sep = (',',':')
    recenttlist = {"desc":"Newest Bisections","tlist":t_list}
    return tree_tmpl.render({
        "thistree": json.dumps(tree,separators=sep),
        "recenttlist": json.dumps(recenttlist,separators=sep),
        "user": u.nickname() if u else None,
        "uurl": u_url
    })

####################
class NewTreeHandler(webapp2.RequestHandler):
    def get(self):
        u,u_url = GetUserData()
        self.response.out.write(RenderTreeTmpl(u,u_url,None,ListBT()))

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
            self.response.out.write(RenderTreeTmpl(u,u_url,GetBTJson(tree),ListBT()))
        else:
            self.response.status_int = 401

    def put(self, tree_id):
        u = users.get_current_user()
        if UserCanEditBT(u, int(tree_id)):
            status = EditBT(self.request, int(tree_id))
            self.response.status_int = 202 if status else 404
            self.response.write(json.dumps(status))
        else:
            self.response.status_int = 403

    def delete(self, tree_id):
        u = users.get_current_user()
        if UserCanEditBT(u, int(tree_id)):
            status = DelBT(self.request, int(tree_id))
            self.response.status_int = 202 if status else 404
            self.response.write(json.dumps(status))

class BisectHandler(webapp2.RequestHandler):
    def post(self, tree_id):
        u = users.get_current_user()
        tree = UserCanGetBT(u, int(tree_id)):
        if tree :
            text = self.request.body
            result = BisectBT(json.loads(tree.nodes), text)
            self.response.write(json.dumps(result))
        else:
            self.response.status_int = 403

app = webapp2.WSGIApplication([
        (r'/tree/(\w+)', TreeHandler),
        (r'/tree', NewTreeHandler),
        (r'/bisect/(\w+)',BisectHandler),
        ('/', NewTreeHandler),
        ], debug=True)

jenv = jinja2.Environment(loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'assets', 'tmpl')))

tree_tmpl = jenv.get_template('first-banner.html')

def main():
    logging.getLogger().setLevel(logging.DEBUG)

if __name__ == "__main__":
    main()
