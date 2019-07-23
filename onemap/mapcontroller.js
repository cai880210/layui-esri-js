/*global define */
/*jshint laxcomma:true*/
define([
  'dojo/_base/declare', "dojo/dom","dijit/registry","dojo/promise/all",'dojo/_base/lang',"dojo/_base/array","dojo/request", "esri/request",  'dojo/on',"dojo/request/xhr",'onemap/widgets/Grid',"esri/toolbars/draw",
  'dojo/Deferred',"esri/tasks/query",'onemap/widgets/ProjectLayer','onemap/widgets/MeasureToolBar','onemap/widgets/DrawToolBar','onemap/widgets/MyOverviewMap','onemap/widgets/MyBasemapGallery',
  'esri/map',"onemap/layer/TDTAnnoLayer","onemap/layer/TDTLayer", "esri/layers/WMSLayer"
], function (declare,dom,registry,all, lang,array,request, esriRequest,on,xhr,Grid,Draw, Deferred,Query,
	ProjectLayer, MeasureToolBar,DrawToolBar,MyOverviewMap,MyBasemapGallery,Map,TDTAnnoLayer,TDTLayer,WMSLayer) {

  return declare(null, {
    map: null,
    searchGrid:null,
    measurebar:null,
    drawbar:null,
    measurebar:null,
    myOverView:null,
    options: {},

    constructor: function(options) {
      declare.safeMixin(this.options, options);
      this.mapwkids ="4490";
 			this.lods=[{ "level": 0,"resolution": 1.40625,"scale": 591658710.9091312},{ "level": 1,"resolution":0.703125,"scale": 295829355.4545656},{ "level": 2,"resolution":0.3515625,"scale":147748796.52937502},{ "level": 3,"resolution":0.17578125,"scale":73874398.264687508},{ "level": 4,"resolution":0.087890625,"scale":36937199.132343754},{ "level": 5,"resolution":0.0439453125,"scale":18468599.566171877},{ "level": 6,"resolution":0.02197265625,"scale":9234299.7830859385},{ "level": 7,"resolution":0.010986328125,"scale": 4617149.8915429693},{ "level": 8,"resolution":0.0054931640625,"scale": 2308574.9457714846},{ "level": 9,"resolution":0.00274658203125,"scale": 1154287.4728857423},{ "level": 10,"resolution":0.001373291015625,"scale": 577143.73644287116},{ "level": 11,"resolution":0.0006866455078125,"scale": 288571.86822143558},{ "level": 12,"resolution":0.00034332275390625,"scale": 144285.93411071779},{ "level": 13,"resolution":0.00017166137695312,"scale": 72142.967055358895},{ "level": 14,"resolution":0.0000858306884765,"scale": 36071.483527679447},{ "level": 15,"resolution":0.00004291534423828,"scale": 18035.741763839724},{ "level": 16,"resolution":0.00002145767211914,"scale": 9017.8708819198619},{ "level": 17,"resolution":0.00001072883605957,"scale":4508.9354409599309},{ "level": 18,"resolution":0.000005364418029785,"scale":2254.4677204799655}];
    
      this.pageParas = {
          perpage: 5, // show 10 elements per page
          lapping: 0, // don't overlap pages for the moment
          page:0,
          onFormat:lang.hitch(this,this.pageFormat),
          onSelect:lang.hitch(this,this.pageOnselect)
      };
      //this.geometryService = new GeometryService(options.geometryServiceUrl);
    },

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
          }
          else{
          	tdtLayer_vec.visible = false;
          	tdtLayer_cva.visible = false;
          }
          this.map.addLayer(tdtLayer_vec,parseInt(obj.index));
          this.map.addLayer(tdtLayer_cva,parseInt(obj.index)); 
        }
        else if(layerurl.indexOf("img_")>-1){//影像图
					if(obj.LAYER_NAME=='天地图矢量底图'){
						var tdtLayer_img = new TDTLayer("CGCS_XMMAP",this.mapwkids,this.lods);
						tdtLayer_img.id = obj.ID;
						tdtLayer_img.queryType = obj.queryType;
						tdtLayer_img.setOpacity(parseFloat(obj.opacity));

						this.mapdtLayerObj = obj;
						//设置是否显示
						if(obj.visible == "1"){
							  tdtLayer_img.visible = true;
						}
						else{
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
						}
						else{
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
						}
						else{
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
						}
						else{
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
						}
						else{
							  tdtLayer_img.visible = false;
							  tdtLayer_cia.visible = false;
						}
						this.map.addLayer(tdtLayer_img,parseInt(obj.index));
						this.map.addLayer(tdtLayer_cia,parseInt(obj.index));
					}
        }
			}
	    else if(obj.LAYER_TYPE=="9"){//栅格服务
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
  		}
	    else if(obj.LAYER_TYPE=="4"){//WMS服务
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
      }
  		else if(obj.LAYER_TYPE=="3"){
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
//      myServiceLayer.on("click",lang.hitch(this,function(evt){
//        console.log(evt);
//        var g = evt.graphic;              
//        if(this.picturesUrl){
//          var object = {
//              objectIds:g.attributes.OBJECTID,
//              layerId:obj.ID
//            };
//          this.modelAsyn(this.picturesUrl,object,function(res){
//            var result = decodeURIComponent(res.replace(/\+/g, '%20'));
//            var pictureList = JSON.parse(result);
//            if(pictureList&&pictureList.length>0){
//              g.attributes.imageUrl = pictureList[0].FILEURL;
//            }
//            this.showIW(g,obj.ID);
//          },function(e){
//            this.showIW(g,obj.ID);
//          }); 
//        }
//        else{
//          this.showIW(g,obj.ID);
//        }
//      }));
  	  }
    	else{

		   	if(obj.LOAD_TYPE=="1"){//动态加载数据图层
  				var maplayerIdArr = new Array();//
  				if(obj.LAYER_TYPE=="2"||obj.LAYER_TYPE=="6"){//底图或者影像图
  					var layerids = (obj.LAYER_TABLE==null?(new Array()):obj.LAYER_TABLE.split(","));
  				    maplayerIdArr = layerids;
  				}
  				else{
  					maplayerIdArr.push(obj.LAYER_TABLE);
  				}
  				var  myServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(layerurl);
  				myServiceLayer.setVisibleLayers(maplayerIdArr);
  				myServiceLayer.id = obj.ID;
  				myServiceLayer.queryType = obj.queryType;
  				//设置过滤条件
  				if(obj.layerDefinitions!=undefined && obj.layerDefinitions!=null){
  				    myServiceLayer.setLayerDefinitions(obj.layerDefinitions);
  				}
  				else{
  				    var setLayerDefinitions=[];
  				    setLayerDefinitions[0]=whereCause;
  				    myServiceLayer.setLayerDefinitions(setLayerDefinitions);
  				}
  				this.map.addLayer(myServiceLayer,parseInt(obj.index));
  
  				//设置是否显示
  				if(obj.visible == "1"){
  					myServiceLayer.visible = true;
  				}
  				else{
  					myServiceLayer.visible = false;
  				}
  				myServiceLayer.setOpacity(parseFloat(obj.opacity));
				} 
				else{//瓦片加载（默认不显示）
		 	    var myServiceLayer = new ArcGISTiledMapServiceLayer(layerurl);
        		myServiceLayer.id = obj.ID;
        		myServiceLayer.queryType = obj.queryType;
        		this.map.addLayer(myServiceLayer,parseInt(obj.index));
        		//设置是否显示
            if(obj.visible == "1"){
              myServiceLayer.visible = true;
            }
            else{
              myServiceLayer.visible = false;
            }
            myServiceLayer.setOpacity(parseFloat(obj.opacity));
				}
    	}
    },	
    
    // public methods
    //加载地图
    //参数option：elem——页面id,layers——图层数组,mapOptions——地图属性
    load: function() {
    	/*
	     *地图容器加载事件
	     */
      var deferred = new Deferred()
        , mapLoaded = lang.hitch(this, function(map) {
      		deferred.resolve(map);
        });
        this.map = new Map(this.options.elem, this.options.mapOptions);        
				on.once(this.map, 'load', mapLoaded); 
        return deferred.promise;
    },
    basemapLoad:function(){
    	/*
    	 * 地图图层加载事件
    	 */
    	var deferred = new Deferred()
        , basemapLoaded = lang.hitch(this, function(layer) {
      		deferred.resolve(layer);
        });        
    	this.map.addLayers(this.options.basemap);
    	on.once(this.map, 'layer-add-result', basemapLoaded);
    	return deferred.promise;
    },
    layersLoad:function(layers){
    	/*
    	 * 地图图层加载事件
    	 */
    	var deferred = new Deferred()
        , layersAdded = lang.hitch(this, function(layers) {
      		deferred.resolve(layers);
        });        
    	this.map.addLayers(layers);
    	on.once(this.map, 'layers-add-result', layersAdded);
    	return deferred.promise;
    },
    baseMapLoad:function(){
    	/*
    	 * 地图底图加载
    	 */
    	var deferred = new Deferred()
        , layersAdded = lang.hitch(this, function(layers) {
      		deferred.resolve(layers);
        });        
    	this.map.addLayers(this.options.layers);
    	on.once(this.map, 'layers-add-result', layersAdded);
    	return deferred.promise;
    },
    zoomEnd:function(callback){
    	/*
    	 * 地图缩放事件
    	 */
    	var  zoomEnded = lang.hitch(this, callback);        
    	on(this.map, 'zoom-end', zoomEnded);
    	//return deferred.promise;
    },
    multiViewMap:function(nodeID,prop){
    	/*
    	 * 多屏比对功能
    	 */

    	if(this.myOverView ==null ||this.myOverView.domNode ==null){
    		var json = {
			    "visible": true,
			    "baseUrl":"http://27.154.234.238:6080/arcgis/rest/services/xiamen/xiamendao_Police/MapServer"
			  };
        json.map = this.map;
        lang.mixin(json,prop);
        var opt ={map: this.map};
        opt.url = "http://192.168.110.91:8080/waterproject/map/web/getListDirLayer"; 
        json.projectOpt= opt;
        debugger;
        console.log(json);
        this.myOverView = new MyOverviewMap(json,nodeID);
        this.myOverView.startup();
    	}
    },
    mapDrawMark:function(nodeID){
    	/*
    	 * 地图标绘功能
    	 */
    	if(this.drawbar != null){
				this.drawbar.deactivate();
				this.drawbar =null;
    	}
  	  var opt = {"drawObjs":[
     		{"id":"pointDiv","iconName":"fa-dot-circle-o","type":"point","html":"标点","class":"layui-nav-item"},
     		{"id":"drawlineDiv","iconName":"fa-share-alt","type":"polyline","html":"划线","class":"layui-nav-item"},
     		{"id":"drawgonDiv","iconName":"fa-square-o","type":"polygon","html":"标面","class":"layui-nav-item"},
     		{"id":"clearDiv","type":"clear","class":"layui-nav-item","html":"清除"}
	     	],
	     	"class":"layui-nav",
	     	"map":this.map
     	};
     	this.drawbar = new DrawToolBar(opt,nodeID);
     	this.drawbar.startup();
		},
		mapAsyn:function(url,data,callback,errhandle){
      /*
       * 异步方法
       * 及类似ajax
       * */
    	var xhrArgs = {  
					method:"POST",
	        handleAs: "text",
	        headers: {"X-Requested-With": null}
	    };
	    if(data){
	    	xhrArgs = lang.mixin(xhrArgs,{data:data});
	    }
    	xhr(url, xhrArgs).then(lang.hitch(this,function(data){
    		callback&&callback.apply(this,[data]);
    	}),lang.hitch(this,function(err){
	    	errhandle&&errhandle.apply(this,[err]);
	    })); 
    },
    esriRequest:function(url,callback,errorback){
    	  var requestHandle = esriRequest({
          url: url,
          callbackParamName: "jsoncallback"
        });
        requestHandle.then(callback, errorback);
    },
    mapGallery:function(nodeID){
    	if(this.myMapGallery == null ||this.myMapGallery.domNode ==null){
    		var opt = {
    			"config":{
				    "showArcGISBasemaps": false,
				    "basemaps": [{
				        "title": "影像",
				        "thumbnailUrl": "images/test/thumbnailUrl_4.png",
				        "layers": [{"url": "http://27.154.234.238:6080/arcgis/rest/services/xiamen/xiamendao_Police/MapServer"}]
				     },{
				        "title": "矢量",
				        "thumbnailUrl": "images/test/thumbnailUrl_5.png",
				        "layers": [{"url": "http://27.154.234.238:6080/arcgis/rest/services/xiamen/xiamendao_Police/MapServer"}]
				     }]
					},
		     	"map":this.map
	     	};
	     	this.myMapGallery = new MyBasemapGallery(opt,nodeID);
	     	this.myMapGallery.startup();
    	}
    },
    measureTool:function(nodeID){
    	if(this.measurebar != null ){
				this.measurebar.deactivate();
				this.measurebar =null;
    	}
  		var opt = {"measureObjs":[
     		{"id":"measurelineDiv","type":"polyline","class":"layui-nav-item"
     		,"html":"长度测量"},
     		{"id":"measuregonDiv","type":"polygon","class":"layui-nav-item"
     		,"html":"面积测量"},
     		{"id":"clearDiv","type":"clear","class":"layui-nav-item","html":"清除"}
	     	],
	     	"class":"layui-nav",
	     	"svrUrl":"http://47.92.163.227:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer",
	     	"map":this.map
     	};
     	this.measurebar = new MeasureToolBar(opt,nodeID);
     	this.measurebar.startup();
     	return this.measurebar;
     },
    drawTool:function(geometryType){
    	if(this.drawbar !==null){
    		this.drawbar.deactivate();
    	}
  	  this.drawbar = new Draw(this.map);
			this.drawbar.activate(geometryType);
			var deferred = new Deferred()
      , drawEnded = lang.hitch(this, function(evt) {
      	this.drawbar.deactivate();
    		deferred.resolve(evt);
      }); 
    	on.once(this.drawbar, 'draw-end', drawEnded);
    	return deferred.promise;
    },
    createGrid:function(nodeId,features,config){
      /*
       * 创建数图交互列表
       * 
       * */

      var option = {
        features:features,
        pageOptions:this.pageParas,
        map : this.map
      }
      Object.assign(option,config);
      var grid = new Grid(option,nodeId);
      return grid;
    },
    pageOnselect:function(e){
    	console.log(e);
    },
    pageFormat:function(para) {
      /*
       * 分页工具条样式
       * 自定义
       * 
       * */
      var type = para.type;
      var data = para.data;
      var value = "";
      switch (type) {
          case 'next':
              var page = "";
              if (data['active']) page = data["value"];                    
              return '<li class="page-item"><a class="page-link"  href="#' + page + '">' 
                + '<span aria-hidden="true">&gt;&gt;</span><span class="sr-only">Next</span>' 
                + '</a></li>';
          case 'prev':
              var page ="";
              if (data['active']) page = data["value"];
              return '<li class="page-item"><a class="page-link" href="#' + page + '">' 
                + '<span aria-hidden="true">&lt;&lt;</span><span class="sr-only">Prev</span>' 
                + '</a></li>';
          case 'first':
            var page="";
            if (data['active']) page = data["value"];
            return '<li class="page-item"><a class="page-link" href="#' + page + '">' 
            + '<span aria-hidden="true">|&lt;</span><span class="sr-only">首页</span>' 
            + '</a></li>';
          case 'last':
            var page = "";
            if (data['active']) page = data["value"];                    
            return '<li class="page-item"><a class="page-link"  href="#' + page + '">' 
              + '<span aria-hidden="true">&gt;|</span><span class="sr-only">末页</span>' 
              + '</a></li>';
          default:
            value = data["value"];
            if (!data['active'])
                return '<li class="page-item">' + value + '</li>';
            if (data["page"] !== data["value"])
                return '<li class="page-item"><a class="page-link" href="#' + data["value"] + '">' + value + '</a></li>';
            return '<li class="page-item active" ><a class="page-link">' + value + '</a></li>';
      }
    },
    search:function(nodeId,features,config){
      if(this.searchGrid){
	      var option = {
	        features:features,
	        pageOptions:this.pageParas,
	        map : this.map
	      }
        var opt ={
            strLi : this.strLi,
            fields : this.fields,
            highLightSymbol : this.highlightSml,
            symbol : this.sml,
            featureType : this.featureType,
            iWcontentNode:lang.hitch(this,this.iWcontentNode),
        };
        Object.assign(opt,config);
        this.searchGrid.setOption(opt);
        Object.assign(this.pageParas,config.pageOptions);
        this.searchGrid.resetList(features,config.nums,this.pageParas);
      }else{
        this.searchGrid = this.createGrid(nodeId,features,config);
        this.searchGrid.startup();
      }
    },
    infoHide:function(){
    	/*
    	 * 清除搜索功能的信息面板
    	 */
    	this.map.infoWindow.hide();
    },
    mapSelect:function(query,layerId){
    	/*
    	 * 点查功能
    	 */
    	var deferred = new Deferred()
        , layersRes = lang.hitch(this, function(featureSet) {
      		deferred.resolve(featureSet);
        });        
    	this.map.getLayer(layerId).selectFeatures(query,3,layersRes,function(err){
    		console.log(err);
    		alert("失败");
    	});
    	//on.once(this.map.getLayer(layerId), "selection-complete", layersRes);
    	return deferred;
    },
    mapIdentify:function(){
    	/*
    	 * 点查功能
    	 * 监听地图的点击事件
    	 */
    	var deferred = new Deferred()
        , mapClk = lang.hitch(this, function(evt) {
        	var point = evt.mapPoint;
        	deferred.resolve(evt);
//      	
//					var query = new Query();
//		    	query.geometry = point;
//		    	console.log(JSON.stringify(point));
//		    	query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
//		    	var geoData ={"geometry":JSON.stringify(point)};
//		    	var para =  Object.assign(geoData,data);
//      	var promises = dojo.map(layerIdList,lang.hitch(this,function(item,idx){
//	        		var promise = request.get(url, {
//						        handleAs: "json",
//						        data:para
//						    }).then(function(response){
//						    	console.log(response);
//						        var obj = {"layerId":item,"features":[]};
//						        var data = response.data.list;
//						        array.forEach(data, function(g){
//						            //obj["features"].push(g);
//						            obj["features"][0] = g;
//						        });					
//						        return obj;
//						    });
//      		return promise;
//      	}));
//      	all(promises).then(function(e){        		
//      		var obj = {"mapPoint":evt.mapPoint,
//      		"result":e};
//      		deferred.resolve(obj);
//      	});      		

        });  
    	on.once(this.map, "click", mapClk);
    	return deferred.promise;
   },
    mapLayersCtrl:function(opt,nodeId){
    	var options ={map: this.map};
    	options.url = "http://192.168.110.91:8080/waterproject/map/web/getLayerListByLayerType"; 
 		  lang.mixin(options,opt);
 		  debugger;
			this.projectLayerlist = new ProjectLayer(options,nodeId);		
			this.projectLayerlist.startup();
    }
  });

});
