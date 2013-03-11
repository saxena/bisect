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

        "click .btn.node-add": "clickNodeAdd",
        "click .btn.node-rem": "clickNodeDel"
    },

    initialize: function(){

    },

    clickNodeGetChild: function(sel){
        var np =  Number(sel.parent().parent().data("id"));
        return [ 2*np+1, 2*np+2 ];
    },

    clickNodeVisToggle : function(e) {
        var c = this.clickNodeGetChild($(e.target));
        var sel_c0 = $("div.tree-elem[data-id="+c[0]+"]");
        var sel_c1 = $("div.tree-elem[data-id="+c[1]+"]");
        sel_c0.toggleClass("tree-elem-empty");
        sel_c1.toggleClass("tree-elem-empty");
        console.log("NodeVisToggle " + c);
        //is visible
        return sel_c0.hasClass("tree-elem-empty") ? 0 : 1;


    },

    clickNodeAdd : function(e) {
        var vis = this.clickNodeVisToggle(e);
        $(e.target).button( vis ? 'rem':'add');
    },

    clickNodeDel : function(e) {
        this.clickNodeAdd(e);
    },

    clickEdit : function(e){
        this.$(".btn.act-edit").addClass("disabled");
        this.$(".btn.act-save").addClass("disabled");

        this.$(".tree")
            .attr("contenteditable", true)
            .addClass("well");

        this.$(".on-edit")
            .show();
    },

    clickCancel: function(e){
        this.$(".btn.act-edit").removeClass("disabled");
        this.$(".btn.act-cancel").addClass("disabled");

        this.$(".tree")
            .attr("contenteditable", false)
            .removeClass("well");

        this.$(".on-edit")
            .hide();

    },

    clickSave: function(e){
        this.$(".btn.act-edit").removeClass("disabled");
        this.$(".btn.act-cancel").addClass("disabled");
        this.$(".btn.act-save").addClass("disabled");

        this.$(".tree")
            .attr("contenteditable", false)
            .removeClass("well");

        this.$(".on-edit")
            .hide();

    }


});
