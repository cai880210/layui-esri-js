define([	"dojo/dom", 
	"dojo/dom-class","dojo/dom-style","dojo/aspect","dojo/window","dojo/_base/fx","dojo/Deferred",
	"dojo/_base/declare","dojo/_base/lang","dojo/Evented", "dijit/Dialog","dijit/DialogUnderlay", "dojo/text!./templates/Dialog.html", 			
	 "dijit/layout/ContentPane"
], function(dom, domClass,domStyle,aspect,winUtils,fx,Deferred,declare,lang,Evented, Dialog,DialogUnderlay, template,ContentPane){
		var resolvedDeferred = new Deferred();
		resolvedDeferred.resolve(true);
		function nop(){}
	 var Dialog = declare([Dialog,Evented], {
		open:false,
		tabs:null,
		tabContainer:null,
		templateString: template,
		constructor: function(props, node){
			this.inherited(arguments);
		},
    postCreate: function () {
        this.inherited(arguments);
	      domStyle.set(this.domNode, {
					display: "block",
					position: "absolute"
				});
        this._modalconnects =[];         
    },
		startup:function(){			
			this.inherited(arguments);	
		},
		_setup: function(){
			this.inherited(arguments);
		},
		onLoad:function(){
			this.inherited(arguments);
		},
		show:function(){
			debugger;
			if(this.open){
				return resolvedDeferred.promise;
			}

			if(!this._started){
				this.startup();
			}

			// first time we show the dialog, there's some initialization stuff to do
			if(!this._alreadyInitialized){
				this._setup();
				this._alreadyInitialized = true;
			}

			if(this._fadeOutDeferred){
				this._fadeOutDeferred.cancel();
			}

			var win = winUtils.get(this.ownerDocument);
			//this._modalconnects.push(on(win, "scroll", lang.hitch(this, "resize", null)));

			//this._modalconnects.push(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));

			domStyle.set(this.domNode, {
				opacity: 0,
				display: ""
			});

			this._set("open", true);
			this._onShow(); // lazy load trigger

			//this.resize();
			//this._position();

			// fade-in Animation object, setup below
			var fadeIn;

			this._fadeInDeferred = new Deferred(lang.hitch(this, function(){
				fadeIn.stop();
				delete this._fadeInDeferred;
			}));
			this._fadeInDeferred.then(undefined, nop);	// avoid spurious CancelError message to console

			// If delay is 0, code below will delete this._fadeInDeferred instantly, so grab promise while we can.
			var promise = this._fadeInDeferred.promise;

			fadeIn = fx.fadeIn({
				node: this.domNode,
				duration: this.duration,
				beforeBegin: lang.hitch(this, function(){
				//	DialogLevelManager.show(this, this.underlayAttrs);
				}),
				onEnd: lang.hitch(this, function(){

					this._fadeInDeferred.resolve(true);
					delete this._fadeInDeferred;
				})
			}).play();

			return promise;
		},
		destroy:function(){
			this.inherited(arguments);	
		},
		resize: function(dim){
			this.inherited(arguments);	
		},
		_position:function(){
			this.inherited(arguments);	
		},
		_onShow:function(){
			this.inherited(arguments);	
		},
		focus:function(){
			this.inherited(arguments);	
		}
	});
	return Dialog;
});

