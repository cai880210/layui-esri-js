define(["dojo/request/script","dojo/request/xhr","dojo/dom-attr","dojo/_base/declare","dojo/dom-construct", 
"dojo/string", "dojo/dom-class", "dojo/_base/kernel", "dojo/query","dijit/form/CheckBox",'onemap/widgets/IWContent',
"dijit/layout/ContentPane", "dijit/layout/TabContainer","esri/InfoTemplate",'onemap/widgets/Dialog',
"dojo/_base/array", "dojo/_base/lang","dijit/_Widget", "dijit/_Templated","dojo/_base/connect",
'onemap/widgets/Popup',"onemap/layer/TDTAnnoLayer","onemap/layer/TDTLayer", "esri/layers/WMSLayer","dojo/DeferredList","dojo/Deferred","esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer", 
"esri/layers/ArcGISImageServiceLayer", "dojo/on","dojo/text!./templates/ProjectLayer.html",
"dojo/NodeList-dom", "dojo/domReady!"],
function (script,xhr,domAttr,declare,domConstruct, string,domClass, kernel, query,CheckBox,IWContent, ContentPane,TabContainer,InfoTemplate,Dialog,
	array, lang, _Widget, _Templated,connect,Popup,TDTAnnoLayer,TDTLayer,WMSLayer,DeferredList,Deferred,ArcGISTiledMapServiceLayer,ArcGISDynamicMapServiceLayer,ArcGISImageServiceLayer,on, template) {
  return declare([_Widget, _Templated], {    
    templateString: template,
    _NodeList:[],
    _ClickList:[],
    _listPara: [],
    _enabled: !0,
    _layerObjs:{},
    _handler: null,
    _node: null,
    _data: null,
    selectIds:[],
    _showLayers:[],
    _layerType:{},
    _dataType:{},
    layerTb:{},
    constructor: function (options, srcRefNode) {
    	this.url = options.url;    	
    	this.picturesUrl = (options.hasOwnProperty("picturesUrl")) ? options.picturesUrl :null;
  		this.getFieldsUrl = options.getFieldsUrl;
  		this.map = options.map;
  		this.mapZoom=options.mapZoom;
  		this.projectId=options.projectId;
  		this.layerInfos = (options.hasOwnProperty("layerInfos")) ? options.layerInfos :{};
 			this.mapwkids ="4490";
 			this.lods=[{ "level": 0,"resolution": 1.40625,"scale": 591658710.9091312},{ "level": 1,"resolution":0.703125,"scale": 295829355.4545656},{ "level": 2,"resolution":0.3515625,"scale":147748796.52937502},{ "level": 3,"resolution":0.17578125,"scale":73874398.264687508},{ "level": 4,"resolution":0.087890625,"scale":36937199.132343754},{ "level": 5,"resolution":0.0439453125,"scale":18468599.566171877},{ "level": 6,"resolution":0.02197265625,"scale":9234299.7830859385},{ "level": 7,"resolution":0.010986328125,"scale": 4617149.8915429693},{ "level": 8,"resolution":0.0054931640625,"scale": 2308574.9457714846},{ "level": 9,"resolution":0.00274658203125,"scale": 1154287.4728857423},{ "level": 10,"resolution":0.001373291015625,"scale": 577143.73644287116},{ "level": 11,"resolution":0.0006866455078125,"scale": 288571.86822143558},{ "level": 12,"resolution":0.00034332275390625,"scale": 144285.93411071779},{ "level": 13,"resolution":0.00017166137695312,"scale": 72142.967055358895},{ "level": 14,"resolution":0.0000858306884765,"scale": 36071.483527679447},{ "level": 15,"resolution":0.00004291534423828,"scale": 18035.741763839724},{ "level": 16,"resolution":0.00002145767211914,"scale": 9017.8708819198619},{ "level": 17,"resolution":0.00001072883605957,"scale":4508.9354409599309},{ "level": 18,"resolution":0.000005364418029785,"scale":2254.4677204799655}];
    },
    postCreate: function () {
    	this.inherited(arguments);		
			this._showInfoWindow();
			this.filterField="";
    },
    getFields:function(){
    	var d = new Deferred();
    	xhr.post(this.getFieldsUrl, {    			
	        handleAs: "text",
	        headers: {"X-Requested-With": null},
	        data:{fieldName:"PROJECT_ID",fieldValue:this.projectId}
	    }).then(lang.hitch(this,function(data){
	    	d.resolve(data);
	    	//console.log(this.fields);
	    })); 
	    return d;
    },
    getDataList:function(){
    	var d = new Deferred();
    	this.modelAsyn(this.url,null,function(data){
    		
    		d.resolve(data);
				//console.log(this._data);
    	},function(err){
    		console.log(err);
    	});
    	return d;
    },
    modelAsyn:function(url,data,callback,errhandle){
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
    deferredList:function(callback){    
      /*
       * 延迟异步获取图层字段
       * 
       * 
       * */
		  var d1 = this.getDataList();
		      //d2 = this.getFields();
		  var dl = new DeferredList([d1]);		
		  dl.then(lang.hitch(this,function(res){
		    // "res" is an array of results
		    console.log(res);
		    callback&&callback.apply(this,[res]);
		  }));
    },
    parseDeferred:function(res){
      /*
       * 解析异步获取的数据
       * 
       * 
       * */
	
    	res= JSON.parse(res[0][1]);	
			this._layerList = eval("("+res.data.layerList+")");
   
	    if(this._layerList != null && this._layerList.length>0){
        for(var i=0;i<this._layerList.length;i++){
            var  obj = this._layerList[i];
            this.addLoadMapLayer(obj,"1=1");
        }
      }
    	this._data =res.data.result;
    	this.projectData = eval("("+this._data+")");
    	this.recursiveData(this.projectData, this._listHtml,0);

    },
    startup: function () {
        this.inherited(arguments);
        this.deferredList(this.parseDeferred);
//	  		xhr.get(this.url, {
//		        handleAs: "json",
//		        headers: {"X-Requested-With": null}
//		    }).then(lang.hitch(this,function(data){
//		    	console.log(data);
//		    	this._layerList = eval("("+data.layerList+")");
//		   
//			    if(this._layerList != null && this._layerList.length>0){
//		        for(var i=0;i<this._layerList.length;i++){
//		            var  obj = this._layerList[i];
//		            this.addLoadMapLayer(obj,"1=1");
//		        }
//	        }
//		    	this._data = data.result;
//		    	this.projectData = eval("("+this._data+")");
//      	this.recursiveDirData(this.projectData, this._listHtml,0);		    	
//		    }));           
    },            		
  	recursiveDirData :function (parentObj,parentDom,childLever){
  		var collapse =  domConstruct.create("div",{'class':'layui-collapse','lay-accordion':""},parentDom);
  		//递归加载子菜单
  		if(parentObj && parentObj.length>0){  
				for(var i=0;i<parentObj.length;i++){
					  var resObj = parentObj[i];
					  var colla =  domConstruct.create("div",{'class':'layui-colla-item'},collapse);
					  var h2 =  domConstruct.create("h2",{'class':'layui-colla-title',
					  'innerHTML':"&nbsp;&nbsp;" + resObj.dataset_name + '<i class="layui-icon layui-colla-icon"></i>'
//					  'onclick':lang.hitch(this,function(evt){
//							query(".layui-colla-content",evt.target.parentNode.parentNode).removeClass("layui-show");	
//							//query(evt.target).addClass("layui-show");
//							console.log(evt);
//							query(".layui-colla-content",evt.target.parentNode).addClass("layui-show");								
//					  })
					  },colla);
					  var content =  domConstruct.create("div",{'class':'layui-colla-content'},colla);					  
					  var card =  domConstruct.create("div",{'class':'layui-card'},content);
					  
					  var ul =  domConstruct.create("ul",null,card);
					  childLever ++;
						if(resObj.mapLayers && resObj.mapLayers.length>0){
							var li = this.createItem(resObj.mapLayers[0],ul);
							//chilDom = this.recursiveDirData(resObj.mapLayers,card,childLever);	
						}
				}		
			}
  		return collapse;
  	},
  	recursiveData :function (projectData,parentDom,childLever){
  		//递归加载子菜单
  		debugger;
  		if(projectData && projectData.length>0){ 
  			var parentObj=projectData[0].children;
  			
  			var collapse =  domConstruct.create("div",{'class':'layui-collapse','lay-accordion':""},parentDom);
  			if(parentObj && parentObj.length > 0){
  				for(var i=0;i<parentObj.length;i++){
					  var resObj = parentObj[i];
					  var colla =  domConstruct.create("div",{'class':'layui-colla-item'},collapse);
					  var h2 =  domConstruct.create("h2",{'class':'layui-colla-title',
					  'innerHTML':"&nbsp;&nbsp;" + resObj.name + '<i class="layui-icon layui-colla-icon"></i>'
					  },colla);
					  var content =  domConstruct.create("div",{'class':'layui-colla-content'},colla);					  
					  var card =  domConstruct.create("div",{'class':'layui-card'},content);	
					  var cardItem =  domConstruct.create("div",{'class':'layers-item'},card);
					  
					  var ul =  domConstruct.create("ul",null,cardItem);
					  childLever ++;
						if(resObj.children && resObj.children.length>0){
							for(var j=0;j<resObj.children.length;j++){
								chilDom = this.recursiveItem(resObj.children[j],ul);
							}								
						}
					}		
  			}
			}
  		return ul;
  	},
		dgshowMapLayer :function (checkState,datachilds){
		  var layerchilds = datachilds.children;//图层列表
			if(layerchilds != null && layerchilds.length>0){
				for(var l=0;l<layerchilds.length;l++){
					var layerNode = layerchilds[l];
					domAttr.set(query(".ckc_"+layerNode.id)[0],"checked",checkState);	
					//domAttr.set("ckc_"+layerNode.id,"checked", checkState);					
					if(layerNode!=null&&layerNode.pg!=null&&layerNode.pg.DIR_TYPE=="2"){
						this.showVisbleMapLayer(checkState,layerNode);
					}else{
						this.dgshowMapLayer(checkState,layerNode);
					}
				}
			}
   },
    showVisbleMapLayer:function (flag,obj){
	    	 var layer = this.map.getLayer(obj.pg.ID);
	    	 var layerurl =  obj.layerUrl;   
	    	 if(layer!=null && layer.visible == (!flag)){
    	   	  if(flag){
		    		  layer.show();
		    		  //天地图
		    		  if(layerurl.indexOf("tianditu")!=-1){//天地图加载
		    			  var layer_bz = this.map.getLayer(obj.pg.ID+"_bz");
						  if(layer_bz){
		    			  layer_bz.show();
						  }
	    		  }
	    	  }else{
	    		  layer.hide();
	    		  //天地图
	    		  if(layerurl.indexOf("tianditu")!=-1){//天地图加载
	    			  var layer_bz = this.map.getLayer(obj.id+"_bz");
						  if(layer_bz){
		    			  layer_bz.hide();
						  }
	    		  }
	    	  }
	    	}
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
  		}else if(obj.LAYER_TYPE=="4"){//WMS服务
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
      }else if(obj.LAYER_TYPE=="3"){
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
    	  }else{
  
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
    },	
    showIW:function(g,ID){
      if (g.geometry.type == "point") {
        var point = g.geometry;
            //this.map.centerAndZoom(graphic.geometry, this.map.getNumLevels());
      } else {
        var point = g.geometry.getExtent().getCenter();
        //this.map.setExtent(graphic.geometry.getExtent().expand(5.5));
      }
      if(this.layerInfos.hasOwnProperty(ID)){
        if(!g.attributes.hasOwnProperty("imageUrl")&&this.layerInfos[ID].hasOwnProperty("imageUrl")){
          g.attributes["imageUrl"] = this.layerInfos[ID].imageUrl;
        } 
        var contentNode=this.iWcontentNode.apply(this,[g,this.layerTb[ID].fields,this.layerInfos[ID].iWstrLi]);
        var content = contentNode.domNode;
        var title = g.attributes[this.layerInfos[ID].titleField];
      }else{
        var content = this._getContent(g.attributes,this.layerTb[ID].fields,this.detailHandle);
        var title ="";
      }
      this.map.centerAndZoom(point,this.mapZoom).then(lang.hitch(this, function() {
        if(this.map.infoWindow.isShowing){
          this.map.infoWindow.hide();
        }                   
        this.map.infoWindow.setTitle(title);
        this.map.infoWindow.setContent(content);
        this.map.infoWindow.show(point);               
      }));
    },
    iWcontentNode:function(graphic,fields,iWstrLi){
      /*
       * 地图气泡
       * */
      var featureAttributes = graphic.attributes;
      var contentStr = lang.replace(iWstrLi,featureAttributes);
      var content = new IWContent({
        "content":contentStr,
        "closeback":lang.hitch(this,function(){
          this.map.infoWindow.hide();
        })
      });
//      content.addBtn({"innerHTML":"<i class='mdi mdi-file'></i>编辑","onclick":lang.hitch(this,function(){
//        this._editOnclick(graphic);
//        })},graphic);
      content.addBtn({"innerHTML":"<i class='mdi mdi-eye'></i>详情","onclick":lang.hitch(this,function(){
        this.detailHandle(featureAttributes,fields)
        })
      });
      return content;
    },
    _getContent: function(attributes,fields,callback) {
    	var flag = false;
    	if(callback){
    		flag = true;
    	}
    	var cp = new ContentPane({
        title: "详细信息"
      });
			var line = "",br = "",br1 = "",content = "",contentFull ="";
			for(var i=0;i<fields.length;i++){
				var field =fields[i];
				if(field.DISPLAYSHOW){
					contentFull += "<p class='detial-items'>" +  field.FIELD_NAME_CN + ":" +"<span>"+ attributes[field.FIELD_NAME]+"</span>" +"</p>" ;
				}
				if(field.DISPLAYSHOW){
					content += br +"<span>" +  field.FIELD_NAME_CN + ":" + attributes[field.FIELD_NAME] +"</span>" ;
        	br = "<br>";
				}				
			}
			if(flag){
				cp.set("content", content);
				var div = domConstruct.create("div",null,cp.domNode);
				var btn = domConstruct.create("input",{
					type:"button",
					id:"btn_info",
					value:"查看详细",
					onclick:lang.hitch(this,function(evt){
						callback&&callback.apply(this,[attributes,fields]);
					})
				},div);				
				return cp.domNode;
			}else{
				cp.set("content", contentFull);
				return cp.domNode;
			}
    },
    detailHandle:function(attributes,fields){
    	var contentFull = this._getContent(attributes,fields);
    	this.showDialog(contentFull,function(data){
    		
    	},function(err){
    		lang.hitch(this,setTimeout,this.Dialog.destroy(),0);
    	});
    },
    showDialog:function(content,onShow,onHide){
      /*
       * 弹窗自定义及
       * 开关事件
       * */
    	if(this.Dialog ){
    		this.Dialog.destroy();
    	}
			this.Dialog =new Dialog({
				title:"项目详情"	,
				content:content,
				onLoad:lang.hitch(this,function(data){
					console.log("1111111111111");
				}),
				onShow:lang.hitch(this,onShow),
				onHide:lang.hitch(this,onHide),
				style: "width: 400px;left:70px;top:0px;"
			});
      this.Dialog.startup();
			this.Dialog.show();
		},
    _showInfoWindow:function(){
    	//domClass.add(this.map.infoWindow.domNode, "onemap");
    	this.popup = new Popup({  
    		subclass:"onemap"
      }, dojo.create("div"));
			this.map.setInfoWindow(this.popup);
    },
    imgClick:	function (_id,_i){
    	/**a标签添加样式**/
    		if(this._layerObjs.length>0){
    		  var treeNode = layerObjs[_i];
    			if(treeNode.children && treeNode.children.length>0){
    				query("#"+_id +" a").addClass("dropdown-toggle");
    		  }
    		}
    },
    msgPrint:function(evt){
			console.log(evt);
			console.log(this._layerObjs);
			var layerid = domAttr.get(evt.target,"value");			
			var checkState = domAttr.get(evt.target,"checked");
			var parentUL = evt.currentTarget.parentNode.parentNode.parentNode;
			console.log(query("input:checked",parentUL));
			var parentLI = parentUL.parentNode;	
			var a = parentLI.firstChild;				
			if(checkState&&query("input:checked",parentUL).length == query("input",parentUL).length){
				domAttr.set(query("input",a)[0],"checked",true);		
			}else{
				domAttr.set(query("input",a)[0],"checked",false);
			}
			//this.map.getLayer("layer0").hide();
			var treeNode = this._layerObjs[layerid];
    	//if(treeNode.pg!=null&&treeNode.pg.DIR_TYPE=="2"){//2图层
    		this.showVisbleMapLayer(checkState,treeNode);
      //}else{
      //  this.dgshowMapLayer(checkState,treeNode);
    	//}	
		},
		checkDiv:function(evt){
			console.log(evt);
			console.log(this._layerObjs);
			var divId = domAttr.get(evt.currentTarget,"id");
			var divIdArr= divId.split('_');
			var layerid = divIdArr[1];
			var checkState = domAttr.get(evt.currentTarget,"value");
			
			var parentUL = evt.currentTarget.parentNode.parentNode.parentNode;
			console.log(query("input:checked",parentUL));
			var parentLI = parentUL.parentNode;	
			var a = parentLI.firstChild;				
			if(checkState){
				var idx = dojo.indexOf(this.selectIds,layerid);
				this.selectIds.splice(idx,1);
				evt.currentTarget.innerHTML = '<em>OFF</em><i></i>';	
				query(evt.currentTarget).removeClass("layui-form-onswitch")
			}else{
				this.selectIds.push(layerid);
				evt.currentTarget.innerHTML = '<em>ON</em><i></i>';
				query(evt.currentTarget).addClass("layui-form-onswitch");
			}
			domAttr.set(evt.currentTarget,"value",!checkState);
			//this.map.getLayer("layer0").hide();
			var treeNode = this._layerObjs[layerid];
			console.log(this.selectIds);
    	//if(treeNode.pg!=null&&treeNode.pg.DIR_TYPE=="2"){//2图层
    		this.showVisbleMapLayer(!checkState,treeNode);
      //}else{
      //  this.dgshowMapLayer(checkState,treeNode);
    	//}	
		},
    modelAsyn:function(url,data,callback,errhandle){
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
		createItem:function(obj,srcNodeRef){
			
			this._layerObjs[obj.id] = obj;
			var li = domConstruct.create("li",null,srcNodeRef);
			var a = domConstruct.create("a",{'style':{'cursor':"pointer"}},li);
//			var i1 = domConstruct.create("i",{
//					'class':"arrow fa fa-angle-down",
//					'onclick':lang.hitch(this,this.msgPrint)
//				},a);
//			var i2 = domConstruct.create("i",{
//					'class':"menu-icon glyphicon glyphicon-folder-open  purple",
//					'onclick':lang.hitch(this,this.msgPrint)
//				},a);
			var span = domConstruct.create("span",{
					'innerHTML': obj.dataset_name,
					'class':"menu-icon glyphicon glyphicon-folder-open  purple",
					'onclick':lang.hitch(this,this.msgPrint)
				},a);
			var opt;
			if(obj.checked){
				opt = {
					'id':"ckc_"+obj.id,
					'value':obj.checked,
					'innerHTML':'<em>ON</em><i></i>',
					'class':"layui-unselect layui-form-switch layui-form-onswitch",
					'onclick':lang.hitch(this,this.checkDiv)
				}
				this.selectIds.push(obj.id);
			}
			else{
				opt = {
					'id':"ckc_"+obj.id,
					'value':obj.checked,
					'innerHTML':'<em>OFF</em><i></i>',
					'class':"layui-unselect layui-form-switch",
					'onclick':lang.hitch(this,this.checkDiv)
				}
			}
			var input = domConstruct.create("div",opt,a);

			return li;
		},
		recursiveItem:function(obj,srcNodeRef){
			console.log(obj);
			this._layerObjs[obj.pg.ID] = obj;
			var li = domConstruct.create("li",null,srcNodeRef);
			var a = domConstruct.create("a",{'style':{'cursor':"pointer"}},li);
			var p = domConstruct.create("p",null,a);
//			var i1 = domConstruct.create("i",{
//					'class':"arrow fa fa-angle-down",
//					'onclick':lang.hitch(this,this.msgPrint)
//				},a);
//			var i2 = domConstruct.create("i",{
//					'class':"menu-icon glyphicon glyphicon-folder-open  purple",
//					'onclick':lang.hitch(this,this.msgPrint)
//				},a);
			var span = domConstruct.create("span",{
					'innerHTML': obj.name,
					'class':"menu-icon glyphicon glyphicon-folder-open  purple",
					'onclick':lang.hitch(this,this.msgPrint)
				},p);
			var opt;
			if(obj.checked){
				opt = {
					'id':"ckc_"+obj.pg.ID,
					'value':obj.checked,
					'innerHTML':'<em>ON</em><i></i>',
					'class':"layui-unselect layui-form-switch layui-form-onswitch",
					'onclick':lang.hitch(this,this.checkDiv)
				}
				this.selectIds.push(obj.pg.ID);
			}
			else{
				opt = {
					'id':"ckc_"+obj.pg.ID,
					'value':obj.checked,
					'innerHTML':'<em>OFF</em><i></i>',
					'class':"layui-unselect layui-form-switch",
					'onclick':lang.hitch(this,this.checkDiv)
				}
			}
			var input = domConstruct.create("div",opt,p);

			return li;
		}
  });
});