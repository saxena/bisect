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

class TreeHandler(webapp2.RequestHandler):
    def get(self, tree_id):
        path = os.path.join(os.path.dirname(__file__),
                            'assets', 'html', 'first-banner.html')
        self.response.out.write(path)

    def post(self, tree_id):
        self.response.write(tree_id)
        #user = users.get_current_user()
        #if not user:
        #    self.error(401)

    def put(self, tree_id):
        self.response.status_int = 202
        #self.response.write(tree_id)

    def delete(self, tree_id):
        self.response.write(tree_id)


app = webapp2.WSGIApplication([
        (r'/trees/(\w+)', TreeHandler)
        ], debug=True)
