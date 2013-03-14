"use strict";

var mytreeview;
var mytreemodel;

var desc_txt = "Data Donec id elit non mi porta gravida at eget metus. Maecenas faucibus mollis interdum. for Top Root";

var datat =
{
    tree:
    {
        id :"t1",
        head:"A Tree",
        desc:"A Brief description of Tree"
    },
    nodes :
    {
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

var datac =
    {
        tree:
        {
            id :"t2",
            head:"A Tree",
            desc:"A Brief description of Tree"
        },
        nodes :
        {
            n0:
            {
                id:0,
                head:"Top Root",
                desc: desc_txt,
            },

            n1:
            {
                id:1,
                head:"Mid Root",
                desc:desc_txt,
            },

            n2:
            {
                id:2,
                head:"Mid Root",
                desc:desc_txt,
            },

            n3:
            {
                id:3,
                head:"Bot Leaf",
                desc:desc_txt,
            },

             n4:
            {
                id:4,
                head:"Bot Leaf",
                desc:desc_txt,
            },
            n5:
            {
                id:5,
                head:"Bot Leaf",
                desc:desc_txt,
            },
            n6:
            {
                id:6,
                head:"Bot Leaf",
                desc:desc_txt,
            },

       }
    };

function render_ltree(id, t){
    var tmpl_tree = Handlebars.compile($("#tmpl-tree").html());
    $(id).append(tmpl_tree(t));
}

function render_ntree(id, t){
    var tmpl_ntree = Handlebars.compile($("#tmpl-ntree").html());
    $(id).append(tmpl_ntree(t));
}


jQuery(document).ready(function(){
    render_ltree("#t-tmpl-r3-test", datat);
    mytreeview = new TreeView({el:"#t-tmpl-r3-test"});
    mytreemodel = new TreeModel(datat);
    //render_ntree("#t-tmpl-n3-test", datac);
    //render_rtree("#t-tmpl-r31-test", datac);
});

var TreeModel = Backbone.Model.extend({
    urlRoot:"/trees",

    initialize: function(){
        this.id = this.get("tree").id;
    }
});

var TreeView = Backbone.View.extend({

    events: {
        "click .btn.act-edit": "clickEdit",
        "click .btn.act-cancel": "clickCancel",
        "click .btn.act-save": "clickSave",

        "click .btn.node-modify": "clickNodeModify",

        "keydown .tree" : "editHandler",
    },

    initialize: function(){
        this.EditList = {};
        this.VisList = {};
    },

    editHandler: function(e){
        //var esc = e.which === 27;
        //var ret = e.which === 13;
        var tree_elem = $(e.target).parent();
        //Mark tree-elem as edited
        this.EditList[tree_elem.data("id")] = true;
        //Show user it has changed
        tree_elem.children("span.label:first-child").text("edited");
        console.log(e.target.nodeName);
    },

    NodeGetChild: function(target){
        var np =  Number($(target).parent().parent().data("id"));
        return [ 2*np+1, 2*np+2 ];
    },

    NodeVisToggle : function(e) {
        //TODO: Provide data-pid in child nodes for jquery selection generation
        var vis;
        var c = this.NodeGetChild(e.target);
        var sel_c0 = $("div.tree-elem[data-id="+c[0]+"]");
        var sel_c1 = $("div.tree-elem[data-id="+c[1]+"]");
        sel_c0.toggleClass("tree-elem-empty");
        sel_c1.toggleClass("tree-elem-empty");
        vis = !sel_c0.hasClass("tree-elem-empty");
        this.VisList[c[0]] = vis;
        this.VisList[c[1]] = vis;
        sel_c0.children(".node-head, .node-desc").attr("contenteditable", vis);
        sel_c1.children(".node-head, .node-desc").attr("contenteditable", vis);
        //TODO: Toggle +/- button on children
        console.log("NodeVisToggle " + c);
        return vis;
    },

    clickNodeModify : function(e) {
        var vis = this.NodeVisToggle(e);
        $(e.target).button( vis ? 'rem':'add');
    },

    clickEdit : function(e){
        this.$(".btn.act-edit").addClass("disabled");
        this.$(".btn.act-save").addClass("disabled");

        this.$(".tree").addClass("well");
        this.$(".node-head, .node-desc").attr("contenteditable", true);

        this.$(".on-edit").show();
    },

    clickCancel: function(e){
        this.$(".btn.act-edit").removeClass("disabled");
        this.$(".btn.act-cancel").addClass("disabled");

        this.$(".tree").removeClass("well");
        this.$(".node-head, .node-desc").attr("contenteditable", false);

        this.$(".on-edit").hide();

        //TODO: 1. Revert changed node-* based on EditList
    },

    clickSave: function(e){
        this.$(".btn.act-edit").removeClass("disabled");
        this.$(".btn.act-cancel").addClass("disabled");
        this.$(".btn.act-save").addClass("disabled");

        this.$(".tree").removeClass("well");
        this.$(".node-head, .node-desc").attr("contenteditable", false);

        this.$(".on-edit").hide();

    }


});
