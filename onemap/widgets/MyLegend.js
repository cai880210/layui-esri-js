define(["dojo/dom-attr","dojo/_base/declare","dojo/_base/Color", "dojo/string",  "esri/dijit/_EventedWidget", "dojo/dom-class", "dojo/_base/kernel","dojo/query", "dojo/_base/array", "dojo/_base/lang","dijit/_Widget", "dijit/_Templated","dojo/on",  "dojo/text!./templates/MyLegend.html", "dojo/NodeList-dom", "dojo/domReady!"],
function (domAttr,declare,Color, string,_EventedWidget,	domClass, kernel, query, array, lang, _Widget,_Templated, on,template) {
    return declare([_EventedWidget,_Widget, _Templated], {
  		templateString: template,
 	    constructor: function (options, srcRefNode) {
				this.inherited(arguments)
      },
      postCreate: function () {
          //this.deactivate();
          this.inherited(arguments)
      },
      startup: function () {
				this.inherited(arguments)
      },
			showLegendsViewTab:function (_legendsTabs){
	
			},
		
			loadShowLayerLegends:function (index){
		
			},
				
			selectLegend:function (index){
	
			},
		  _visibilityHandler: function() {
          this.visible ? this.hide() : this.show()
      },
      show: function() {
          if (!this.visible) {
              var a = this._controllerDiv;
              a.title = this.NLS_hide;
              d.remove(a, "ovwShow");
              d.add(a, "ovwHide");
              f.show(this._body);
              f.show(this._maximizerDiv);
              this._initialize();
              this.visible = !0
          }
      },
      
      hide: function() {
          if (this.visible) {
              var a = this._controllerDiv;
              a.title = this.NLS_show;
              d.remove(a, "ovwHide");
              d.add(a, "ovwShow");
              this._maximized && this._maximizeHandler();
              f.hide(this._body);
              f.hide(this._maximizerDiv);
              this._deactivate();
              this.visible = !1
          }
      },
      _maximizeHandler: function() {
          var a = this._maximizerDiv;
          this._maximized ? (a.title = this.NLS_maximize, d.remove(a, "ovwRestore"), d.add(a, "ovwMaximize"), this._resize(this.width, this.height)) : (a.title = this.NLS_restore, d.remove(a, "ovwMaximize"), d.add(a, "ovwRestore"), this._resize(this.map.width, this.map.height));
          this._maximized = !this._maximized
      },
      _initialize: function() {
          if (this.overviewMap) this._activate();
          else {
              var a, b;
              b = 9 > m("ie") ? this._body.firstChild: this._body.firstElementChild;
              this.overviewMap = a = new u(b, {
                  slider: !1,
                  showAttribution: !1,
                  logo: !1,
                  lods: this._overviewLods,
                  wrapAround180: this.map.wrapAround180
              });
              c.connect(a, "onLoad", this,
              function() {
                  this._map_resize_override = l.hitch(a, this._map_resize_override);
                  a.disableMapNavigation();
                  this._activate()
              });
              a.addLayer(this.baseLayer)
          }
      }
  });
});