define(["dojo/dom-attr","dojo/_base/declare","dojo/_base/Color", "dojo/string", "dojo/dom-class", "dojo/_base/kernel", 
"dojo/query", "dojo/_base/array", "dojo/_base/lang","dijit/_Widget", "dijit/_Templated", "esri/symbols/TextSymbol", "esri/symbols/Font",
"esri/toolbars/draw", "dojo/on","esri/symbols/SimpleFillSymbol","esri/layers/GraphicsLayer","esri/geometry/Point","esri/geometry/Polygon",
"esri/graphic", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/tasks/AreasAndLengthsParameters", 
"esri/tasks/LengthsParameters", "esri/tasks/GeometryService",  "dojo/text!./templates/MeasureToolBar.html", "dojo/NodeList-dom", "dojo/domReady!"],
function (domAttr,declare,Color, string,domClass, kernel, query, array, lang, _Widget, _Templated, TextSymbol,Font,Draw, on,SimpleFillSymbol,
	GraphicsLayer,Point,Polygon,Graphic,SimpleMarkerSymbol,SimpleLineSymbol, AreasAndLengthsParameters,LengthsParameters,GeometryService,template) {
   return declare([_Widget, _Templated], {
        _listHtml: "",
        templateString: template,
        _NodeList:[],
        _ClickList:[],
        _listPara: [],
        _enabled: !0,
        _drawType: null,
        _baseClass:null,
        _measureTool: null,
        _map: null,
        _handler: null,
        _node: null,
        _domId: null,
       constructor: function (options, srcRefNode) {
       			this._url = options.svrUrl;
            this._listPara = options.measureObjs;
            this._map = options.map;
            this._DomID = srcRefNode;
            this._callback = options.callback;
            this._markLayer = options.markLayer|| new GraphicsLayer();
//          this._baseClass = options.baseClass;
            this._renderHtml();
            this._measureTool = new Draw(this._map);
            this.geometryService = new GeometryService(this._url);
        },
       postCreate: function () {
            //this.deactivate();
            this.inherited(arguments)
       },
        startup: function () {
            this.inherited(arguments);
            this._map.addLayer(this._markLayer);
            this._measureList.innerHTML = '<ul class="boxinfo">'+this._NodeList.join("") + '</ul>';
            domClass.add(this.domNode, this._baseClass);
            this._uiConnect();
        },
	      _measureTask:function(evt){
	      	this._markGraphic(evt);
	      	switch(evt.geometry.type){
	      		case "polyline":
	      			this._measureLength(evt);
	      			break;
	      		case "polygon":
	      			this._measureArea(evt);
	      			break;
	      		default:
	      			break;
	      	}
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
      _measureLength:function (ent) {
   			//console.log(ent);
          var lengthParams = new LengthsParameters();
          lengthParams.polylines = [ent.geometry];
          lengthParams.lengthUnit = GeometryService.UNIT_METER;
          lengthParams.geodesic = true;

          this.geometryService.lengths(lengthParams,
          lang.hitch(this, function(result){
          	  var distance = (result.lengths[0] / 1000).toFixed(3) + " km";
              var g = this.getPathLabel(distance, ent.geometry);
              this._markLayer.add(g);
          }),
          lang.hitch(this, this.onError));   
   		},
   		_measureArea:function (evt) {
				
        var geom = evt.geometry;
        var areasAndLengthParams = new AreasAndLengthsParameters();
        areasAndLengthParams.lengthUnit = GeometryService.UNIT_METER;
        areasAndLengthParams.areaUnit = GeometryService.UNIT_SQUARE_METERS;
        areasAndLengthParams.calculationType = "geodesic";
        
        this.geometryService.simplify([geom], lang.hitch(this,function (simplifiedGeometries) {
            areasAndLengthParams.polygons = simplifiedGeometries;
            this.geometryService.areasAndLengths(areasAndLengthParams, 
            	lang.hitch(this,function (result) {            	
                for (var i=0;i<result.areas.length;i++) {
                  var area = (result.areas[i] / 1000000).toFixed(3) + " km2";
                  var aregph = this.getAreaLabel(area, geom, i);
                  this._markLayer.add(aregph);
                }
                for(var i=0;i<result.lengths.length;i++){
                	var lenNum = result.lengths[i] / 1000;
                  var len = lenNum.toFixed(3) + " km";
                  var lengph = this.getPathLabel(len, geom);
                  this._markLayer.add(lengph);
                }
            	})
            );
        	})
        );
   		},
   		getPathLabel:function (text, polyline) { 
        var sym = new TextSymbol(text, this.getFont(), new Color([250, 0, 0]));
        if (polyline.paths) {
            var path = polyline.paths[0];
        }
        else {
            var path = polyline.rings[0];
        }
        var idx = Math.floor(path.length / 2);
        var p1 = new Point();
        p1 = polyline.getPoint(0, idx);
        var g = new Graphic(p1, sym);
        return g;
	    },
	    getAreaLabel :function (text, polygon, ringIndex) {
          var sym = new TextSymbol(text, this.getFont(), new Color([255, 0, 0]));
          var point = polygon.getCentroid();
          var g = new Graphic(point, sym);
	        return g;
	    },
			getFont :function () {
        var size = 10;
        var fontFace = "Arial";
        var f = new Font(size + "pt", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, fontFace);
        return f;
	    },
      onError: function(msg) {
        console.log(msg);
      },
      _renderHtml:function(){
          dojo.forEach(this._listPara,lang.hitch(this, function (para) {
              this._NodeList.push(lang.replace("\x3cli  class\x3d'{type}' type='{type}' \x3e\x3ci class\x3d'ace-icon fa {iconName} bigger-100' style\x3d'margin-right: 6px;'\x3e\x3c/i\x3e\x3cspan\x3e{alias}\x3c/span\x3e \x3c/li\x3e", para));
          }));            
      },
      _startDraw: function (node, callback) {            
          this._node = node;
          dojo.addClass(this._node, "drawSelect");
          var type = domAttr.get(node,"type");
          console.log(type);
          this._measureTool.activate(type);
          this._map.setMapCursor("crosshair");
          mapObject.map.dblclkHandle.pause();
          this._measureTool.on("draw-end",lang.hitch(this,function(evt){
          	
          	mapObject.map.dblclkHandle.resume();
          	console.log(evt);
          	this._map.setMapCursor("default");
          	this._measureTool.deactivate();
          	this._measureTask(evt);
          	callback && callback.apply(this,[evt]);
          }));
      },
      clear:function(){
      	this._measureTool.deactivate();
      	this._markLayer.clear();
      },
      _uiConnect: function () {
          dojo.forEach(this._ClickList, dojo.disconnect);
          dojo.connect(this._domClear,"onclick",lang.hitch(this,function(evt){
          	this.clear();
          }));
          //dojo.query("#"+this._DomID + " ul li").forEach(function (a) {
          dojo.query("ul li",this._measureList).forEach(function (a) {
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