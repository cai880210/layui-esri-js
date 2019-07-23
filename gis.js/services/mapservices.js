/*global define*/
/*jshint laxcomma:true*/
define(["dojo/_base/declare",'dojo/_base/lang',"esri/symbols/SimpleFillSymbol",
  'esri/layers/FeatureLayer','dojo/on',
  'esri/renderers/SimpleRenderer','esri/layers/ArcGISTiledMapServiceLayer','dojo/on',
  'utils/symbolUtil'
], function(declare,lang,SimpleFillSymbol,FeatureLayer, on,SimpleRenderer, ArcGISTiledMapServiceLayer,symbolUtil) {
	var clazz = declare([],{
		addLoadMapLayer:function(obj,whereCause){
   	  //添加图层至map
			var layerurl =  obj.LAYER_URL;
	    if(obj.LAYER_TYPE=="7"){//天地图
	    			
            if(layerurl.indexOf("vec_")>-1){//矢量图
							var tdtLayer_vec = new TDTLayer("vec",this.mapwkids,this.lods);
            	tdtLayer_vec.id = obj.ID;
            	tdtLayer_vec.queryType = obj.queryType;
            	tdtLayer_vec.setOpacity(parseFloat(obj.opacity));
			     
					    var tdtLayer_cva = new TDTAnnoLayer("cva",this.mapwkids,this.lods);
					    tdtLayer_cva.id = obj.ID+"_bz";
					    tdtLayer_cva.queryType = obj.queryType;
					    tdtLayer_cva.setOpacity(parseFloat(obj.opacity));
			    
			    		this.mapdtLayerObj = obj;
			    		//设置是否显示
	            if(obj.visible == "1"){
	            	tdtLayer_vec.visible = true;
	            	tdtLayer_cva.visible = true;
	            }else{
	            	tdtLayer_vec.visible = false;
	            	tdtLayer_cva.visible = false;
	            }
	            this.map.addLayer(tdtLayer_vec,parseInt(obj.index));
	            this.map.addLayer(tdtLayer_cva,parseInt(obj.index)); 
            }else if(layerurl.indexOf("img_")>-1){//影像图	            	  
							if(obj.LAYER_NAME=='天地图矢量底图'){
								var tdtLayer_img = new TDTLayer("CGCS_XMMAP",this.mapwkids,this.lods);
								tdtLayer_img.id = obj.ID;
								tdtLayer_img.queryType = obj.queryType;
								tdtLayer_img.setOpacity(parseFloat(obj.opacity));
		
								this.mapdtLayerObj = obj;
								//设置是否显示
								if(obj.visible == "1"){
									  tdtLayer_img.visible = true;
								}else{
									  tdtLayer_img.visible = false;
								}
								this.map.addLayer(tdtLayer_img,parseInt(obj.index));
							}
							else if(obj.LAYER_NAME=='天地图影像底图'){
								var tdtLayer_img = new TDTLayer("CGCS_DOMMAP",this.mapwkids,this.lods);
								tdtLayer_img.id = obj.ID;
								tdtLayer_img.queryType = obj.queryType;
								tdtLayer_img.setOpacity(parseFloat(obj.opacity));
		
								this.mapyxLayerObj = obj;
								//设置是否显示
								if(obj.visible == "1"){
									  tdtLayer_img.visible = true;
								}else{
									  tdtLayer_img.visible = false;
								}
								this.map.addLayer(tdtLayer_img,parseInt(obj.index));
							}
							else if(obj.LAYER_NAME=='天地图矢量底图注记'){
								var tdtLayer_img = new TDTLayer("CGCS_XMMAP_CVA",this.mapwkids,this.lods);
								tdtLayer_img.id = obj.ID;
								tdtLayer_img.queryType = obj.queryType;
								tdtLayer_img.setOpacity(parseFloat(obj.opacity));
								//设置是否显示
								if(obj.visible == "1"){
									  tdtLayer_img.visible = true;
								}else{
									  tdtLayer_img.visible = false;
								}
								this.map.addLayer(tdtLayer_img,parseInt(obj.index));
							}
							else if(obj.LAYER_NAME=='天地图影像底图注记'){
								var tdtLayer_img = new TDTLayer("CGCS_DOMMAP_CIA",this.mapwkids,this.lods);
								tdtLayer_img.id = obj.ID;
								tdtLayer_img.queryType = obj.queryType;
								tdtLayer_img.setOpacity(parseFloat(obj.opacity));
								//设置是否显示
								if(obj.visible == "1"){
									  tdtLayer_img.visible = true;
								}else{
									  tdtLayer_img.visible = false;
								}
								this.map.addLayer(tdtLayer_img,parseInt(obj.index));
							}
							else{
								var tdtLayer_img = new TDTLayer("img",this.mapwkids,this.lods);
								tdtLayer_img.id = obj.ID;
								tdtLayer_img.queryType = obj.queryType;
								tdtLayer_img.setOpacity(parseFloat(obj.opacity));
							  
								var tdtLayer_cia = new TDTAnnoLayer("cia",this.mapwkids,this.lods);
								tdtLayer_cia.id = obj.ID+"_bz";
								tdtLayer_cia.queryType = obj.queryType;
								tdtLayer_cia.setOpacity(parseFloat(obj.opacity));
								
								this.mapyxLayerObj = obj;
								//设置是否显示
								if(obj.visible == "1"){
									  tdtLayer_img.visible = true;
									  tdtLayer_cia.visible = true;
								}else{
									  tdtLayer_img.visible = false;
									  tdtLayer_cia.visible = false;
								}
								this.map.addLayer(tdtLayer_img,parseInt(obj.index));
								this.map.addLayer(tdtLayer_cia,parseInt(obj.index));
							}
            }
			}
	    else 
	    if(obj.LAYER_TYPE=="9"){//栅格服务
	    	this._layerType[obj.LAYER_TYPE]=[];
  			var imageServiceLayer  = new ArcGISImageServiceLayer(layerurl);
  			imageServiceLayer.id = obj.ID;
  			imageServiceLayer.queryType = obj.queryType;
  			imageServiceLayer.setOpacity(parseFloat(obj.opacity));
  			if(obj.visible=="1"){ 
  				imageServiceLayer.visible = true;
  			}else{
  				imageServiceLayer.visible = false;
  			}
  			this.map.addLayer(imageServiceLayer,parseInt(obj.index));
  		}else 
			if(obj.LAYER_TYPE=="4"){//WMS服务
    	    this._layerType[obj.LAYER_TYPE]=[];
    	    var resourceInfo = {extent: this.startExtent,layerInfos: []};
    	    //layerurl="http://192.168.10.151:8081/ols/ogc/test/testWMS/wms?accessKey=ed48c1fd1385a7bf93ed526ebbc368aa9fa556f6";
		      var wmsServiceLayer  = new WMSLayer(layerurl,{resourceInfo: resourceInfo});
		      wmsServiceLayer.setImageFormat("png");
		      wmsServiceLayer.setVisibleLayers([obj.SERVER_NAME]);
		      wmsServiceLayer.id = obj.ID;
		      wmsServiceLayer.queryType = obj.queryType;
		      wmsServiceLayer.setOpacity(parseFloat(obj.opacity));
		      if(obj.visible=="1"){ 
		    	  wmsServiceLayer.visible = true;
		      }else{
			      wmsServiceLayer.visible = false;
		      }
		      this.map.addLayer(wmsServiceLayer,parseInt(obj.index));
      }else 
      if(obj.LAYER_TYPE=="3"){
  		    var  myServiceLayer = new esri.layers.FeatureLayer(layerurl+"/" + obj.LAYER_TABLE,{
  					id:obj.ID,
  					outFields: ["*"]
  				    });
    			//myServiceLayer.setVisibleLayers(maplayerIdArr);
    			//myServiceLayer.id = obj.ID;
    			//myServiceLayer.queryType = obj.queryType;
    			//设置过滤条件
    			if(obj.layerDefinitions!=undefined && obj.layerDefinitions!=null){
    				myServiceLayer.setDefinitionExpression(obj.layerDefinitions);
    			}else{
    				var setLayerDefinitions=[];
    				setLayerDefinitions[0]=whereCause;
    				myServiceLayer.setDefinitionExpression(whereCause);
    			}
    			this.map.addLayer(myServiceLayer,parseInt(obj.index));
    			//设置是否显示
    			if(obj.visible == "1"){
    				myServiceLayer.visible = true;
    			}else{
    				myServiceLayer.visible = false;
    			}
            myServiceLayer.setOpacity(parseFloat(obj.opacity));
            myServiceLayer.on("click",lang.hitch(this,function(evt){
              console.log(evt);
              var g = evt.graphic;

              
              if(this.picturesUrl){
                var object = {
                    objectIds:g.attributes.OBJECTID,
                    layerId:obj.ID
                  };
                this.modelAsyn(this.picturesUrl,object,function(res){
                  var result = decodeURIComponent(res.replace(/\+/g, '%20'));
                  var pictureList = JSON.parse(result);
                  if(pictureList&&pictureList.length>0){
                    g.attributes.imageUrl = pictureList[0].FILEURL;
                  }
                  this.showIW(g,obj.ID);
                },function(e){
                  this.showIW(g,obj.ID);
                }); 
              }else{
                this.showIW(g,obj.ID);
              }
           }));
    	  }
      else
    	  {
  
  		   	if(obj.LOAD_TYPE=="1"){//动态加载数据图层
  				var maplayerIdArr = new Array();//
  				if(obj.LAYER_TYPE=="2"||obj.LAYER_TYPE=="6"){//底图或者影像图
  					var layerids = (obj.LAYER_TABLE==null?(new Array()):obj.LAYER_TABLE.split(","));
  				    maplayerIdArr = layerids;
  				}else{
  					maplayerIdArr.push(obj.LAYER_TABLE);
  				}
  				var  myServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(layerurl);
  				myServiceLayer.setVisibleLayers(maplayerIdArr);
  				myServiceLayer.id = obj.ID;
  				myServiceLayer.queryType = obj.queryType;
  				//设置过滤条件
  				if(obj.layerDefinitions!=undefined && obj.layerDefinitions!=null){
  				    myServiceLayer.setLayerDefinitions(obj.layerDefinitions);
  				}else{
  				    var setLayerDefinitions=[];
  				    setLayerDefinitions[0]=whereCause;
  				    myServiceLayer.setLayerDefinitions(setLayerDefinitions);
  				}
  				this.map.addLayer(myServiceLayer,parseInt(obj.index));
  
  				//设置是否显示
  				if(obj.visible == "1"){
  					myServiceLayer.visible = true;
  				}else{
  					myServiceLayer.visible = false;
  				}
  				myServiceLayer.setOpacity(parseFloat(obj.opacity));
  			} else{//瓦片加载（默认不显示）
  		 	    var myServiceLayer = new ArcGISTiledMapServiceLayer(layerurl);
          		myServiceLayer.id = obj.ID;
          		myServiceLayer.queryType = obj.queryType;
          		this.map.addLayer(myServiceLayer,parseInt(obj.index));
          		//设置是否显示
              if(obj.visible == "1"){
                myServiceLayer.visible = true;
              }else{
                myServiceLayer.visible = false;
              }
              myServiceLayer.setOpacity(parseFloat(obj.opacity));
  			}
	    }
    }
	});
  clazz.loadServices = function (config) {
    var layers = [],
    // census tract
    baseUrl = config&&config.hasOwnProperty("baseUrl")?config.baseUrl:"http://27.154.234.238:6080/arcgis/rest/services/xiamen/xiamendao_Police/MapServer";
    var baseTile =new ArcGISTiledMapServiceLayer(baseUrl);
//renderer1 = SimpleRenderer.apply(this,[symbolUtil.renderSymbol()]);
    layers.push(baseTile);
    return layers;
  };
  clazz.loadFeatureLayers = function(config){
//参数结构如：	config = [{
//		"id":"xx",
//    "layerDefinition": null,
//    "featureSet": null
//	}]
  	var layers = [],
    // census tract
    layers = dojo.map(config,lang.hitch(this,function(item,idx){   	
        var featureCollection = {
          "layerDefinition": null,
          "featureSet": null
        };
        featureCollection.layerDefinition = item.layerDefinition;
        featureCollection.featureSet = item.featureSet;
        //create a feature layer based on the feature collection
        var featureLayer = new FeatureLayer(featureCollection, {
          id: item.id
        });
	    	featureLayer.setSelectionSymbol(new SimpleFillSymbol());
        item.hasOwnProperty("clkHandle")&on(featureLayer,"click", lang.hitch(this, item.clkHandle));
        return featureLayer;
    }));
    return layers;
  };
//    require([this.layerInfo.symbolType], lang.hitch(this, function(symbolType) {
//      this.highlightSml = new symbolType(this.layerInfo.highLightSml);
//      this.sml = new symbolType(this.layerInfo.symbol);
//      this.search();
//    }));

  return clazz;

});

