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
            head:"Example bisection (Edit to create your own)",
            desc:"Provide an overview of the scenario being bisected."
        },

        n0:
        {
            id:0,
            head:"Ask the first question here",
            regex:"first-regex",
            desc:"If answer is yes (or 'first-regex' matches) the next bisection lies to the left otherwise to right.",
        },

        n1:
        {
            id:1,
            head:"Answer is Yes: Ask follow-up question?",
            regex:"test-regex-1",
            desc:"Provide a description of the current state.",
        },

        n2:
        {
            id:2,
            head:"Answer is No: Ask follow-up question?",
            regex:"test-regex-2",
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

function _ScrollTo(to){
    var to_pos = $(to).offset().top;
    var hb_sel = $('html, body');
    return function(){
        hb_sel.animate({scrollTop:to_pos},400,"swing");
        return false;
    };
};

var BisectRouter = Backbone.Router.extend({

});

var TreeModel = Backbone.Model.extend({

    urlRoot:"/tree/",

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
        var regex = elem.children(".node-regex").html();
        var node = { "id" : id, "head": head, "regex": regex, "desc": desc };
        return node;
    },

    GetNodeChild: function(target){
        var np =  Number(target.parent().parent().data("id"));
        if(isNaN(np)) throw "NaN";
        return [ 2*np+1, 2*np+2 ];
    },

    toggleNodeVis : function(e) {
        var vis;
        var sel_c0 = $("div[data-id="+e+"]");
        sel_c0.toggleClass("tree-elem-empty");
        vis = !sel_c0.hasClass("tree-elem-empty");
        this.VisList[e] = vis;
        sel_c0.children(".node-head, .node-regex, .node-desc")
            .attr("contenteditable", vis);
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
        this.$el.bind("bisect", _.bind(this._BisectPost, this));
        this.tmpl_tlist = Handlebars.compile($("#tmpl-tlist").html());
        this.tmpl_telem = Handlebars.compile($("#tmpl-telem").html());
        this.render();
    },

    render: function(){
        this.$el.html(this.tmpl_tlist(this.model.attributes));
        return this;
    },

    _BisectUpdate: function(data, status, jqXHR){
        var tsel = ".tree-elem[data-id|="+this.id+"]";
        this.view.$(tsel).html(this.view.tmpl_telem(data));
        console.log("POST success");
    },

    _BisectPost: function(event, data){
        console.log(data.log_text.length+" bytes read");
        _.each(this.model.attributes.tlist, function(e,i,a){
            jQuery.ajax({url: "/bisect/"+e.id,
                         type: "POST",
                         data: data.log_text,
                         success: this._BisectUpdate,
                         dataType: "json",
                         view: this,
                         id: e.id});
        }, this);
    },

});

var DnDView = Backbone.View.extend({
    initialize: function () {
        this.$el.bind("dragover", _.bind(this._dragOverEvent, this));
        this.$el.bind("dragenter", _.bind(this._dragEnterEvent, this));
        this.$el.bind("dragleave", _.bind(this._dragLeaveEvent, this));
        this.$el.bind("drop", _.bind(this._dropEvent, this));
        this._draghoverClassAdded = false;
    },

    _dragOverEvent: function (e) {
        if (e.originalEvent) e = e.originalEvent;
        var data = this._getCurrentDragData(e);
        if (this.dragOver(data, e.dataTransfer, e) !== false) {
            if (e.preventDefault) e.preventDefault();
            e.dataTransfer.dropEffect = 'copy'; // default
        }
    },

    _dragEnterEvent: function (e) {
        if (e.originalEvent) e = e.originalEvent;
        if (e.preventDefault) e.preventDefault();
    },

    _dragLeaveEvent: function (e) {
        if (e.originalEvent) e = e.originalEvent;
        var data = this._getCurrentDragData(e);
        this.dragLeave(data, e.dataTransfer, e);
    },

    _dropEvent: function (e) {
        if (e.originalEvent) e = e.originalEvent;
        var data = this._getCurrentDragData(e);
        if (e.preventDefault) e.preventDefault();
        // stops the browser from redirecting
        if (e.stopPropagation) e.stopPropagation();

        if (this._draghoverClassAdded) this.$el.removeClass("draghover");

        this.drop(data, e.dataTransfer, e);
    },

    _getCurrentDragData: function (e) {
        var data = null;
        if (window._backboneDragDropObject)
            data = window._backboneDragDropObject;
        return data;
    },

    dragOver: function (data, dataTransfer, e) {
        // optionally override me and set dataTransfer.dropEffect,
        // return false if the data is not droppable
        this.$el.addClass("draghover");
        this._draghoverClassAdded = true;
    },

    dragLeave: function (data, dataTransfer, e) {
        // optionally override me
        if (this._draghoverClassAdded) this.$el.removeClass("draghover");
    },

    // overide me! if the draggable class returned some data on
    // 'dragStart' it will be the first argument
    drop: function (data, dataTransfer, e) {
        var reader = new FileReader();
        reader.onloadend = (this.fileloadend)(this);

        console.log("dropped");

        if (dataTransfer.files.length >= 1)
            reader.readAsText(dataTransfer.files[0]);
        else
            console.log("no files selected");
    },

    fileloadend: function(view){
        return function(e){
            if(e.target.readyState == FileReader.DONE)
                view.$el.trigger("bisect", {log_text:e.target.result});
            else
                console.log("read error");
        };
    },

});
