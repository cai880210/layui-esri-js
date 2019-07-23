///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',"dijit/_Templated", 
    "dijit/_Widget",
    "esri/dijit/Basemap",
    "esri/dijit/BasemapLayer",
    'esri/dijit/BasemapGallery',"onemap/layer/TDTAnnoLayer","onemap/layer/TDTLayer",
    'dojo/_base/lang',"dojo/text!./templates/MyBasemapGallery.html",
    'dojo/on'
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,_Templated,
    _Widget,
    Basemap,
    BasemapLayer,
    BasemapGallery,TDTAnnoLayer,TDTLayer,
    lang,template,
    on) {
    var clazz = declare([_Widget, _Templated], {
			templateString: template,
      name: 'BasemapGallery',
      baseClass: 'jimu-widget-basemapgallery',
      basemapGallery: null,
      map:null,
      config:null,
			constructor: function (options, srcRefNode) {
				this.map = options.map;
				this.config = options.config;
      },
      postCreate: function () {
            //this.deactivate();
        this.inherited(arguments)
      },
      startup: function() {
        this.inherited(arguments);
        this.mapwkids ="4490";
   			this.lods=[{ "level": 0,"resolution": 1.40625,"scale": 591658710.9091312},{ "level": 1,"resolution":0.703125,"scale": 295829355.4545656},{ "level": 2,"resolution":0.3515625,"scale":147748796.52937502},{ "level": 3,"resolution":0.17578125,"scale":73874398.264687508},{ "level": 4,"resolution":0.087890625,"scale":36937199.132343754},{ "level": 5,"resolution":0.0439453125,"scale":18468599.566171877},{ "level": 6,"resolution":0.02197265625,"scale":9234299.7830859385},{ "level": 7,"resolution":0.010986328125,"scale": 4617149.8915429693},{ "level": 8,"resolution":0.0054931640625,"scale": 2308574.9457714846},{ "level": 9,"resolution":0.00274658203125,"scale": 1154287.4728857423},{ "level": 10,"resolution":0.001373291015625,"scale": 577143.73644287116},{ "level": 11,"resolution":0.0006866455078125,"scale": 288571.86822143558},{ "level": 12,"resolution":0.00034332275390625,"scale": 144285.93411071779},{ "level": 13,"resolution":0.00017166137695312,"scale": 72142.967055358895},{ "level": 14,"resolution":0.0000858306884765,"scale": 36071.483527679447},{ "level": 15,"resolution":0.00004291534423828,"scale": 18035.741763839724},{ "level": 16,"resolution":0.00002145767211914,"scale": 9017.8708819198619},{ "level": 17,"resolution":0.00001072883605957,"scale":4508.9354409599309},{ "level": 18,"resolution":0.000005364418029785,"scale":2254.4677204799655}];
    
        this.basemapGallery = new BasemapGallery(this.resetBasemaps(), this.basemapGalleryDiv);
        this.basemapGallery.startup();
        this.basemapGallery.select("tdt_image");
        this.own(on(this.basemapGallery, "selection-change", lang.hitch(this, this.selectionChange)));
      },
			getTDLayer:function(){

				var tdtLayer_img = new TDTLayer("img",this.mapwkids,this.lods);
				tdtLayer_img.id = "71cd978c321c4a7bbc1b";
				tdtLayer_img.queryType = 0;
				tdtLayer_img.setOpacity(1);
			  
				var tdtLayer_cia = new TDTAnnoLayer("cia",this.mapwkids,this.lods);
				tdtLayer_cia.id = "71cd978c321c4a7bbc1b";
				tdtLayer_cia.queryType = 0;
				tdtLayer_cia.setOpacity(1);
				return [tdtLayer_cia,tdtLayer_img];
//				this.map.addLayer(tdtLayer_img,parseInt(obj.index));
//				this.map.addLayer(tdtLayer_cia,parseInt(obj.index));
			},
			getTDIMGLayer:function(){
				var tdtLayer_img = new TDTLayer("CGCS_DOMMAP",this.mapwkids,this.lods);
				tdtLayer_img.id = "tdt_image";
				tdtLayer_img.queryType = 0;
				tdtLayer_img.setOpacity(1);
				
				var tdtLayer_img_cia = new TDTLayer("CGCS_DOMMAP_CIA",this.mapwkids,this.lods);
				tdtLayer_img.id = "084d1b8ca69a496eb3";
				tdtLayer_img.queryType = 0;
				tdtLayer_img.setOpacity(1);
				return [tdtLayer_img,tdtLayer_img_cia];
			},
			getTDVECLayer:function(){

				var tdtLayer_img = new TDTLayer("CGCS_XMMAP",this.mapwkids,this.lods);
				tdtLayer_img.id = "tdt_vector";
				tdtLayer_img.queryType = 0;
				tdtLayer_img.setOpacity(1);
				
				var tdtLayer_img_cia = new TDTLayer("CGCS_XMMAP_CVA",this.mapwkids,this.lods);
				tdtLayer_img.id = "bf9d8d83908340d7";
				tdtLayer_img.queryType = 0;
				tdtLayer_img.setOpacity(1);
				return [tdtLayer_img,tdtLayer_img_cia];		
			},
      resetBasemaps: function() {
        var config = {
				    "showArcGISBasemaps": false,
				    "basemaps": [{
				        "title": "影像",
				        "thumbnailUrl": "images/test/thumbnailUrl_4.png",
				        "layers": [{"url": "http://192.168.110.198:6080/arcgis/rest/services/goog/goog_11/MapServer"}]
				     },{
				        "title": "矢量",
				        "thumbnailUrl": "images/test/thumbnailUrl_5.png",
				        "layers": [{"url": "http://192.168.110.198:6080/arcgis/rest/services/test/MyMapService/MapServer"}]
				     }]
				};
				lang.mixin(config,this.config);
        config.map = this.map;       
        var json = config.basemaps;
        //var len = json.length;
				var bsImg = this.getTDIMGLayer();
				var bsVec = this.getTDVECLayer();
				var layersArray = [bsImg,bsVec];
				var len = layersArray.length;
        for (var i = 0; i < len; i++) {
          var n = json[i].layers.length;
//          var layersArray = [];
//        for (var j = 0; j < n; j++) {
//          layersArray.push(new BasemapLayer(json[i].layers[j]));
//        }
debugger;
          json[i].layers = layersArray[i];
          if (json[i].thumbnailUrl) {
            if (json[i].thumbnailUrl.indexOf("data:image") !== 0) {
              json[i].thumbnailUrl = json[i].thumbnailUrl;
            }
          }else{
            json[i].thumbnailUrl =  "images/default.jpg";
          }
          var basemap = new Basemap(json[i]);
          json[i] = basemap;
        }
        return config;
     },
      selectionChange: function() {
      	if(this.selectedLayer){
      		for(var i=0;i<this.selectedLayer.length;i++){
      			this.map.removeLayer(this.selectedLayer[i]);
      		}
      		
      	}
        var basemap = this.basemapGallery.getSelected();
        //this.basemapGallery.select(basemap.id);
        console.log(basemap);
        this.selectedLayer = basemap.layers;
        this.map.addLayers(basemap.layers);
//      var layers = basemap.getLayers();
//      if (layers.length > 0) {
//        this.publishData();
//      }
      }
    });
    return clazz;
  });