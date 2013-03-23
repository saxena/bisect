"use strict";

var mytreeview;
var mytreemodel;
var myroute;

var datat =
{
    //id :"t1", -- not present on "NEW" objects
    nodes :
    {
        tree:
        {
            id:-1,
            head:"A Tree",
            desc:"A Brief description of Tree"
        },

        n0:
        {
            id:0,
            head:"Top Root",
            desc:"Data for Top Root",
        },

        n1:
        {
            id:1,
            head:"Mid Root",
            desc:"Data for Left Mid Root",
        },

        n2:
        {
            id:2,
            head:"Mid Root",
            desc:"Data for Mid Root",
        },

        n3:
        {
            id:3,
            head:"Bot Leaf",
            desc:"Data for Left Bot Leaf",
        },

        n4:
        {
            id:4,
            head:"Bot Leaf",
            desc:"Data for Right Bot Leaf",
        },
   }
};

//render_ntree("#t-tmpl-n3-test", datac);
function render_ntree(id, t){
    var tmpl_ntree = Handlebars.compile($("#tmpl-ntree").html());
    $(id).append(tmpl_ntree(t));
}

var TreeModel = Backbone.Model.extend({

    urlRoot:"/tree",

});

var TreeView = Backbone.View.extend({

    events: {
        "click .btn.act-edit": "clickEdit",
        "click .btn.act-cancel": "clickCancel",
        "click .btn.act-save": "clickSave",

        "click .btn.node-modify": "clickNodeModify",
        "keydown .tree" : "clickEditHandler",

    },

    initialize: function(){
        this.tmpl_tree = Handlebars.compile($("#tmpl-tree").html());

        this.EditList = {};
        this.VisList = {};

        this.listenTo(this.model, {
            "request": this.statusSaving,
            "sync": this.statusDone
        }, this);

        this.render();
    },

    render: function(){
        this.$el.html(this.tmpl_tree(this.model.attributes));
        return this;
    },

    statusSaving: function(e){
        console.log("Saving...");
    },

    statusDone: function(e){
        myroute.navigate(this.model.url());
        console.log("Saved");
    },

    clickEditHandler: function(e){
        //var esc = e.which === 27;
        //var ret = e.which === 13;
        var tree_elem = $(e.target).parent();
        var id = tree_elem.data("id");
        //Mark tree-elem as edited
        if (!_.has(this.EditList, id)){
            this.EditList[id] = true;
            //Show user it has changed
            tree_elem.children("span.label:first-child").text("edited");
        }
        console.log("EditNode :"+id);
    },

    GetNodeChild: function(target){
        var np =  Number(target.parent().parent().data("id"));
        if(isNaN(np)) throw "NaN";
        return [ 2*np+1, 2*np+2 ];
    },

    GetElemData: function(id){
        var elem = $("div[data-id="+id+"]");
        var head = elem.children(".node-head").html();
        var desc = elem.children(".node-desc").html();
        var node = { "id" : id, "head": head, "desc": desc };
        return node;
    },

    toggleNodeVis : function(e) {
        //TODO: Provide data-pid in child nodes for jquery selection generation
        var vis;
        var sel_c0 = $("div[data-id="+e+"]");
        sel_c0.toggleClass("tree-elem-empty");
        vis = !sel_c0.hasClass("tree-elem-empty");
        this.VisList[e] = vis;
        sel_c0.children(".node-head, .node-desc").attr("contenteditable", vis);
        return vis;
    },

    clickNodeModify : function(e) {
        var tgt_sel = $(e.currentTarget);
        var nodes = this.GetNodeChild(tgt_sel);
        var vis = _.map(nodes, this.toggleNodeVis, this);
        $(tgt_sel).button( vis[0] ? 'rem':'add');
        console.log("NodeModify " + nodes);
    },

    toggleToolbar : function(enable){
        this.$(".btn-toolbar .btn")
            .toggleClass("disabled")
            .attr('disabled', function(i,val){
                if (val)
                    $(this).removeAttr('disabled')
                else
                    return 'disabled';
            });
    },

    toggleTreeEdit : function(enable){
        this.$(".tree").toggleClass("well");
        this.$(".on-edit").toggle();
        this.$(".node-head, .node-desc").attr("contenteditable", enable);
        if (!enable) this.$("span.label").text("");
    },

    clickEdit : function(e){
        this.toggleToolbar();
        this.toggleTreeEdit(true);
    },

    clickCancel: function(e){
        this.toggleToolbar();

        this.render();
        this.VisList = {};
        this.EditList = {};
    },

    clickSave: function(e){
        this.ModList = this.model.get("nodes");

        if(!_.every(this.EditList,_.identity))
            console.log("false in EditList: ");

        console.log(this.VisList);
        console.log(this.EditList);

        /*
          -- Get Current Nodes
          -- map through VisList and update current Nodes
          -- mps through EditList and update current Nodes
        */
        _.each(this.VisList, function(v,k){
            var nid = (k === "-1") ? "tree" : "n"+k;
            if(v){
                console.log("set node :"+k)
                this.ModList[nid] = this.GetElemData(k);
            }else{
                console.log("del node :"+k)
                delete this.ModList[nid];
            }
        }, this);

        console.log(this.EditList);

        _.each(this.VisList, function(v,k){
            if(_.has(this.EditList, k)) delete this.EditList[k];
        }, this);

        _.each(this.EditList, function(v,k){
            var nid = (k === "-1") ? "tree" : "n"+k;
            console.log("set node :"+k)
            this.ModList[nid] = this.GetElemData(k);
        }, this);

        this.toggleToolbar();
        this.toggleTreeEdit(false);

        //Set new model
        this.model.save("nodes", this.ModList);

        this.VisList = {};
        this.EditList = {};
        this.ModList = {};
    }

});

var BisectRouter = Backbone.Router.extend({

});

jQuery(document).ready(function(){
    mytreemodel = new TreeModel(datat);
    mytreeview = new TreeView({el:"#t-tmpl-r3-test", model: mytreemodel});
    myroute = new BisectRouter();
    Backbone.history.start({pushState: true});
});
