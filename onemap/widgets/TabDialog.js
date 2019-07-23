define([	"dojo/dom", 
	"dojo/dom-class","dojo/dom-style","dojo/aspect","dojo/window","dojo/_base/fx","dojo/Deferred",
	"dojo/_base/declare","dojo/_base/lang","dojo/Evented", "dijit/Dialog","dijit/DialogUnderlay", "dojo/text!./templates/TabDialog.html", 			
	 "dijit/layout/TabContainer",
	 "dijit/layout/ContentPane"
], function(dom, domClass,domStyle,aspect,winUtils,fx,Deferred,declare,lang,Evented, Dialog,DialogUnderlay, template,TabContainer,ContentPane){
		var resolvedDeferred = new Deferred();
		resolvedDeferred.resolve(true);
		function nop(){}
	 var TabDialog = declare([Dialog,Evented], {
		open:false,
		tabs:null,
		tabheight:"400px", //默认高度400px
		tabContainer:null,
		templateString: template,
		constructor: function(props, node){
			this.inherited(arguments);
			this.tabs = (props.hasOwnProperty("tabs")) ? props.tabs : [];
		},
    postCreate: function () {
        this.inherited(arguments);
	      domStyle.set(this.domNode, {
					display: "block",
					position: "absolute"
				});
        this._modalconnects =[];
        this._show();                       
    },
		startup:function(){			
			this.inherited(arguments);			
		},
		_setup: function(){
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
		},
		_show:function(){
			this.tabContainer = new TabContainer({style: "height: "+this.tabheight+"; width: 100%;"},this.tabContainerDiv);
			if(this.tabs.length > 0){
				for(var i=0;i<this.tabs.length;i++){
					this.addTab(this.tabs[i]);
				}				
			}			
			this.tabContainer.startup();			
			//dojo.place(this.tabContainer,this.tabContainerDiv);			
		},
		addTab:function(tab){
			//		sample:  var tab ={
			//	         title: "项目信息",
			//	         content: content1
			//	    }
		    var tabNode = new ContentPane(tab);
	    	this.tabContainer.addChild(tabNode);
		}
	});
	return TabDialog;
});

