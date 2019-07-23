define(["esri/dijit/Popup", "dojo/_base/declare", "dojo/dom-class", "dojo/_base/kernel", "dojo/query", "dojo/_base/array", "dojo/_base/lang"], 
function (Popup,declare, domClass, kernel, query, array, lang) {
    return declare([Popup], {
        _subclass:"",
        constructor: function (options, srcNoderef) {
          //lang.mixin(this,options);
          //this._resetable = options.resetable;
          this._subclass = (options.hasOwnProperty("subclass")) ? options.subclass :"";
          domClass.add(this.domNode, this._subclass);   
        },
        postCreate: function () {
            this.inherited(arguments);                
        },
        startup: function () {
            this.inherited(arguments);            
        },
        show:function(a,b){
        	this.inherited(arguments);
        }
    });
});