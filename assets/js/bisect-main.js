"use strict";

var mytlist;
var recenttlist;
var mytreeview;
var mytreemodel;
var myroute;

var new_tree =
{
    //id :-- not present on the template
    nodes :
    {
        tree:
        {
            id:-1,
            head:"Example bisection tree (Edit to start using as a template)",
            desc:"Description of the tree: Provide an overview of the scenario being bisected."
        },

        n0:
        {
            id:0,
            head:"Ask the first bisection question here",
            regex:"error:",
            desc:"The first bisection sets the scope for the bisection at the highest level. The answer to the above question determines whether the next bisection point lies to the left or the right.",
        },

        n1:
        {
            id:1,
            head:"Answer is Yes: Ask follow-up question?",
            regex:"not found",
            desc:"Provide a description of the current state.",
        },

        n2:
        {
            id:2,
            head:"Answer is No: Ask follow-up question?",
            regex:"warning:",
            desc:"Provide a description of the current state.",
        },

        n3:
        {
            id:3,
            head:"Yes: Follow-up question?",
            desc:"Describe the situation here",
        },

        n4:
        {
            id:4,
            head:"No: Follow-up question?",
            desc:"Keep the user informed!",
        },

        n5:
        {
            id:5,
            head:"Yes: Follow-up question?",
            desc:"This is a known issue. Inform the user.",
        },

        n6:
        {
            id:6,
            head:"No: Follow-up question?",
            desc:"This is a new issue. File bug report.",
        },

   }
};

var BisectRouter = Backbone.Router.extend({

});

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
            tree_elem.children("span.label").text("edited");
        }
        console.log("EditNode :"+id);
    },

    GetElemData: function(id){
        var elem = $("div[data-id="+id+"]");
        var head = elem.children(".node-head").html();
        var desc = elem.children(".node-desc").html();
        var node = { "id" : id, "head": head, "desc": desc };
        return node;
    },

    GetNodeChild: function(target){
        var np =  Number(target.parent().parent().data("id"));
        if(isNaN(np)) throw "NaN";
        return [ 2*np+1, 2*np+2 ];
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
        this.$(".tree").toggleClass("well well-small");
        this.$(".on-edit").toggle();
        this.$(".node-head, .node-desc, .node-regex").attr("contenteditable", enable);
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

var TreeListModel = Backbone.Model.extend({

    url: function() {
        return "/tree";
    },

});

var TreeListView = Backbone.View.extend({

    initialize: function(){
        this.tmpl_tlist = Handlebars.compile($("#tmpl-tlist").html());
        this.render();
    },

    render: function(){
        this.$el.html(this.tmpl_tlist(this.model.attributes));
        return this;
    },

});

function _ScrollTo(to){
    var to_pos = $(to).offset().top;
    var hb_sel = $('html, body');
    return function(){
        hb_sel.animate({scrollTop:to_pos},400,"swing");
        return false;
    };
};
