define(["dijit/layout/ContentPane", "dojo/_base/declare","dojo/dom-construct", "dojo/dom-class", "dojo/_base/kernel", "dojo/query", "dojo/_base/array", "dojo/_base/lang"], 
function (ContentPane,declare,domConstruct,  domClass, kernel, query, array, lang) {
    return declare([ContentPane], {
        _subclass:"",
        btnList:null,
        constructor: function (options, srcNoderef) {
          lang.mixin(this,options);
          this.closeback = options.closeback;
          this.closeData = (options.hasOwnProperty("closeData")) ? options.closeData :"";
          this._subclass = (options.hasOwnProperty("subclass")) ? options.subclass :"";
        },
        postCreate: function () {
            this.inherited(arguments);
            domClass.add(this.domNode, this._subclass); 
            this.createBtn(this.closeback ,this.closeData);
        },
        startup: function () {
            this.inherited(arguments);
        },        
        createBtn:function(closeback,data){
        	this.btnList = domConstruct.create("ul",{'class':"cont-btns"},this.domNode);
		      var closeBtn = domConstruct.create("li",{
						"innerHTML":"<i class='mdi mdi-close'></i>关闭",
		        "onclick":lang.hitch(this,function(evt){
		          closeback&&closeback.apply(this,[data]);
		        })
		      },this.btnList);
        },
        addBtn:function(attrs){
          var closeBtn = domConstruct.create("li",attrs,this.btnList,"first");
        }
    });
});