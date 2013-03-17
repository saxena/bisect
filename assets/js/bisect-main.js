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

//render_ntree("#t-tmpl-n3-test", datac);
function render_ntree(id, t){
    var tmpl_ntree = Handlebars.compile($("#tmpl-ntree").html());
    $(id).append(tmpl_ntree(t));
}

jQuery(document).ready(function(){
    mytreemodel = new TreeModel(datat);
    mytreeview = new TreeView({el:"#t-tmpl-r3-test", model: mytreemodel});

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
        this.tmpl_tree = Handlebars.compile($("#tmpl-tree").html());
        //this.tmpl_node = Handlebars.compile($("#tmpl-node").html());
        this.EditList = {};
        this.VisList = {};

        this.render();
    },

    render: function(){
        this.$el.html(this.tmpl_tree(this.model.attributes));
        return this;
    },

    render_node: function(node){

    },

    editHandler: function(e){
        //var esc = e.which === 27;
        //var ret = e.which === 13;
        var tree_elem = $(e.target).parent();
        var id = tree_elem.data("id");
        //Mark tree-elem as edited
        this.EditList[id] = true;
        //Show user it has changed
        tree_elem.children("span.label:first-child").text("edited");
        console.log("EditNode :"+id);
    },

    NodeGetChild: function(target){
        var np =  Number(target.parent().parent().data("id"));
        if(isNaN(np)) throw "NaN";
        return [ 2*np+1, 2*np+2 ];
    },

    NodeVisToggle : function(e) {
        //TODO: Provide data-pid in child nodes for jquery selection generation
        var vis;
        var sel_c0 = $("div.tree-elem[data-id="+e+"]");
        sel_c0.toggleClass("tree-elem-empty");
        vis = !sel_c0.hasClass("tree-elem-empty");
        this.VisList[e] = vis;
        sel_c0.children(".node-head, .node-desc").attr("contenteditable", vis);
        return vis;
    },

    clickNodeModify : function(e) {
        var tgt_sel = $(e.currentTarget);
        var nodes = this.NodeGetChild(tgt_sel);
        var vis = _.map(nodes, this.NodeVisToggle, this);
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
        delete this.VisList;
        delete this.EditList;
    },

    clickSave: function(e){
        this.toggleToolbar();
        this.toggleTreeEdit(false);

      if(!_.every(this.EditList,_.identity))
            console.log("false in EditList: ");

        console.log(this.VisList);
        console.log(this.EditList);

        _.each(this.VisList, function(v,k){
            if(_.has(this.EditList, k)) delete this.EditList[k];
            if(v){
                console.log("set node :"+k)
                //this.model.set(this.elem2node(k), {silent:true});
            }else{
                console.log("del node :"+k)
                //this.model.unset(k, {silent:true});
            }
        }, this);

        console.log(this.EditList);

        _.each(this.EditList, function(v,k){
            console.log("set node :"+k)
            //this.model.set(this.elem2node(k), {silent:true});
        }, this);

        delete this.VisList;
        delete this.EditList;
    }

});
