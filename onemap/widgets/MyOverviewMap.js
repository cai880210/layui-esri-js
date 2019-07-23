define(["dojo/dom-attr","dojo/_base/declare","dojo/_base/Color", "dojo/string", "dojo/has",'onemap/widgets/ProjectLayer',
"esri/domUtils", "esri/map",'dojo/topic',"dojo/dom-construct", "esri/layers/ArcGISDynamicMapServiceLayer","esri/layers/ArcGISTiledMapServiceLayer",
"esri/dijit/_EventedWidget", "dojo/dom-class", "dojo/_base/kernel","dojo/query", "dojo/dom-style","dojo/_base/connect",
"dojo/_base/array", "dojo/_base/lang","dijit/_Widget", "dijit/_Templated","dojo/on", "dojo/_base/html", 
"dojo/text!./templates/MyOverviewMap.html", "dojo/NodeList-dom", "dojo/domReady!"],
function (domAttr,declare,Color, string,has,ProjectLayer,domUtils,Map,topic,domConstruct,ArcGISDynamicMapServiceLayer,ArcGISTiledMapServiceLayer,_EventedWidget,	domClass,
	kernel, query,domStyle,connect, array, lang, _Widget,_Templated, on,html,template) {
    return declare([_EventedWidget,_Widget, _Templated], {
  		templateString: template,
  		ovwOne:null,
  		ovwTwo:null,
  		zoom:null,
  		_focusExtent :null,
  		multiLoad:null,
 	    constructor: function (a, b) {
				this.inherited(arguments);
				    //l.mixin(this, F.widgets.overviewMap);
            a = a || {};
            if (a.map) {
                var e = {};
                b && (this._detached = !0, e = html.coords(b, !0));
                this.map = a.map;
                this.zoom = this.map.getZoom();
                this.baseUrl = a.baseUrl;
                this.projectOpt = (a.hasOwnProperty("projectOpt")) ? a.projectOpt :null;
                this.baseLayer = a.baseLayer;
                this.width =parseFloat(this.map.width / 2);
                this.height = a.height || e.h || this.map.height;
                this.attachTo = a.attachTo || "top-right";
                this.expandFactor = a.expandFactor || 2;
                this.color = a.color || "#000000";
                this.opacity = a.opacity || 0.5;
                this.maximizeButton = !!a.maximizeButton;
                this.visible = !!a.visible;
                this.multiLoad = (a.hasOwnProperty("multiLoad")) ? a.multiLoad :null;
                console.log(a.hasOwnProperty("multiLoad"));
                if (this.map.loaded) this._initialSetup();
                else var h = connect.connect(this.map, "onLoad", this,
                function() {
                    connect.disconnect(h);
                    h = null;
                    this._initialSetup()
                });
                this._detached && (this.visible = !0);
                this._maximized = !1
            } else console.error("esri.dijit.OverviewMap: no map")
      },
      postCreate: function () {
          //this.deactivate();
          this.inherited(arguments);
      },
      startup: function () {
				this.inherited(arguments);
				this.i = 0;
				this._suspendPanHandling = 0;
				this._ovwOneHandle = 0;
				this.zoomHandle =0;
				this.oneZoomHandle =0;
				debugger;
				console.log(this.map);
		    (!this.domNode.parentNode || 9 > has("ie") 
		    && "DIV" !== this.domNode.parentNode.nodeName) 
		    && this.map.container.appendChild(this.domNode);
		    this._ovwMapContainer = domConstruct.create("div",null,this.map.container.parentNode);		

//      this._detached ? (domStyle.set(this._body, "display", "block"), domStyle.set(this._controllerDiv, "display", "none"),
//      this.map.loaded ? this._initialize() :connect.connect(this.map, "onLoad", this, this._initialize)) 
//      : ("bottom" === this.attachTo.split("-")[0] ,  domClass.add(this.domNode, {
//          "top-left": "ovwTL",
//          "top-right": "ovwTR",
//          "bottom-left": "ovwBL",
//          "bottom-right": "ovwBR"
//      } [this.attachTo]), domClass.add(this._controllerDiv, "ovwShow"), this.visible && this.map.loaded && (this.visible = !1, this.show()));
        //domStyle.set(this._focusDiv, "opacity", this.opacity)
        connect.connect(this._doubleScreen,"click",lang.hitch(this,function(e){
        	console.log(e); 
        	console.log(this.map);
		      var obj ={		      	
		      		"width":this.width+'px',
		      		"height":this.height+'px'	      	
		      };		      
		      domConstruct.empty(this._ovwMapContainer);
			    domStyle.set(this._ovwMapContainer,{
				    "position": "absolute",
				    "right": '0px',
				    "left":this.width +'px'
				  });
				  domStyle.set(this.map.container, "right",this.width +'px');
		      this.ovwOne = this.createOneMap(obj);

          connect.connect(this.ovwOne, "onLoad", this,function(thisMap) {
            this._activate();
              //
            var interval = setInterval(lang.hitch(this,function(){
							
							var chNode =query(".sidebar ul" ,thisMap.container);
							console.log(chNode);
					    if(chNode.length > 0){
					    	this.multiLoad();
//					    	layerui.closeAll('loading');
//								element.init();
//								element.render('collapse');
								console.log(this.multiLoad)
				        clearInterval(interval);		        
				        console.log("element.init()");
				        return;
					    }
						}), 2000);
          });
        }));
        connect.connect(this._tripleScreen,"click",lang.hitch(this,function(e){
        	if(this.ovwOne){
        		this.ovwOne.destroy();
        	}
		      domConstruct.empty(this._ovwMapContainer);
			    domStyle.set(this._ovwMapContainer,{
				    "position": "absolute",
				    "right": '0px',
				    "left":this.width +'px'
				  });
		      var obj ={		      	
		      		"width":this.width+'px',
		      		"height":this.height/2+'px'	      	
		      };
		      domStyle.set(this.map.container, "right",this.width +'px');
		      this.ovwOne = this.createOneMap(Object.assign(obj, {"position":"absolute","top":"0"}));

		      this.ovwTwo = this.createOneMap(Object.assign(obj, {"position":"absolute","top":this.height/2+'px'}));

		      connect.connect(this.ovwTwo, "onLoad", this,function(thisMap) {
              this._activate();
            var interval = setInterval(lang.hitch(this,function(){
							console.log("element----test",thisMap);
							var chNode =query(".sidebar ul" ,thisMap.container);
							console.log(chNode);
					    if(chNode.length > 0){
					    	this.multiLoad();
//					    	layerui.closeAll('loading');
//								element.init();
//								element.render('collapse');
				        clearInterval(interval);		        
				        console.log("element.init()");
				        return;
					    }
						}), 2000);
          });
        }));
        connect.connect(this._EscScreen,"click",lang.hitch(this,this.escScreen));
      },
      destroy: function() {
					this._destroy();
					domConstruct.empty(this._ovwMapContainer);
          this.inherited(arguments)
      },
      setMultiLoad:function(fun){
      	fun&&(this.multiLoad = fun);
      },
			escScreen:function(){
				   this.hide();
        	domStyle.set(this.map.container, "right",'0px');
        	domStyle.set(this._ovwMapContainer,{
				    "position": "absolute",
				    "right": '0px',
				    "left":2*this.width +'px'
				  });
			},
      _destroy:function(){       
          this.ovwOne && this.ovwOne.destroy();
          this.ovwTwo && this.ovwTwo.destroy();
          this.ovwOne = this.ovwTwo = null;
      },
		  _visibilityHandler: function() {
          this.visible ? this.hide() : this.show()
      },
      show: function() {
          if (!this.visible) {
              var a = this._controllerDiv;
              a.title = "显示分屏";
              domClass.remove(a, "ovwShow");
              domClass.add(a, "ovwHide");
              domUtils.show(this._body);
              this._initialize();
              this.visible = !0
          }
      },      
      hide: function() {
          if (this.visible) {
//            var a = this._controllerDiv;
//            a.title = "关闭分屏";
//            domClass.remove(a, "ovwHide");
//            domClass.add(a, "ovwShow");
//            domUtils.hide(this._body);
//            this._deactivate();
              this._destroy();
              this.visible = !1
          }
          domConstruct.empty(this._ovwMapContainer);
      },
      createOneMap:function(obj){
      	console.log(obj);
				var mapContainDiv = domConstruct.create("div",null,this._ovwMapContainer);				
				if(obj){
					domStyle.set(mapContainDiv,obj);
				}				
				var thisMap = new Map(mapContainDiv,{
					slider: !1,
					logo: !1,
					center: [118.0740,24.50542],
        	zoom: 12
				});
				thisMap.setZoom(this.zoom);
				var opt = {};
	    	lang.mixin(opt,this.projectOpt);
	    	opt.map =thisMap;
	    	
	    	if(this.projectOpt){
	    		var toolbarDiv = domConstruct.create("div",{"class":"layui-tab layui-tab-brief tools-warp","style":{"left":"5px","width":"350px"}},mapContainDiv);
	    	
		    	var ul = domConstruct.create("ul",{"class":"layui-tab-title"},toolbarDiv);
		    	var layerCtrl = domConstruct.create("div",null,toolbarDiv);
  				thisMap.projectLayerlist = new ProjectLayer(opt,layerCtrl);		
    			thisMap.projectLayerlist.startup();
		    	var li = domConstruct.create("li",{"style":{"padding":"0px","width":"350px"},"innerHTML":'<a content="layerList" class="nav-link"><i class="mdi mdi-printer"></i><span>图层</span></a>',
			    	"class":"nav-item layerList",
			    	"onclick":lang.hitch(this,function(evt){
			    		if(thisMap.projectLayerlist&&this.projectOpt){
			    			var visiulable = domStyle.get(thisMap.projectLayerlist.domNode,"display");
			    			if(visiulable =="none"){
			    				domStyle.set(thisMap.projectLayerlist.domNode,{"display":"block"});
			    			}else{
			    				domStyle.set(thisMap.projectLayerlist.domNode,{"display":"none"});
			    			}
			    		}else if(this.projectOpt){
			    			thisMap.projectLayerlist = new ProjectLayer(opt,layerCtrl);		
			    			thisMap.projectLayerlist.startup();
			    		}	
			    	})
		    	},ul);
	    	}
				//thisMap = lang.mixin(thisMap,this.map);
        var a = new ArcGISTiledMapServiceLayer(this.baseUrl);
        thisMap.addLayer(a);
				return thisMap;
			},
      _initialSetup: function() {

      },
      _initialize: function() {
          if (this.overviewMap) this._activate();
          else {
          	console.log("aaaaaaaa");
          }
      },
      _activate: function() {
          var a = this.map,
          b = this.ovwOne,
          c = this.ovwTwo;
          on(a, "zoom-end", lang.hitch(this, this._mapZoomsync));
          this._soeConnect = on(a, "extent-change", lang.hitch(this, this._syncOvwMap));
          this._ufoConnect = on(a, "mouse-drag-end",lang.hitch(this,this._updatesync));
          if(b){
          	this._oneConnect = on(b, "extent-change", lang.hitch(this, this._ovwExtentChangeHandler));
          	this._onedrConnect = on(b, "mouse-drag-end", lang.hitch(this,this._ovwPanHandler));
          	on(b, "zoom-end", lang.hitch(this,this._ovwZoomHandler));
          }          
          if(c){
          	this._twoConnect = on(c, "extent-change", lang.hitch(this, this._ovwExtentChangeHandler));
          	this._twodrConnect = on(c, "mouse-drag-end", lang.hitch(this,this._ovwPanHandler));  
          	on(c,"zoom-end", lang.hitch(this,this._ovwZoomHandler));
          }
          
          //this._syncOverviewMap(a.extent, null, null, null)
      },
      _deactivate: function() {

      },
      _syncOvwMap: function(a, b, e, c) { 
					console.log("a-extent");
					var pt = a.extent.getCenter();
         if(this._suspendPanHandling){
						this._ovwOneHandle = 0 ;
	       }else{
	        	if(this.ovwOne){
	        		//this.ovwOne.centerAt(pt);
	        		//this.ovwOne.setZoom(this.zoom);
	        		this.ovwOne.centerAndZoom(pt, this.zoom)
	        	}
	        	if(this.ovwTwo){
	        		//this.ovwTwo.centerAt(pt);
	        		//this.ovwTwo.setZoom(this.zoom);
	        		this.ovwTwo.centerAndZoom(pt, this.zoom);
	        	}
	        	this._suspendPanHandling ++;
        	} 					
       },
        _ovwExtentChangeHandler: function(a) {
          console.log("c-extent");
        	if(this._focusExtent == "ovwMap"&&this._ovwOneHandle ==0){
        		var pt = a.extent.getCenter();
        		//this.map.centerAt(pt);
        		//this.map.setZoom(this.zoom);
        		this.map.centerAndZoom(pt, this.zoom)
        	}
        	this._ovwOneHandle ++;        	
        },
        _ovwPanHandler: function(a, b) {      
          console.log("c-drag")
        	this._focusExtent = "ovwMap";
        	this._suspendPanHandling = 0;
        	this._ovwOneHandle =0;
        },
        _ovwZoomHandler: function(a, b) {  
          this.zoom=a.level;
          console.log("c-zoom")
          this._focusExtent = "ovwMap";
          this._suspendPanHandling = 0;
          this._ovwOneHandle =0;
        },
        _mapZoomsync:function(a,b){
          console.log("a--zoom");
          this.zoom = a.level;
          this._focusExtent = "thismap";
          this._suspendPanHandling = 0;
          this._ovwOneHandle =0;
        },
        _updatesync:function(a,b){
          console.log("a--drag");
        	this._focusExtent = "thismap";
        	this._suspendPanHandling = 0;
        	this._ovwOneHandle =0;
        }
  });
});