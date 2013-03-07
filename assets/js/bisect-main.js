
"use strict";

var mytree;

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
    mytree = new TreeView({el:"#t-tmpl-r3-test"});
    //render_ntree("#t-tmpl-n3-test", datac);
    //render_rtree("#t-tmpl-r31-test", datac);
});

var TreeModel = Backbone.Model.extend({

});

var TreeView = Backbone.View.extend({

    events: {
        "click .btn.act-edit": "clickEdit",
        "click .btn.act-cancel": "clickCancel",
        "click .btn.act-save": "clickSave",
    },

    initialize: function(){

    },

    clickEdit : function(e){
        this.$(".btn.act-edit").addClass("disabled");
        this.$(".btn.act-save").addClass("disabled");

        this.$(".tree")
            .attr("contenteditable", true)
            .addClass("well well-small");

        this.$(".on-edit")
            .show();
    },

    clickCancel: function(e){
        this.$(".btn.act-edit").removeClass("disabled");
        this.$(".btn.act-cancel").addClass("disabled");

        this.$(".tree")
            .attr("contenteditable", false)
            .removeClass("well well-small");

        this.$(".on-edit")
            .hide();

    },

    clickSave: function(e){
        this.$(".btn.act-edit").removeClass("disabled");
        this.$(".btn.act-cancel").addClass("disabled");
        this.$(".btn.act-save").addClass("disabled");

        this.$(".tree")
            .attr("contenteditable", false)
            .removeClass("well well-small");

        this.$(".on-edit")
            .hide();

    }
});
