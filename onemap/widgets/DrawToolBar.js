﻿define(["dojo/dom-attr","dojo/dom-construct","dojo/_base/declare", "dojo/string", "dojo/dom-class", "dojo/_base/kernel", "dojo/query", "dojo/_base/array", "dojo/_base/lang", 
"dijit/_Widget", "dijit/_Templated", "esri/toolbars/draw", "dojo/on","esri/symbols/SimpleFillSymbol",
"esri/layers/GraphicsLayer","esri/graphic", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","dojo/text!./templates/DrawToolBar.html", "dojo/NodeList-dom", "dojo/domReady!"],
function (domAttr,domConstruct,declare, string,domClass, kernel, query, array, lang, _Widget, _Templated, Draw, on,SimpleFillSymbol,
	GraphicsLayer,Graphic,SimpleMarkerSymbol,SimpleLineSymbol, template) {
   return declare([_Widget, _Templated], {
        _listHtml: "",
        templateString: template,
        _NodeList:[],
        _ClickList:[],
        _listPara: [],
        _enabled: !0,
        _drawType: null,
        _baseClass:null,
        _drawTool: null,
        _map: null,
        _handler: null,
        _node: null,
        _domId: null,
        _drawEndMethod:null,
       constructor: function (options, srcRefNode) {
       	
            this._listPara = options.drawObjs;
            this._map = options.map;
            this._DomID = srcRefNode;
            this._callback = options.callback;
            this._markLayer = options.markLayer|| new GraphicsLayer();
//          this._baseClass = options.baseClass;
            this.ulClz = options.class;
            this._drawTool = new Draw(this._map);
        },
       postCreate: function () {
            //this.deactivate();
            this.inherited(arguments);
            this._renderHtml();
       },
        startup: function () {
            this.inherited(arguments);
            this._map.addLayer(this._markLayer);
            //this._drawList.innerHTML = '<ul class="boxinfo">'+this._NodeList.join("") + '</ul>';
            //domClass.add(this.domNode, this._baseClass);
            //this._uiConnect();
        },
        _markGraphic:function(evt){
          /*
           * 构建地图的图形及渲染
           * */
	  		  var symbol;
          switch (evt.geometry.type) {
            case "point":
            	symbol = new SimpleMarkerSymbol({
							  "color": [255,255,255,64],
							  "size": 12,
							  "type": "esriSMS",
							  "style": "esriSMSCircle",
							  "outline": {
							    "color": [0,0,0,255],
							    "width": 1,
							    "type": "esriSLS",
							    "style": "esriSLSSolid"
							  }
							});
              break;
            case "multipoint":
              symbol = new SimpleMarkerSymbol({
							  "color": [255,255,255,64],
							  "size": 12,
							  "type": "esriSMS",
							  "style": "esriSMSCircle",
							  "outline": {
							    "color": [0,0,0,255],
							    "width": 1,
							    "type": "esriSLS",
							    "style": "esriSLSSolid"
							  }
							});
              break;
            case "polyline":
              symbol = new SimpleLineSymbol();
              break;
            default:
              symbol = new SimpleFillSymbol({
							  "type": "esriSFS",
							  "style": "esriSFSSolid",
							  "color": [255,255,255,64],
							    "outline": {
						      "type": "esriSLS",
							    "style": "esriSLSSolid",
							    "color": [0,0,0,255],
							    "width": 2
							  }
							});
              break;
          }
          var graphic = new Graphic(evt.geometry, symbol);
          this._markLayer.add(graphic);
	  	},
      setEnabled: function (a) {
          this._enabled = a;
      },
      _drawEnd:function(c){
          this.inherited(arguments);
          this._drawEndMethod && this._drawEndMethod.apply(this, [c]);
      },
      _renderHtml:function(){
      	  var ul = domConstruct.create("ul",{"class":this.ulClz},this._drawList);
          dojo.forEach(this._listPara,lang.hitch(this, function (para) {
          	this.createItem(para,ul);
              //this._NodeList.push(lang.replace("\x3cli  class\x3d'{type}' type='{type}' \x3e\x3ci class\x3d'ace-icon fa {iconName} bigger-100' style\x3d'margin-right: 6px;'\x3e\x3c/i\x3e\x3cspan\x3e{alias}\x3c/span\x3e \x3c/li\x3e", para));
          }));            
      },
      createItem:function(item,srcNodeRef){
	
	      var li = domConstruct.create("li",{"id":"li_draw_"+item.id,"class":item.class},srcNodeRef);
	      if(item.subData){
	      	item.html = lang.replace(item.html,item.subData);
	      }
	      var aOpt = {
	      	"innerHTML":item.html
	      	}
	      if(item.type =="clear"){
	      	aOpt["onclick"]=lang.hitch(this,this.clear);
	      }else{
	      	aOpt["onclick"]=lang.hitch(this,this._startDraw,item.type,null)
	      }
	      var a = domConstruct.create("a",aOpt,li);
	      
	      return li;
	    },
      _startDraw: function (type,callback,e) {   
      		this._drawTool.deactivate();
          console.log(type);
          this._drawTool.activate(type);
          this._map.setMapCursor("crosshair");
          this._drawTool.on("draw-end",lang.hitch(this,function(evt){
          	console.log(evt);
          	this._map.setMapCursor("default");
          	this._drawTool.deactivate();
          	this._markGraphic(evt);
          	callback && callback.apply(this,[evt]);
          }));
      },
      clear:function(){
      	this._drawTool.deactivate();
      	this._markLayer.clear();
      },
      deactivate:function(){
      	this._drawTool.deactivate();
      },
      _uiConnect: function () {
          dojo.forEach(this._ClickList, dojo.disconnect);
          dojo.connect(this._domClear,"onclick",lang.hitch(this,function(evt){
          	this.clear();
          }));
          //dojo.query("#"+this._DomID + " ul li").forEach(function (a) {
          dojo.query("ul li",this._drawList).forEach(function (a) {
          	console.log(a);
              //this._ClickList.push(dojo.connect(a, "onclick", lang.hitch(this, "_startDraw", para.geoType, para.opr)));
              this._ClickList.push(dojo.connect(a, "onclick", lang.hitch(this, "_startDraw", a, this._callback)))
          }, this);
      },
      _updateUI: function () {
          this.setEnabled(1);
          this._enabled && this._node && (dojo.hasClass(this._node, "drawSelect")) && (dojo.removeClass(this._node, "drawSelect"));
          //(!this._enabled) && this._node && (!dojo.hasClass(this._node, "drawSelect") && (dojo.removeClass(this._node, "drawSelect")));
      }
    });
});