define(["dojo/_base/declare", "dojo/dom-class", "dojo/_base/kernel",  "dojo/_base/array", "dojo/_base/lang"], 
function (declare, domClass, kernel, query, array, lang) {
    return declare([Edit], {
        _subclass:"",
        constructor: function (options, srcNoderef) {
          //lang.mixin(this,options);
          //this._resetable = options.resetable;
          domClass.add(this.domNode, this._subclass);   
        },
        postCreate: function () {
            this.inherited(arguments);                
        },
        activate: function () {
            this.inherited(arguments);            
        },
        deactivate:function(a,b){
        	this.inherited(arguments);
        },
        refresh:function(){
        	
        }
    });
});