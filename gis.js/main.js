/*global require*/
/*jshint laxcomma:true*/
(function () {
  'use strict';
  require([
    'controllers/appcontroller', "esri/graphicsUtils", "esri/renderers/SimpleRenderer","dojo/dom","dijit/registry",'dojo/_base/lang',"esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/Color","esri/layers/GraphicsLayer",
    'services/mapservices',"esri/geometry/geometryEngine","esri/geometry/Extent","esri/tasks/query","dojo/_base/array","dojo/on","esri/graphic",'onemap/widgets/IWContent','onemap/widgets/Grid',
    'dojo/domReady!'
  ], function (appCtrl,graphicsUtils,SimpleRenderer,dom,registry,lang,SimpleFillSymbol,SimpleMarkerSymbol,SimpleLineSymbol,Color,GraphicsLayer, mapServices,geometryEngine,Extent,Query,array,on,Graphic,IWContent,Grid) {
    var $ = layui.jquery
    ,table = layui.table    
    ,laypage = layui.laypage
    ,vw = layui.view
    ,ed = layui.admin
  	,layer = layui.layer;
  	var tubanTemObj={};
  	var mapLoadingIdx,legendData=[],tbLyId=null,tbLyIdx = null,detLyId,count = 0 ,divWidth =  395,divHeight = 200,currentLegObj;
  	var layerCheckObj = {};
  	var villageJson =  {
		"layerName":"小区管理",
		"layerId":"8d6e22de24bc4d59bb543a8aabc7218f",
		"featureType":"polygon",
		"symbolType":"esri/symbols/SimpleFillSymbol",
		"symbol": {
			  "type": "esriSFS",
			  "style": "esriSFSSolid",
			  "color": [255,76,0,0],
			"outline": {
			 "type": "esriSLS",
			 "style": "esriSLSSolid",
			 "color": [255,110,0,255],
			 "width": 2
			  }
			},
		"highLightSml": {
			  "type": "esriSFS",
			  "style": "esriSFSSolid",
			  "color": [70,70,0],
			"outline": {
			 "type": "esriSLS",
			 "style": "esriSLSSolid",
			 "color": [0,255,255,255],
			 "width": 2
			  }
			},
		"titleField":"XQMC",
		"whereStr":"XQMC like '%{value}%'",
		"iWstrLi" : '<ul class="com-item"><li>小区管理员:<span>{XQGLY}</span></li><li>联系方式:<span>{LXFS}</span></li></ul>',
		"strLi":'<h4 class="card-title">{XQMC}</h4><div class="patrol-list-detial"><p><span class="title">所属街道：</span><span class="content">{SSJD}</span></p><p><span class="title">所属社区：</span><span class="content">{SSSQ}</span></p><p><span class="title">小区管理员：</span><span class="content">{XQGLY}</span></p><p><span class="title">联系方式：</span><span class="content">{LXFS}</span></p></div><hr />'
	  };

    villageJson.sml = new SimpleFillSymbol(villageJson.symbol);

    villageJson.hlSml = new SimpleFillSymbol(villageJson.highLightSml);
		var element = layui.element,form2 = layui.form,laytpl = layui.laytpl; //导航的hover效果、二级菜单等功能，需要依赖element模块
		//监听指定开关
			element.on("nav(toolsbar)",function(obj){
				var dataId = obj.attr("data-id");
				var html = obj.html();
				//工具栏——列表
				//测量按钮
				if(dataId =="measure"){
					var chNode =$("#measure-content");					
					if(chNode.length==0){			
						if(registry.byId("measure-content")){
							registry.byId("measure-content").destroy();
						}
						element.tabDelete('toolBox', 'measure');
						element.tabAdd('toolBox', {title:'测量工具', content:'<div class="measure-warp"><div id="measure-content"></div></div>', id: "measure"});
						mapCtrl.measureTool("measure-content");
						element.init();
						element.render('nav');
					}
					element.tabChange('toolBox', 'measure');	
					$("#toolBox").show();
				}
				//标绘按钮
				else if(dataId =="draw"){
					var chNode =$("#draw-content");
					console.log(chNode);
					if(chNode.length==0){
						if(registry.byId("draw-content")){
							registry.byId("draw-content").destroy();
						}
						element.tabDelete('toolBox', 'draw');
						element.tabAdd('toolBox', {title:'标绘工具', content:'<div class="draw-warp"><div id="draw-content"></div></div>', id: "draw"})
						mapCtrl.mapDrawMark("draw-content");
						element.init();
						element.render('nav');						
					}	
					element.tabChange('toolBox', 'draw');		
					$("#toolBox").show();
				}
				//多屏比对
				else if(dataId =="compare"){
					var chNode =$("#compare-content");
					console.log(chNode);

					if(chNode.length==0){
						if(registry.byId("compare-content")){
							registry.byId("compare-content").destroy();
						}
						element.tabDelete('toolBox', 'compare');
						element.tabAdd('toolBox', {title:'多屏比对', content:'<div class="compare-warp"><div id="compare-content"></div></div>', id: "compare"})
						mapCtrl.multiViewMap("compare-content",{"multiLoad":lang.hitch(this,function(){
							layui.element.init();
							layui.element.render('collapse');
						})});
					}	
					element.init();
					element.render('nav');
					element.tabChange('toolBox', 'compare');	
					$("#toolBox").show();
				}
				else if(dataId =="map-identify"){
					var url ="http://192.168.110.91:8080/waterproject/map/web/getLayer";
					var layerId= "04cd76f5875d4c50bb31cc3401af8540";
					var data ={
						"layerId":layerId,"spatialRel":"esriSpatialRelWithin",
						"geometryType":"esriGeometryPoint"
					};
					mapCtrl.mapIdentify().then(function(e){
						var point = e.mapPoint;
						var geoData ={"geometry":JSON.stringify(point)};
						var para =  Object.assign(geoData,data);
						mapCtrl.mapAsyn(url,para,function(res){
				    	console.log(res);
				    	res = JSON.parse(res);
				    	var features = res.data;
				    	if(features.length > 0){
				    		var id = identiNode.apply(this,[features,null,function(g){
									var options = 
									{
										cols:[[{field:'OBJECTID', title:'OBJECTID', width:80, fixed: 'left', unresize: true, sort: true,templet: function(x){
						        		var f = x.feature;
						        		var str ='';
						        		if(f.length > 0){
						        			for(var i=0;i<f.length;i++){
						        				str += '<em>'+ f[i].attributes.OBJECTID +'</em>'
						        			}
						        		}
						        		return str;
						      		}}
										]]
									};
				      		options.data = res.data;
									options.title = "点查列表";
									
									var ly_prop = {"elemId":"project","lyAlias":"项目防治","layerId":layerId};
									showLayTb(options,ly_prop);
								}]);
								var opt ={"content":id.domNode,"title":"查询全部结果"};
								showInfowindow(mapCtrl.map,e.mapPoint,opt);
				    	}
				    });
						console.log(e);
					});
				}
				else if(dataId =="project_list"){
						/*
					  * 项目列表按钮触发
					  */
					debugger;
					var layerId = "04cd76f5875d4c50bb31cc3401af8540";
	        var options = {
	        	"cols":[[{type: 'checkbox', fixed: 'left'}
				      ,{field:'prnm', title:'项目名称', width:80, fixed: 'left', unresize: true, sort: true,templet: function(x){
				        return '<em>'+ x.product.prnm +'</em>'
				      }}
				      ,{field:'username', title:'建设单位', width:120, edit: 'text', templet: function(x){
				        return '<em>'+ x.product.sjqy +'</em>'
				      }}
				      ,{field:'email', title:'建设状态', hide: true, width:150, edit: 'text', templet: function(x){
				        return '<em>'+ x.product.qdcs +'</em>'
				      }}
				      ,{field:'XQMC', title:'项目类型', width:100,templet: function(x){
				        return '<em>'+ x.product.xmlx +'</em>'
				      }}
				      ,{field:'XQMC', title:'关联图斑', width:100,templet: function(x){
				        return '<em>'+ x.product.xmlx +'</em>'
				      }}
				      ,{field:'XQMC', title:'项目合规性', width:100,templet: function(x){
				        return '<em>'+ x.product.xmlx +'</em>'
				      }}
				      ,{field:'XQMC', title:'批复文号', width:100,templet: function(x){
				        return '<em>'+ x.product.sanum +'</em>'
				      }}
				      ,{field:'XQMC', title:'批复时间', width:100,templet: function(x){
				        return '<em>'+ x.product.sadt +'</em>'
				      }}
				      ,{field:'XQMC', title:'审批部门', width:100,templet: function(x){
				        return '<em>'+ x.product.faspbm +'</em>'
				      }}
				      ,{field:'XQMC', title:'项目所属行业', width:100,templet: function(x){
				        return '<em>'+ x.product.prtype +'</em>'
				      }}
				      ,{field:'XQMC', title:'项目总投资（万元）', width:100,templet: function(x){
				        return '<em>'+ x.product.gcztz +'</em>'
				      }}
				      ,{field:'SSJD', title:'土建投资（万元）',templet: function(x){
				        return '<em>'+ x.product.tjtz +'</em>'
				      }}]]
	        	,parseData: function(res){	
							//获取数据，地图渲染
							console.log(res);
				    	var list = res.data.records;
				    	
			    		var features = [];
			    		var oids = [];
			    		var whereArr= [];
			        array.forEach(list, function(obj) {		
	    				  if(obj.product.hasOwnProperty("id")){
	    				  	whereArr.push(" ID = '" +obj.product["id"]+"' ");
					    	}
	    				  else if(obj.product.hasOwnProperty("uid_pr")){
					    		whereArr.push(" UID_PR = '" +obj.product["uid_pr"]+"' ");
					    	}
    				  	for(var i=0;i<obj.feature.length;i++){
				    			var f = obj.feature[i];
				    			var graphic = new Graphic(f);
				    			features.push(graphic);
				    		}
			        });
			        if(features.length > 0){
			        		var selExtent = graphicsUtils.graphicsExtent(features);
				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
			        }
			        var query = new Query();
			        console.log(whereArr);
	        		//query.objectIds = oids;
	        		//query.where = where;
	        		mapCtrl.map.getLayer(layerId).setDefinitionExpression(whereArr.join("or"));
	        		var elemId = "#lyId-" + layerId;
	        		mapCtrl.map.getLayer(layerId).show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox");
//	        		mapCtrl.map.getLayer(layerId).selectFeatures(query, 3,function(resp){
//	        			console.log(resp);
//	        			mapCtrl.map.getLayer(layerId).setSelectionSymbol(villageJson.hlSml);
//	        			if(resp.length>0){
//								var selExtent = graphicsUtils.graphicsExtent(resp);
//				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
//	        			}	        			
//	        		},function(err){
//	        			console.log(err);
//	        		});
				    	return {
				    		"code": res.code,
				    		"msg": res.message,
				    		"count": res.data.total,
				    		"data": res.data.records
				    	};
			    	}	        
	        };
		      options.url="http://192.168.110.91:8080/base/projectInfo/findProjectInfoListByPage";
					options.title = "项目列表";
					var ly_prop = {"elemId":"project","lyAlias":"项目防治","layerId":layerId};
					showLayTb(options,ly_prop);
				}
				else if(dataId =="tuban_list"){
					debugger;
					var layerId = "c7267b3420bf43cd93cabb0e19fdbfb6";
	        var options = {
	        	"cols":[[
	        	{type: 'checkbox', fixed: 'left'}
	          ,{field:'qdnm', title:'图斑编号', width:80, fixed: 'left', unresize: true, sort: true,templet: function(x){
							return '<em>'+ x.product.qdnm +'</em>'
					  }}
			      ,{field:'sfzdjg', title:'重点监管', width:120, edit: 'text', templet: function(x){
			        return '<em>'+ x.product.sfzdjg +'</em>'
			      }}
			      ,{field:'rst', title:'复核状态', hide: true, width:150, edit: 'text', templet: function(x){
			        return '<em>'+ x.product.rst +'</em>'
			      }}
			      ,{field:'XQMC', title:'关联状态', width:100,templet: function(x){
			        return '<em>'+ x.product.byd +'</em>'
			      }}
			      ,{field:'projectInfo', title:'关联项目', width:100,templet: function(x){
			        return '<em>'+ x.product.projectInfo +'</em>'
			      }}
			      ,{field:'byd', title:'扰动合规性', width:100,templet: function(x){
			        return '<em>'+ x.product.byd +'</em>'
			      }}
			      ,{field:'qdcs', title:'建设状态', width:100,templet: function(x){
			        return '<em>'+ x.product.qdcs +'</em>'
			      }}
			      ,{field:'qdtype', title:'扰动变化类型',templet: function(x){
			        return '<em>'+ x.product.qdtype +'</em>'
			      }}]]
		        ,parseData: function(res){	
						//获取数据，地图渲染
				    	var list = res.data.records;				    	
			    		var features = [];
			    		var oids = [];
			        var whereArr= [];

			        array.forEach(list, function(obj) {		
	    				  if(obj.product.hasOwnProperty("id")){
	    				  	whereArr.push(" ID = '" +obj.product["id"]+"' ");
					    	}
	    				  else if(obj.product.hasOwnProperty("uid_pr")){
					    		whereArr.push(" UID_PR = '" +obj.product["uid_pr"]+"' ");
					    	}
    				  	for(var i=0;i<obj.feature.length;i++){
				    			var f = obj.feature[i];
				    			var graphic = new Graphic(f);
				    			features.push(graphic);
				    		}
			        });
			        if(features.length > 0){
			        		var selExtent = graphicsUtils.graphicsExtent(features);
				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
			        }
			        console.log(whereArr);
			        console.log(res);
	        		mapCtrl.map.getLayer(layerId).setDefinitionExpression(whereArr.join("or"));
	        		var elemId = "#lyId-" + layerId;
	        		mapCtrl.map.getLayer(layerId).show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox");
				    	return {
				    		"code": res.code,
				    		"msg": res.message,
				    		"count": res.data.total,
				    		"data": res.data.records
				    	};
			    	}
	        };
		      options.url="http://192.168.110.91:8080/base/projAreaMapspot/findProjAreaMapspotListByPage";
					options.title = "图斑列表";
					//showLayTb(options,"tuban","图斑");
					var ly_prop = {"elemId":"tuban","lyAlias":"区域图斑","layerId":layerId};
					showLayTb(options,ly_prop);
				}
				else if(dataId =="biaozhu_list"){
					debugger;
					var layerId = "ba82079fa7164549ab0367ededc1d3f5";
	        var options = {
		        	cols:[[
			        	{type: 'checkbox', fixed: 'left'}
			          ,{field:'marknw', title:'标注名称', width:80, fixed: 'left', unresize: true, sort: true,templet: function(x){
									return '<em>'+ x.product.marknw +'</em>'
							  }}
					      ,{field:'ptype', title:'所属项目', width:120, edit: 'text', templet: function(x){
					        return '<em>'+ x.product.ptype +'</em>'
					      }}
					      ,{field:'mapspot_id', title:'图斑编号', width:100, templet: function(x){
					        return '<em>'+ x.product.mapspot_id +'</em>'
					      }}
					      ,{field:'create_time', title:'标记时间', width:100,templet: function(x){
					        return '<em>'+ x.product.create_time +'</em>'
					      }}
					      ,{field:'iswt', title:'是否存在问题', width:100,templet: function(x){
					        return '<em>'+ x.product.iswt +'</em>'
					      }}
					      ,{field:'wtms', title:'问题描述', width:100,templet: function(x){
					        return '<em>'+ x.product.wtms +'</em>'
					      }}
					      ,{field:'iswh', title:'是否造成危害', width:100,templet: function(x){
					        return '<em>'+ x.product.iswh +'</em>'
					      }}
					      ,{field:'whms', title:'危害描述',templet: function(x){
					        return '<em>'+ x.product.whms +'</em>'
					      }}
			      	]]
		        	,parseData: function(res){	
						//获取数据，地图渲染
				    	var list = res.data.records;
				    	console.log(res);
			    		var features = [];
			    		var oids = [];
			        var whereArr= [];
			        array.forEach(list, function(obj) {		
	    				  if(obj.product.hasOwnProperty("id")){
	    				  	whereArr.push(" ID = '" +obj.product["id"]+"' ");
					    	}
	    				  else if(obj.product.hasOwnProperty("uid_pr")){
					    		whereArr.push(" UID_PR = '" +obj.product["uid_pr"]+"' ");
					    	}
    				  	for(var i=0;i<obj.feature.length;i++){
				    			var f = obj.feature[i];
				    			var graphic = new Graphic(f);
				    			features.push(graphic);
				    		}
			        });
			        if(features.length > 0){
			        		var selExtent = graphicsUtils.graphicsExtent(features);
				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
			        }
	        		mapCtrl.map.getLayer(layerId).setDefinitionExpression(whereArr.join("or"));
	        		var elemId = "#lyId-" + layerId;
	        		mapCtrl.map.getLayer(layerId).show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox");
				    	return {
				    		"code": res.code,
				    		"msg": res.message,
				    		"count": res.data.total,
				    		"data": res.data.records
				    	};
			    	}
	        
        	};
      		options.url="http://192.168.110.91:8080/base/projTag/findProjTagListByPage";
					options.title = "标注列表";
					//showLayTb(options,"biaozhu","标注");
					
					var ly_prop = {"elemId":"biaozhu","lyAlias":"区域图斑","layerId":layerId};
					showLayTb(options,ly_prop);
				}
				else if(dataId =="query"){
					element.tabChange('toolBox', 'query');
					$("#toolBox").show();
				}
				else if(dataId =="map-layersCtrl"){
//					var chNode =$("#layersCtrl-content");
//					console.log(chNode);
//					if(chNode.length==0){
//						element.tabAdd('toolBox', {title:'图层控制', content:'<div class="layers-warp"><form class="layui-form"><div  id="layersCtrl-content"></div></form></div>', id: "layersCtrl"});
//						layersCtrl();
//					}		
					element.tabChange('toolBox', 'layersCtrl');
					$("#toolBox").show();
				}
				else if(dataId == 'toolBoxMenu'){
					$("#toolBox").toggle();
				}
			});

			//工具栏——列表
			//图层控制条件
			element.on("nav(tuban-condition)",function(obj){
				var proId = obj.attr("data-id");
				if(proId == "tuban-cause1"){
					mapCtrl.esriRequest("data/test/projectData.json",function(res){	
		    		var list = res.data.list;
		    		var features = [];
		        array.forEach(list, function(obj) {		
		          var graphic = new Graphic(obj.feature);		          
		          features.push(graphic);
		        });
		        mapCtrl.map.getLayer("pg_project").clear();
        		mapCtrl.map.getLayer("pg_project").applyEdits(features, null, null);
		    	});
				}
				else if(proId == "tuban-cause2"){
					console.log(proId);
				}
			});
			//图形搜索
			element.on("nav(queryList)",function(obj){
				var dataId = obj.attr("data-id");	
				var proId = dataId.split("-")[0];
				var html = obj.html();
				var url = "http://192.168.110.91:8080/waterproject/map/web/getLayer";
				var options = {cols:[[
	        	{type: 'checkbox', fixed: 'left'}
          ,{field:'qdnm', title:'图斑编号', width:80, fixed: 'left', unresize: true, sort: true,templet: function(x){
						console.log(x);
						return '<em>'+ x.product.qdnm +'</em>'
				  }}
		      ,{field:'sfzdjg', title:'重点监管', width:120, edit: 'text', templet: function(x){
		        return '<em>'+ x.product.sfzdjg +'</em>'
		      }}
		      ,{field:'rst', title:'复核状态', hide: true, width:150, edit: 'text', templet: function(x){
		        return '<em>'+ x.product.rst +'</em>'
		      }}
		      ,{field:'XQMC', title:'关联状态', width:100,templet: function(x){
		        return '<em>'+ x.product.byd +'</em>'
		      }}
		      ,{field:'projectInfo', title:'关联项目', width:100,templet: function(x){
		        return '<em>'+ x.product.projectInfo +'</em>'
		      }}
		      ,{field:'byd', title:'扰动合规性', width:100,templet: function(x){
		        return '<em>'+ x.product.byd +'</em>'
		      }}
		      ,{field:'qdcs', title:'建设状态', width:100,templet: function(x){
		        return '<em>'+ x.product.qdcs +'</em>'
		      }}
		      ,{field:'qdtype', title:'扰动变化类型',templet: function(x){
		        return '<em>'+ x.product.qdtype +'</em>'
		      }}]]
				};
		      
		    var queryLayerId = "c7267b3420bf43cd93cabb0e19fdbfb6";
		    var queryLayer = mapCtrl.map.getLayer(queryLayerId);
		    queryLayer.clearSelection();
				if(proId == "circle"){
					mapCtrl.drawTool("circle").then(function(evt){
						console.log(JSON.stringify(evt.geometry));
						debugger;
						var datastr ={layerId:queryLayerId,"geometry":JSON.stringify({"rings":evt.geometry.rings})};
						console.log(JSON.stringify(datastr));
						mapCtrl.mapAsyn(url,datastr,function(res){
							console.log(res);
							res = JSON.parse(res);
				    	var list = res.data;
			    		var features = [];
			    		var oids = [];
			    		var whereArr =[];
			        array.forEach(list, function(obj) {	
      				  if(obj.feature.length > 0){
					    		for(var i=0;i<obj.feature.length;i++){
					    			var f = obj.feature[i];
					    			var graphic = new Graphic(f);
					    			features.push(graphic);
					    			whereArr.push(" OBJECTID = '" + f.attributes.OBJECTID +"' ");
					    			oids.push(f.attributes.OBJECTID);
					    		}
					    		var selExtent = graphicsUtils.graphicsExtent(features);
				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
					    	}			          
			        });
	        		queryLayer.setDefinitionExpression(whereArr.join("or"));        		
	        		var elemId = "#lyId-" + queryLayerId;
	        		queryLayer.show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox");
							options.data = res.data;
							options.title = "区域图斑圆形搜索";
							
							var ly_prop = {"elemId":"tuban","lyAlias":"区域图斑","layerId":queryLayerId};
							showLayTb(options,ly_prop);
						})						
					});
				}
				else if(proId == "rectangle"){
					mapCtrl.drawTool("rectangle").then(function(evt){				
						var datastr ={layerId:queryLayerId,"geometry":JSON.stringify({"rings":evt.geometry.rings})};
						console.log(datastr);
						mapCtrl.mapAsyn(url,datastr,function(res){
							res = JSON.parse(res);
							console.log(res);
				    	var list = res.data;
			    		var features = [];
			    		var oids = [];
			    		var whereArr =[];
			        array.forEach(list, function(obj) {	
      				  if(obj.feature.length > 0){
					    		for(var i=0;i<obj.feature.length;i++){
					    			var f = obj.feature[i];
					    			var graphic = new Graphic(f);
					    			features.push(graphic);
					    			whereArr.push(" OBJECTID = '" + f.attributes.OBJECTID +"' ");
					    			oids.push(f.attributes.OBJECTID);
					    		}
	    						var selExtent = graphicsUtils.graphicsExtent(features);
				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
					    	}			          
			        });
	        		queryLayer.setDefinitionExpression(whereArr.join("or"));	        		
	        		var elemId = "#lyId-" + queryLayerId;
	        		queryLayer.show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox");
			        options.data = res.data;
							options.title = "区域图斑框形搜索";
							
							var ly_prop = {"elemId":"tuban","lyAlias":"区域图斑","layerId":queryLayerId};
							showLayTb(options,ly_prop);
						})
					});
				}
				else if(proId == "polyline"){
					var bufInt = parseInt(html);
					if(isNaN(bufInt)){
						var buf = prompt("请输入缓冲距离：",15);
						var bufInt = parseInt(buf);
					}
					mapCtrl.drawTool("polyline").then(function(evt){
						var bufferGeo = geometryEngine.geodesicBuffer([evt.geometry], [isNaN(bufInt)?15:bufInt], 9036);
						console.log(bufferGeo);
						var datastr ={layerId:"c7267b3420bf43cd93cabb0e19fdbfb6","geometry":JSON.stringify({"rings":bufferGeo[0].rings})};
		    		mapCtrl.mapAsyn(url,datastr,function(res){							
							res = JSON.parse(res);
							console.log(res);
				    	var list = res.data;
			    		var features = [];
			    		var oids = [];
			    		var whereArr =[];
			        array.forEach(list, function(obj) {	
      				  if(obj.feature.length > 0){
					    		for(var i=0;i<obj.feature.length;i++){
					    			var f = obj.feature[i];
					    			var graphic = new Graphic(f);
					    			features.push(graphic);
					    			whereArr.push(" OBJECTID = '" + f.attributes.OBJECTID +"' ");
					    			oids.push(f.attributes.OBJECTID);
					    		}
					    		var selExtent = graphicsUtils.graphicsExtent(features);
				    			mapCtrl.map.setExtent(selExtent.expand(5.5));
					    	}			          
			        });
	        		queryLayer.setDefinitionExpression(whereArr.join("or"));       		
	        		var elemId = "#lyId-" + queryLayerId;
	        		queryLayer.show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox"); 		
							options.data = res.data;
							options.title = "区域图斑线形搜索";

							var ly_prop = {"elemId":"tuban","lyAlias":"区域图斑","layerId":queryLayerId};
							showLayTb(options,ly_prop);
						})
					});
				}
			});
			//图层控制
			element.on("nav(layerCtrlList)",function(obj){
				var proId = obj.attr("data-id");
				if(proId == "tuban"){
					console.log(proId);
				}
				else if(proId == "project"){

				}
				else if(proId == "annote"){
					console.log(proId);
				}				
			});
		  //监听导航点击
		  element.on('tab(toolbox)', function(item){
		    console.log(elem)
		    //底图切换
//		    if($(item.elem.context).hasClass("myBaseMap")){
//		    	mapCtrl.mapGallery("myBaseMap-content");
//		    }
		  });
		  element.on('tabDelete(toolBox)',function(e){
		  	console.log(e.elem);
		  	var id  = $(this).parent().attr('lay-id');
		  	switch(id){
		  		case 'draw':
		  			mapCtrl.drawbar.clear();
		  			break;
		  		case 'measure':
		  			mapCtrl.measurebar.clear();
		  			break;
		  			case 'compare':
		  			mapCtrl.myOverView.escScreen();
		  			break;
		  	}
		  	//console.log(e.elem.getAttribute('lay-id'));
		  })
		//底图切换
		var basemapBtn = document.getElementById('basemapBtn');
		basemapBtn.onclick = lang.hitch(this,function(e){
			var chNode =$("#myBaseMap-content").children();
			console.log(chNode);
//			if(registry.byId("myBaseMap-content")){
//				registry.byId("myBaseMap-content").destroy();
//			}
			if(chNode.length == 0 ){
				mapCtrl.mapGallery("myBaseMap-content");
			}else{
				$(".myBaseMap-warp").toggle();
			}
		});
		$(".myBaseMap-warp").click(function(){
			$(this).hide();
		})
		//搜索按钮
		var searchBtn = document.getElementById('map-search');
		searchBtn.onclick =lang.hitch(this,function(eClk){
//				mapCtrl.esriRequest("data/test/villagesData.json",lang.hitch(this,function(res){
//					console.log("aaaaaaaa");
//					var features = dojo.map(res.data.list,function(item,idx){
//						return item.feature
//					});
//		      var config = {
//		      	nums:20,
//		        strLi : villageJson.strLi,
//		        titleField:villageJson.titleField,
//		        fields : villageJson.fields,
//		        highLightSymbol : villageJson.highlightSml,
//		        symbol : villageJson.sml,
//		        featureType : villageJson.featureType,
//		        iWcontentNode:lang.hitch(this,iWcontentNode)
//		      };
//				mapCtrl.search("map-grid",features,config);
//				
//				
//	    	}))		
debugger;
					var layerId = "04cd76f5875d4c50bb31cc3401af8540";
					var searchTxt = document.getElementById("map-searchTxt").value;
	        var options = {
	        	cols: [[
				      {type: 'checkbox', fixed: 'left'}
				      ,{field:'uid_pr', title:'uid_pr', width:80, fixed: 'left', unresize: true, sort: true,templet: function(x){
				        return '<em>'+ x.product.uid_pr +'</em>'
				      }}
				      ,{field:'prnm', title:'生产建设项目名称', width:120, edit: 'text', templet: function(x){
				        return '<em>'+ x.product.prnm +'</em>'
				      }}
				      ,{field:'prtype', title:'项目所属行业', hide: true, width:150, edit: 'text', templet: function(x){
				        return '<em>'+ x.product.prtype +'</em>'
				      }}
				      ,{field:'xmxz', title:'项目性质', width:100,templet: function(x){
				        return '<em>'+ x.product.xmxz +'</em>'
				      }}
				      ,{field:'xmlx', title:'项目类型',templet: function(x){
				        return '<em>'+ x.product.xmlx +'</em>'
				      }}
				      
				    ]]
				    ,parseData: function(res){	
				    	//获取数据，地图渲染
							console.log(res);
							var list = res.data.records;
			    		var features = [];
			    		var whereArr= [];
			        array.forEach(list, function(obj) {		
	    				  if(obj.product.hasOwnProperty("id")){
	    				  	whereArr.push(" ID = '" +obj.product["id"]+"' ");
					    	}
	    				  else if(obj.product.hasOwnProperty("uid_pr")){
					    		whereArr.push(" UID_PR = '" +obj.product["uid_pr"]+"' ");
					    	}
			        });
			        console.log(whereArr);
	        		mapCtrl.map.getLayer(layerId).setDefinitionExpression(whereArr.join("or"));
	        		var elemId = "#lyId-" + layerId;
	        		mapCtrl.map.getLayer(layerId).show();
	        		$(elemId).attr("checked",true);
	        		layui.form.render("checkbox");
				      return {
				        "code": res.code
				        ,"msg": res.message
				        ,"count": res.data.total
				        ,"data": res.data.records
				      };
				    }
						,where: {
							projectName: ''+searchTxt
						}
					};
		      options.url="http://192.168.110.91:8080/waterproject/map/web/searchByProjectName";
					options.title = "搜索列表";
					var ly_prop = {"elemId":"project","lyAlias":"项目防治","layerId":layerId};
					showLayTb(options,ly_prop);
		});
    //地图初始化
		layer.load(1, {shade: true});
    
    var mapCtrl = appCtrl.init({
      elem: 'map',
      mapOptions: {
        //basemap: 'gray',
        extent: new Extent({
		      "xmin":117.84598507495897,"ymin":24.452872042962895,"xmax":118.16355862232226,"ymax":24.613890414544926,
		      "spatialReference":{"wkid":4490}
		    }),
        logo:false,slider:true,
        zoom: 1
      },
      basemap: mapServices.loadServices(),
      //地图加载完成事件
      mapLoad:lang.hitch(this,function(obj){
      	console.log(this);
      	var layerui = layui.layer;
      	layerui.closeAll('loading');
      	//layerui.load(1, {shade: false,area: ['250px', '250px'],offset: 'rt',skin:"xadmin-loading"});
      	var scale = obj.map.getScale();
	    	$("#map-scale").html(scale);
	    	var legurl ="http://192.168.110.91:8080/waterproject/map/web/getListDirLayer";
	    	mapCtrl.mapAsyn(legurl,null,function(res){
	    		res = JSON.parse(res);
	    		var data = res.data;	    		
	    		var layerList  = JSON.parse(data.layerList);
	    		console.log(layerList);

	    		var result = JSON.parse(data.result);
	    		console.log(result);
	    		legendData= [];	    		
	    		dojo.map(layerList,lang.hitch(this,function(item,idx){
	    			if(item.LAYER_TYPE == 3){
	    				legendData.push(item);
	    			}
	    			mapCtrl.addLoadMapLayer(item,"1=1");
	    		}));	    		
	    		legendInit();
	    		layersCtrl(result[0]);
	    	})
//  		var chNode =$("#layersCtrl-content").children();
//				console.log(chNode);
//				if(chNode.length==0){
//					var opt = {
//						//url:""
//					};					
//					//mapCtrl.mapLayersCtrl(opt,"layersCtrl-content");
//				}
//				
//				var interval = setInterval(function(){
//					console.log("element----test");
//					var chNode =$("#layersCtrl-content .sidebar").children();
//			    if(chNode.length > 0){
//			    	layerui.closeAll('loading');
//						element.init();
//						element.render('collapse');
//		        clearInterval(interval);		        
//		        console.log("element.init()");
//		        return;
//			    }
//				}, 2000);

//	    	on(mapCtrl.map.graphics,"click",function(event){
//	    		var graphic = event.graphic;
//		    	var contentNode= iWcontentNode.apply(null,[graphic]);
//		      if (graphic.geometry.type == "point") {
//		        var point = graphic.geometry;
//		        //mapCtrl.map.centerAndZoom(graphic.geometry, mapCtrl.map.getNumLevels());
//		      } else {
//		        var point = graphic.geometry.getExtent().getCenter();
//		        //mapCtrl.map.setExtent(graphic.geometry.getExtent().expand(5.5));
//		      }
//		      mapCtrl.map.centerAndZoom(point,5).then(lang.hitch(this, function() {      
//		          var featureAttributes = graphic.attributes;
//		          var title = "";
//		          if(this.titleField&&this.titleField !=""){
//		            title = featureAttributes[this.titleField];
//		          }         
//		          mapCtrl.map.infoWindow.setTitle("title");
//		          mapCtrl.map.infoWindow.setContent(contentNode.domNode);
//		          mapCtrl.map.infoWindow.show(point); 
//		      }));
//		    });
	    }),
	    //底图加载完成事件
	    basemapLoad:function(basemap){
	    	console.log(basemap);	    		
	    },
	    //缩放加载完成事件
	    zoomEnd:function(obj){
	    	console.log(obj)
	    	$("#map-scale").html(mapCtrl.map.getScale());
	    }
    });
    //图层symbol样式
    var config=[
		{
    	"layerDefinition" : {
          "geometryType": "esriGeometryPolygon",
          "objectIdField": "OBJECTID",
          "selectSymbol": {
				    "type": "esriSFS",
				    "style": "esriSFSSolid",
				    "color": [0,0,0,0],
				    "outline": {
				     "type": "esriSLS",
				     "style": "esriSLSSolid",
				     "color": [0,255,0,55],
				     "width": 2
				    }
				  },
				 "drawingInfo": {
				  "renderer": {
				   "type": "uniqueValue",
				   "field1": "XMZT",
				   "field2": null,
				   "field3": null,
				   "fieldDelimiter": ", ",
				   "defaultSymbol": {
				    "type": "esriSFS",
				    "style": "esriSFSSolid",
				    "color": [0,0,0,0],
				    "outline": {
				     "type": "esriSLS",
				     "style": "esriSLSSolid",
				     "color": [255,255,0,255],
				     "width": 2
				    }
				   },
				   "defaultLabel": "未知",
				   "uniqueValueInfos": [
				    {
				     "symbol": {
				      "type": "esriSFS",
				      "style": "esriSFSSolid",
				      "color": [0,0,0,0],
				      "outline": {
				       "type": "esriSLS",
				       "style": "esriSLSSolid",
				       "color": [0,255,0,255],
				       "width": 2
				      }
				     },
				     "value": "正常",
				     "label": "正常",
				     "description": ""
				    },
				    {
				     "symbol": {
				      "type": "esriSFS",
				      "style": "esriSFSSolid",
				      "color": [0,0,0,0],
				      "outline": {
				       "type": "esriSLS",
				       "style": "esriSLSSolid",
				       "color": [255,0,0,255],
				       "width": 2
				      }
				     },
				     "value": "异常",
				     "label": "异常",
				     "description": ""
				    },
				    {
				     "symbol": {
				      "type": "esriSFS",
				      "style": "esriSFSSolid",
				      "color": [ 0, 0, 0, 0],
				      "outline": {
				       "type": "esriSLS",
				       "style": "esriSLSSolid",
				       "color": [  255,  255,  255,  255 ],
				       "width": 2
				      }
				     },
				     "value": "缺失",
				     "label": "缺失",
				     "description": ""
				    },
				    {
				     "symbol": {
				      "type": "esriSFS",
				      "style": "esriSFSSolid",
				      "color": [ 0, 0, 0, 0 ],
				      "outline": {
				       "type": "esriSLS",
				       "style": "esriSLSSolid",
				       "color": [  255, 0, 255,  255],
				       "width": 2
				      }
				     },
				     "value": "其他",
				     "label": "其他",
				     "description": ""
				    }
				   ]
				  },
				  "transparency": 0,
				  "labelingInfo": [
				   {
				    "labelPlacement": "esriServerPolygonPlacementAlwaysHorizontal",
				    "where": null,
				    "labelExpression": "[SCJSXM]",
				    "useCodedValues": true,
				    "symbol": {
				     "type": "esriTS",
				     "color": [ 178,178,178,255],
				     "backgroundColor": null,
				     "borderLineColor": null,
				     "borderLineSize": null,
				     "verticalAlignment": "bottom",
				     "horizontalAlignment": "center",
				     "rightToLeft": false,
				     "angle": 0,
				     "xoffset": 0,
				     "yoffset": 0,
				     "kerning": true,
				     "haloColor": null,
				     "haloSize": null,
				     "font": {
				      "family": "SimSun",
				      "size": 12,
				      "style": "normal",
				      "weight": "normal",
				      "decoration": "none"
				     }
				    },
				    "minScale": 0,
				    "maxScale": 0
				   }
				  ]
				 },
          "fields": [{
            "name": "ObjectID",
            "alias": "ObjectID",
            "type": "esriFieldTypeOID"
          }, {
            "name": "description",
            "alias": "Description",
            "type": "esriFieldTypeString"
          }, {
            "name": "title",
            "alias": "Title",
            "type": "esriFieldTypeString"
          }]
        },
    	    "featureSet": {
            "features": [],
            "geometryType": "esriGeometryPolygon"
         },
         'id':"pg_project"
    }];
    var featureLayers = mapServices.loadFeatureLayers(config);
    //底图加载图层
    mapCtrl.layersLoad(featureLayers).then(function(obj){
    	
//  	var layers = obj.layers;
//  	console.log(layers);
//  	for(var i=0;i<layers.length;i++){
//  		layers[i].layer.setSelectionSymbol(villageJson.highlightSml);
//  		console.log(layers[i].layer);
//  	}
    });
    /*
     * 展示数据
     * ly_prop
     *     ly_prop.elemId;
					 ly_prop.lyAlias;
					 y_prop.layerId;
     */
    function showLayTb(options,ly_prop){
    						/*
					  * 图斑列表按钮触发
					  */
					 var lyName = ly_prop.elemId;
					 var lyAlias = ly_prop.lyAlias;
					 var layerId = ly_prop.layerId;
					  if(tbLyId != null){
					  	layui.layer.close(tbLyIdx);
					 	  tbLyId.remove();
					 	  tbLyId = null;
					 	  tbLyIdx = null;
					  };
						ed.popup(
							{
		            title: options.title,
		            area: ["100%", "410px"],
		            shade: 0,
		            closeBtn:1,
		            anim: 2,
		            maxmin:1,
		            offset: 'rb',
		            id: "LAY-popup-content-edit",
		            min:function(e){
		            	mapCtrl.map.getLayer(layerId).clearSelection();
		            	mapCtrl.map.infoWindow.hide();
		            },
		            end:function(e){
		            	console.log("end");
		            	mapCtrl.map.getLayer(layerId).clearSelection();
		            	mapCtrl.map.infoWindow.hide();
		            	//mapCtrl.map.getLayer(layerId).setDefinitionExpression("1=1");
		            },
		            cancel: function(e){
		            	console.log("cancel");
		            	mapCtrl.map.getLayer(layerId).clearSelection();
		            	mapCtrl.map.infoWindow.hide();
		            	mapCtrl.map.getLayer(layerId).setDefinitionExpression("1=1");
		            },
	            success: function(t, e) {
	            		tbLyId =t ;
	            		tbLyIdx =e;
	            		console.log(e);
	            		var fields =[
									      {type: 'checkbox', fixed: 'left'}
									      ,{fixed: 'right', title:'操作', toolbar: '#barDemo', width:150}
									    ];
									var fieldNew = options.cols[0].concat(fields);
									options.cols[0] = fieldNew;
							    var opts =  {
									    elem: '#'+lyName+'-tb'
									    ,height: 300
									    ,title: '用户数据表'
									    //,url: url
									    ,none:"目前没有数据！"
									    //,size: 'lg'
									    ,page: !0
									    //,autoSort: false
									    //,loading: false
									    //,totalRow: true
									    ,method:"post"
									    ,limit: 2
									    ,limits: [2,10, 15, 20, 25, 30]
									    //,defaultToolbar: ['filter']   "attributes": {
									    //,cols: [fields]
									    ,text: "对不起，加载出现异常！"
									    ,done: function() {
									        //r.render("progress")
									    }   
									    ,where:options.where
									    ,request: {
										    pageName: "pageNo" 
										    ,limitName: "pageSize" 
										  }
									    ,response: {
									      statusName: 'code'
									      ,statusCode: 200
									    }
									    ,parseData: function(res){	
									    	//获取数据，地图渲染
												console.log(res);
									      return {
									        "code": res.code
									        ,"msg": res.msg
									        ,"count": res.data.total
									        ,"data": res.data.records
									      };
									    }
									  };
								  var optNew =  Object.assign(opts,options);
								  console.log(options);
								  console.log(optNew);
	                vw(this.id).render( lyName+ "-list", null).done(function() {
	                	var table=layui.table;
									  table.render(optNew);
              			//监听行工具事件
									  table.on('tool('+lyName+'-tb)', function(obj){
									    var data = obj.data;
									    console.log(obj)
									    if(obj.event === 'geolocate'){
									    	
									    	mapCtrl.map.getLayer(layerId).clearSelection();
									    	mapCtrl.map.graphics.clear();
									    	mapCtrl.map.getLayer(layerId).setSelectionSymbol(villageJson.hlSml);
									    	var oids = [];
									    	var render = new SimpleRenderer();
												mapCtrl.map.graphics.setRenderer(render);
									    	if(data.feature.length > 0){
									    		for(var i=0;i<data.feature.length;i++){
									    			var f = data.feature[i];
									    			var graphic = new Graphic(f);
									    			mapCtrl.map.graphics.add(graphic);
									    			oids.push(f.attributes.OBJECTID);
									    		}
									    		var selExtent = graphicsUtils.graphicsExtent(mapCtrl.map.graphics.graphics);
								    			mapCtrl.map.setExtent(selExtent.expand(5.5));
									    	}		

									    	var query = new Query();
									    	query.objectIds= oids;
									    	var renderSymbol = null;
									    	var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 3), new Color([255,0,0,0.2]));
											  var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3);
											  var markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 8,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]),3), new Color([255, 0, 0]));
												
									    	var geoType = mapCtrl.map.getLayer(layerId).geometryType;
							    			if(geoType == "esriGeometryPolygon"){
													//graphic.setSymbol(fillSymbol);
													renderSymbol = fillSymbol;
													villageJson.hlSml = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,255,255]), 2), new Color([70,70,0,0.6]));;
												}
												else if(geoType == "esriGeometryPolyline"){
													//graphic.setSymbol(lineSymbol);
													renderSymbol = lineSymbol;
													villageJson.hlSml = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,255,255]), 2);
												}
												else if(geoType == "esriGeometryPoint"){
													//graphic.setSymbol(markerSymbol);
													renderSymbol = markerSymbol;
													villageJson.hlSml = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 8,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,255,255]),2), new Color([70,70,0,0.6]));
												}
//TODO
//定位缩放
//												if (graphic.geometry.type == "point") {
//													mapCtrl.map.centerAndZoom(graphic.geometry, mapCtrl.map.getNumLevels());
//								        } else {
//								        	mapCtrl.map.setExtent(graphic.geometry.getExtent().expand(5.5));
//								        }

												var isShowLine = true;
												var showCount = 0;

												//设置地物闪烁效果 闪烁三次
												var showInterval = setInterval(function(){
													if(isShowLine){
														if(showCount >= 2){
															clearInterval(showInterval);
															mapCtrl.map.graphics.clear();
												    	mapCtrl.map.getLayer(layerId).selectFeatures(query,3
												    	,function(e){
												    		//e[0].setSymbol(new SimpleFillSymbol());
												    		mapCtrl.map.getLayer(layerId).setSelectionSymbol(villageJson.hlSml);
												    		console.log("success",e);
												    		debugger;
												    	},function(e){
												    		console.log("error",e);
												    	});
															//graphic.symbol = null;
															return;
														}
														showCount++;
														isShowLine = false;
														render.symbol = renderSymbol;
														mapCtrl.map.graphics.redraw();
													}
													else{
														isShowLine = true;
														//graphic.setSymbol(null);
														render.symbol = null;
														mapCtrl.map.graphics.redraw();
													}
												},300);
									    }
									    else if(obj.event === 'detail'){
									    	console.log(data);
									    	$.ajax({
							            url: "./"+lyName+"-detail.html",
							            type: "get",
							            dataType: "html",
							            success: function(res) {
							            	debugger;
											      laytpl(res).render(data, function(html){
															detLyId = ed.popup({
											            title: lyAlias +"详情",
											            area: ["700px", "600px"],
											            shade: 0,
											            closeBtn:1,
											            maxmin:0,
											            content:'<iframe style="width:100%;height:100%" scrolling="auto" allowtransparency="true" id="admin-layer-iframe" srcdoc=\''+html+'\' name="layui-layer-iframe1"  class="layui-layer-load" frameborder="0"></iframe>',
											            success: function(t, e) {						
											            	console.log($(t).find("iframe").attr("id"));
											            }
													    });
														});
							            }
							          });
									    }
									    else if(obj.event === 'tuban-noChecked-detail'){
									    	$.ajax({
							            url: "./tuban-detail.html",
							            type: "get",
							            dataType: "html",
							            success: function(res) {
							            	debugger;
											      laytpl(res).render(data, function(html){											
															detLyId = ed.popup(
																{
											            title: lyAlias + "详情",
											            area: ["700px", "600px"],
											            shade: 0,
											            closeBtn:1,
											            maxmin:0,
											            content:'<iframe style="width:100%;height:100%" scrolling="auto" allowtransparency="true" id="admin-layer-iframe" srcdoc=\''+html+'\' name="layui-layer-iframe1"  class="layui-layer-load" frameborder="0"></iframe>',
											            success: function(t, e) {						
											            	console.log($(t).find("iframe").attr("id"));
											            }
													    });
														});
							            }
							          });
									    }
								    })	                	
	                })
	            }
					  });	

    }
    function layersCtrl(data){
    	/*
    	 * 图层控制
    	 * 关键字搜索
    	 */
    	console.log(data);
    	var tplTemplate = `
				<div class="layui-collapse" lay-accordion="">
				{{#  layui.each(d.children, function(index, group){ }}
				    <div class="layui-colla-item">
					    <h2 class="layui-colla-title">{{ group.name }}<i class="layui-icon layui-colla-icon"></i></h2>
					    <div class="layui-colla-content">					    	
								<div class="layui-card">
									<div class="layers-item">
										<ul>
										{{#  layui.each(group.children, function(index, item){ }}
										
											{{#if(item.checked == true) { }}  
												<li>
													<a>
														<p><span>{{ item.name }}</span>&nbsp;&nbsp;<input type="checkbox" checked name="open" lay-skin="switch" lay-filter="layer_switch" id="lyId-{{item.pg.ID}}" lay-id="{{item.pg.ID}}" lay-text="ON|OFF"></p>
														<div id="key-{{item.pg.ID}}" style="display:block;"></div>
													</a>
												</li>	
											{{# } else { }}  
											  <li>
													<a>
														<p><span>{{ item.name }}</span>&nbsp;&nbsp;<input type="checkbox"  name="close" lay-skin="switch" lay-filter="layer_switch"  id="lyId-{{item.pg.ID}}"  lay-id="{{item.pg.ID}}" lay-text="ON|OFF"></p>
														<div id="key-{{item.pg.ID}}" style="display:none;"></div>
													</a>
											  </li>
											{{# } }}  

										{{#  }); }}
										</ul>
									</div>
								</div>
				    	</div>

				  	</div>
				{{#  }); }}	
				</div>
    	`;
				laytpl(tplTemplate).render(data, function(html){
					$("#layersCtrl-content").html(html);
					element.init();
					element.render('collapse');
					layui.form.render();
					layui.form.on("switch(layer_switch)",function(e){
				  	var layerId = e.elem.getAttribute('lay-id');
				  	console.log(layerId);
				  	console.log(this);
				  	layerCheckObj[layerId] = [];
				  		var childNode = $("#key-" +layerId).children();
				  		if(childNode.length ==0){
				  			/*
				  			 * 获取图层关键字
				  			 */
					  		mapCtrl.mapAsyn("http://192.168.110.91:8080/waterproject/map/web/getSearchKey",{"layerId":layerId},function(res){
					  			console.log(res);
					  			res = JSON.parse(res);
					  			if(res.data.length > 0){
					  				$("#key-" + layerId).html("");
					  				var keytpl = ` 
												<ul>
												{{#  layui.each(d.data, function(index, item){ }}		
														<li >
															<input type="checkbox" name="like" title="{{item.key_cname}}" lay-filter="key_word"  lay-id="key-id-{{item.id}}">
														</li>
												{{#  }); }}
												</ul>
							    	`;
						    	
							    	laytpl(keytpl).render(res, function(html){
							    		$("#key-" + layerId).html(html);
							    		layui.form.render();
											layui.form.on("checkbox(key_word)",function(obj){
												var layId = obj.elem.getAttribute('lay-id');
					  						console.log(layId);
												var strArr = layId.split("-");
												var id = strArr[2];
												console.log(id);
												if(obj.elem.checked){												
													layerCheckObj[layerId].push(id);
												}
												else{
													var a = layerCheckObj[layerId].indexOf(id);
													layerCheckObj[layerId].splice(a,1);
												}
												/*
												 * 获取图层关键的where条件语句
												 */
												var url ="http://192.168.110.91:8080/waterproject/map/web/searchWhereBySearchKey";
												console.log(layerCheckObj[layerId].join(","));
												if(layerCheckObj[layerId].length > 0){
													mapCtrl.mapAsyn(url,{ids:layerCheckObj[layerId].join(",")},function(e){
														console.log(e);
														var resp = JSON.parse(e);
														console.log(resp.data.where);
														mapCtrl.map.getLayer(layerId).setDefinitionExpression(resp.data.where);
													});
												}else{
													mapCtrl.map.getLayer(layerId).setDefinitionExpression("1=1");
												}
											});
							    	});
					  			}
					  			else{
					  				$("#key-" + layerId).html("<ul><li><p>&nbsp;&nbsp;&nbsp;&nbsp;目前没有查询条件</p></li></ul>");
					  			}

					  		})
				  		}
				  		$("#key-" +layerId).toggle();
				  	if(this.checked){
				  		mapCtrl.map.getLayer(layerId).show();
				  	}
				  	else{
				  		mapCtrl.map.getLayer(layerId).hide();
				  	}
					});
				});
//  			mapCtrl.mapAsyn("http://192.168.110.91:8080/waterproject/map/web/getLayerListByLayerType",null,function(res){	
//          	console.log(res);
//          	res = JSON.parse(res);
//
//		    	});
    }
    function showInfowindow(map,geometry,opt){
      /*
       * 气泡居中
       * 及设置气泡内容
       */

      if (geometry.type == "point") {
        var point = geometry;
        //mapCtrl.map.centerAndZoom(graphic.geometry, mapCtrl.map.getNumLevels());
      } 
      else {
        var point = geometry.getExtent().getCenter();
        //mapCtrl.map.setExtent(graphic.geometry.getExtent().expand(5.5));
      }
      map.centerAndZoom(point,5).then(lang.hitch(this, function() {           
          map.infoWindow.setTitle(opt.title);
          map.infoWindow.setContent(opt.content);
          map.infoWindow.show(point); 
      }));
    }
    		//信息面板
    function identiNode(graphics,closeBack,detailBack){
      /*
       * 地图气泡
       * */
      var contentStr = '<ul class="com-item">'
      
      if(graphics!=null&&graphics.length > 0){
	      for(var i=0;i<graphics.length;i++){
	      	var feature = graphics[i].feature;
	      	for(var j=0;j<feature.length;j++){
	      		contentStr +='<li>objectid:<span>'+feature[j].attributes.OBJECTID+'</span></li>';
	      	}	      	
	      }
      }
			contentStr +='</ul>';

      var content = new IWContent({
        "content":contentStr,
        "closeback":lang.hitch(this,function(g){        	
        	mapCtrl.infoHide();
        	closeBack&&closeBack.apply(this,g);
        })
      });
      content.addBtn({"innerHTML":"<i class='mdi mdi-eye'></i>查看全部","onclick":lang.hitch(this,function(g,e){
        console.log(e);
        console.log(g);
        detailBack&&detailBack.apply(this,[g]);     
        
        },graphics)
      });

      return content;
    }
		//信息面板
    function iWcontentNode(graphic,closeBack,detailBack){
      /*
       * 地图气泡
       * */
      var featureAttributes = graphic.attributes;
      var contentStr = lang.replace(villageJson.iWstrLi,featureAttributes);
      var content = new IWContent({
        "content":contentStr,
        "closeback":lang.hitch(this,function(g){        	
        	mapCtrl.infoHide();
        	closeBack&&closeBack.apply(this,g);
        })
      });
      content.addBtn({"innerHTML":"<i class='mdi mdi-eye'></i>详情","onclick":lang.hitch(this,function(g,e){
        console.log(e);
        console.log(g);
        detailBack&&detailBack.apply(this,[g]);     
        
        },graphic)
      });
      
      return content;
    }
    function renderTb(nodeId,url,opt){
    	var option = {
		    elem: nodeId
		    ,height: 350
		    ,title: '用户数据表'
		    ,url: url
		    //,size: 'lg'
		    ,page: !0
		    //,autoSort: false
		    //,loading: false
		    ,totalRow: true
		    ,limit: 5
		    ,limits: [5,10, 15, 20, 25, 30]
		    //,defaultToolbar: ['filter']
		    ,cols: [[
		      {type: 'checkbox', fixed: 'left'}
		      ,{field:'id', title:'ID', width:80, fixed: 'left', unresize: true, sort: true, totalRowText: '合计：'}
		      ,{field:'username', title:'用户名', hide: true, width:120, edit: 'text', templet: '#usernameTpl'}
		      ,{field:'email', title:'邮箱', hide: true, width:150, edit: 'text', templet: function(x){
		        return '<em>'+ x.email +'</em>'
		      }}
		      ,{field:'sex', title:'性别', width:80, edit: 'text', sort: true}
		      ,{field:'city', title:'城市', width:100}
		      ,{field:'sign', title:'签名'}
		      ,{field:'experience', title:'积分', width:80, sort: true, totalRow: true}
		      ,{field:'ip', title:'IP', width:120}
		      ,{field:'logins', title:'登入次数', width:100, sort: true, totalRow: true}
		      ,{field:'joinTime', title:'加入时间', width:120}
		      ,{fixed: 'right', title:'操作', toolbar: '#bar' +nodeId, width:150}
		    ]]
		    ,text: "对不起，加载出现异常！"
		    ,done: function() {
		        r.render("progress")
		    }    
		    ,response: {
		      statusName: 'code'
		      ,statusCode: 0
		    }
		    ,parseData: function(res){
		    	console.log(res);
		      return {
		        "code": res.code
		        ,"msg": res.msg
		        ,"count": res.count
		        ,"data": res.data.list
		      };
		    }		    
		  }    	
  	  table.render(option);
    }
    function renderPage(nodeId){
    	  //调用分页
		  laypage.render({
		    elem: nodeId
		    ,curr:0
		    ,count: data.length
		    ,layout: ['prev', 'page', 'next', 'refresh', 'skip']
		    ,jump: function(obj,first){
		    	console.log(obj);
		    	layer.msg(obj.curr);
		      //模拟渲染
		      document.getElementById('biuuu_city_list').innerHTML = function(){
		        var arr = []
		        ,thisData = data.concat().splice(obj.curr*obj.limit - obj.limit, obj.limit);
		        layui.each(thisData, function(index, item){
		          arr.push('<li>'+ item +'</li>');
		        });
		        return arr.join('');
		      }();
		    }
		  });
    }
//  var legendData =[
//        {"LAYER_TABLE":"0","visible":"0","dataInfo":null,"LAYER_NAME":"小区管理","ALPHA":1,"index":1,"DIR_TYPE":"2","queryType":1,"DATASET_ID":"9c4eb38d9c934ce5b73f5c779edc6c1b","SERVICE_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/village/MapServer","FEATURE_TYPE":"3","LAYER_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/village/MapServer","SEQUENCE":1,"LAYER_TYPE":"3","ID":"052933feefe7495f9cf5b62032a54fca","opacity":1,"LOAD_TYPE":"1"},
//        {"LAYER_TABLE":"0","visible":"0","dataInfo":null,"LAYER_NAME":"人员管理","ALPHA":1,"index":2,"DIR_TYPE":"2","queryType":1,"DATASET_ID":"9c4eb38d9c934ce5b73f5c779edc6c1b","SERVICE_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/person/MapServer","FEATURE_TYPE":"1","LAYER_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/person/MapServer","SEQUENCE":5,"LAYER_TYPE":"3","ID":"59e2ca4f7e3f4faea48f2ce3caefe430","opacity":1,"LOAD_TYPE":"1"},
//        {"LAYER_TABLE":"0","visible":"0","dataInfo":null,"LAYER_NAME":"问题上报","ALPHA":1,"index":4,"DIR_TYPE":"2","queryType":1,"DATASET_ID":"9c4eb38d9c934ce5b73f5c779edc6c1b","SERVICE_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/QuestionPoi/MapServer","FEATURE_TYPE":"1","LAYER_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/QuestionPoi/MapServer","SEQUENCE":4,"LAYER_TYPE":"3","ID":"8ad20ae6cba94afe93a412058127035d","opacity":1,"LOAD_TYPE":"1"},
//        {"LAYER_TABLE":"0","visible":"0","dataInfo":null,"LAYER_NAME":"垃圾投放点","ALPHA":1,"index":5,"DIR_TYPE":"2","queryType":1,"DATASET_ID":"9c4eb38d9c934ce5b73f5c779edc6c1b","SERVICE_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/LJTFD/MapServer","FEATURE_TYPE":"2","LAYER_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/LJTFD/MapServer","SEQUENCE":5,"LAYER_TYPE":"3","ID":"0df344120634494eb6de7db0faeb9fc5","opacity":1,"LOAD_TYPE":"1"},
//        {"LAYER_TABLE":"0","visible":"0","dataInfo":null,"LAYER_NAME":"巡查路线","ALPHA":1,"index":5,"DIR_TYPE":"2","queryType":1,"DATASET_ID":"9c4eb38d9c934ce5b73f5c779edc6c1b","SERVICE_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/InspectLine/MapServer","FEATURE_TYPE":"2","LAYER_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/InspectLine/MapServer","SEQUENCE":5,"LAYER_TYPE":"3","ID":"9a73fe8652e3407dae9a8d2a84a46eda","opacity":1,"LOAD_TYPE":"1"},
//        {"LAYER_TABLE":"0","visible":"0","dataInfo":null,"LAYER_NAME":"预设巡查路线","ALPHA":1,"index":5,"DIR_TYPE":"2","queryType":1,"DATASET_ID":"9c4eb38d9c934ce5b73f5c779edc6c1b","SERVICE_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/inspectBefLine/MapServer","FEATURE_TYPE":"2","LAYER_URL":"http://47.110.125.120:6080/arcgis/rest/services/LJFL/inspectBefLine/MapServer","SEQUENCE":5,"LAYER_TYPE":"3","ID":"5c99943ac0464853963d98633572b46e","opacity":1,"LOAD_TYPE":"1"}];
//       
  	/**界面显示图例***/
  	/*
  	 * 图例方法开始
  	 */
		function legendInit() {
        //创建图例页面
				showLegendsViewTab(legendData);

			  $('#myLegends').find("li").click(lang.hitch(this,function (e) {
           var tabId = e.currentTarget.id;
           var index = parseInt(tabId.charAt(tabId.length-1));
          $("#myLegends li").removeClass("active");
					$(e.currentTarget).addClass("active");
            loadShowLayerLegends(index);
        }));
        $("#moreLayers").find("li").click(lang.hitch(this,function(e){
        	console.log(e);
        	var tabId = e.currentTarget.id;
          var index = parseInt(tabId.charAt(tabId.length-1));
        	console.log(e);
        	  loadShowLayerLegends(index);
        }));
        $("#morelayerGroup").click(function(e){
        	var _this = $(e.currentTarget);
        	if(_this.hasClass("open")){
        		_this.removeClass("open");
        	}
        	else{
        		_this.addClass("open");
        	};
        });
      }
    function selectLegend(index){
		    if(legendData!=null && legendData.length>0){
		        currentLegObj = legendData[index];
		        if( currentLegObj == null){
		            return ;
		        }
		        //设置图层
		        setLayerIndex( currentLegObj,"first");
		    }
		}	
		function setLayerIndex(obj,state){
				//state =置顶first up上移 down下移 last置底
			    var flag = false;
			    var index = obj.index;
			    if(state == "first"){
			        //修改显示图层显示顺序
			        if( legendData != null &&  legendData.length>0&&(index< ( legendData.length-1))){
			            for(var i=0;i< legendData.length;i++){
			                var layerObj =  legendData[i];
			                var layer = mapCtrl.map.getLayer(layerObj.ID);
			                //设置向上
			                if((layerObj.ID==obj.ID) && (layerObj.index == index)){
			                    layerObj.index = ( legendData.length-1);
			                     currentLegObj = layerObj;
			                    flag = true;
			                }
			                if((layerObj.ID!=obj.ID) && (layerObj.index > index)){
			                    layerObj.index = layerObj.index-1;
			                }
			            }
			        }
			    }
			    else if(state == "up"){
			        //index = ((obj.index+1)<=this.data.length?(obj.index+1):(this.data.length));
			        //修改显示图层显示顺序
			        if( legendData != null &&  legendData.length>0&&(( legendData.length- currentLegObj.index)<= 4)&&( legendData.length- currentLegObj.index)>1){
			            for(var i=0;i< legendData.length;i++){
			                var layerObj =  legendData[i];
			                var layer = mapCtrl. map.getLayer(layerObj.ID);
			                //设置向上
			                if((layerObj.ID==obj.ID) && (layerObj.index == index)){
			                    layerObj.index = index+1;
			                     currentLegObj = layerObj;
			                    flag = true;
			                }
			                if((layerObj.ID!=obj.ID) && (layerObj.index == (index+1))){
			                    layerObj.index = index;
			                }
			            }
			        }
			    }
			    else if(state == "down"){
			        //index = ((obj.index-1)>=0?(obj.index-1):0);
			        //修改显示图层显示顺序
			        if( legendData != null &&  legendData.length>0&&(( legendData.length- currentLegObj.index)<maxTab)){
			            for(var i=0;i< legendData.length;i++){
			                var layerObj =  legendData[i];
			                var layer = mapCtrl. map.getLayer(layerObj.ID);
			                //设置向下
			                if((layerObj.ID==obj.ID) && (layerObj.index == index)){
			                    layerObj.index = index-1;
			                     currentLegObj = layerObj;
			                    flag = true;
			                }
			                if((layerObj.ID!=obj.ID) && (layerObj.index == (index-1))){
			                    layerObj.index = index;
			                }
			            }
			        }
			    }
			    else if(state == "last"){
			        //修改显示图层显示顺序
			        if( legendData != null &&  legendData.length>0&&(( legendData.length- currentLegObj.index)<4)){
			            for(var i=0;i< legendData.length;i++){
			                var layerObj =  legendData[i];
			                var layer = mapCtrl. map.getLayer(layerObj.ID);
			                //设置向下
			                if((layerObj.ID==obj.ID) && (layerObj.index == index)){
			                    layerObj.index = ( legendData.length - 4);
			                     currentLegObj = layerObj;
			                    flag = true;
			                }
			                if((layerObj.ID!=obj.ID) && (layerObj.index < index)){
			                    layerObj.index = layerObj.index+1;
			                }
			            }
			        }
			    }
			    //重新排序
			    if(flag){
			         showLegendsViewTab( legendData);
			    }
			}
		window.showDiv = function (){				
			  var divWidth =  395;//div宽度
			  var divHeight = 200;//div高度
				if( count % 2 == 0){
					  //设置显示
					  if( legendData!=null &&  legendData.length > 4){
						  $("#morelayerGroup").css("display","");
					  }
					  $("#legendContent").css("display","");
					  $("#expandbutton").removeClass("expand_div_zs") ;
					  $("#expandbutton").addClass("expand_div_yx");
						 $("#legendDiv").animate({height:divHeight,width:divWidth},function(){
							 //透明度设置
							 $("#td_legendframe").css("display","");
							  //比例尺设置
							 $("#scalebar").animate({left:$("#legendDiv").width()+$("#legendDiv").offset().left+20});
							 $("#mapxydiv").animate({left:$("#legendDiv").width()+$("#legendDiv").offset().left+20});

						 });

				}
				else{
					 //设置隐藏
					$("#morelayerGroup").css("display","none");
					$("#legendContent").css("display","none");
					$("#td_legendframe").css("display","none");

					$("#expandbutton").removeClass("expand_div_yx") ;
					$("#expandbutton").addClass("expand_div_zs");
          $("#legendDiv").animate({height:20,width:20},function(){
                  	  //比例尺设置
					  $("#scalebar").animate({left:$("#legendDiv").width()+$("#legendDiv").offset().left+20});
					  $("#mapxydiv").animate({left:$("#legendDiv").width()+$("#legendDiv").offset().left+20});
				  });
				}
				 count++;
			}
/*
 * 图例方法结束
 */
		function showLegendsViewTab(_legendsTabs){
				/**加载图例**/
			    $("#legendDiv").css("display","");
			    $("#layerLegDiv").html("");
			    $("#myLegends").html('');
			    $("#morelayerGroup").css("display","none");
			    if(( count % 2) != 0){
			        $("#td_legendframe").css("display","");
			    }
			    else{
			        $("#td_legendframe").css("display","none");
			    }
			    $("#moreLayers").html("");
			    var currentIndex = 0;
			    if( legendData !=null &&  legendData.length>0){
			        //legendsArr =  data;
			        var _index = 0;
			        for(var i=(_legendsTabs.length-1);i>=0;i--){
			            var legendObj = _legendsTabs[i];
			            if(_index<=4){//最大tab树
		                var tabname = legendObj.LAYER_NAME;
		                if(tabname.length > 4){
		                    tabname = tabname.replace(/[“”0-9a-zA-Z-]/g,"").substring(0,4);
		                }
		                var htmlstr = "";
		                htmlstr = "<li style=\"width: 80px;\" id=\"leg_tab_li_"+i+"\"><a data-toggle=\"tab\"  id=\"tab_"+i+"\" class=\"nav_a\"     title=\""+legendObj.LAYER_NAME+"\" >"+tabname+"</a></li>";
		                $("#myLegends").append(htmlstr);
			            }
			            else{
		                var showLable = legendObj.LAYER_NAME;
		                if(showLable.length > 8){
		                    showLable = showLable.replace(/[“”0-9a-zA-Z-]/g,"").substring(0,8);
		                }
		                if(( count % 2) != 0){
		                    $("#morelayerGroup").css("display","");
		                }
		                var htmlstr = "<li id=\"leg_tab_li_"+i+"\"><a  id=\"tab_"+i+"\"  title=\""+legendObj.LAYER_NAME+"\"  tabindex=\"-1\" >"+showLable+"</a></li>";
		                $("#moreLayers").append(htmlstr);
			            }
			            _index ++;
			        }
			        if( currentLegObj == null||( currentLegObj!=null &&  legendData.length- currentLegObj.index)>5){
			            $("#leg_tab_li_"+( legendData.length-1)).addClass("active");
			             loadShowLayerLegends( legendData.length-1);
			        }
			        else{
			            $("#leg_tab_li_"+ currentLegObj.index).addClass("active");
			             loadShowLayerLegends( currentLegObj.index);
			        }
			    }
			    else{
			        $("#legendDiv").css("display","none");
			    }
			}
		function loadShowLayerLegends(index){					
					/**Tab选中并加载地图图例****/
			    if( legendData!=null &&  legendData.length>0){
			         currentLegObj =  legendData[index];
			        console.log( currentLegObj);
			        debugger;
			        if( currentLegObj == null ){
			            return ;		        
			        }
			        var layurl =  currentLegObj.LAYER_URL;
			        if(layurl == "addImageLayer"){
			            layurl == "addImageLayer"
			        }if(layurl!=null && layurl.indexOf("/ogc/")!=-1){//在线服务地址
			            layurl = layurl.replace("?accessKey=", "/legend?f=pjson&accessKey=");
			        }else if(layurl!=null && layurl.indexOf("tianditu")!=-1){//天地图
			            layurl = "";
			        }else if(layurl!=null && layurl.indexOf("wms")!=-1){//wms
			            layurl = "";
			        }else{
			            layurl =  currentLegObj.LAYER_URL+"/legend?f=pjson";
			        }
			        layurl = encodeURI(layurl);
			        //获取图层图例
			        if(layurl == "addImageLayer"){
			            $("#layerLegDiv").html("");
			            $("#legendframe").attr("src","layerLegend.jsp");
			        }else if(layurl != ""){
			        	 mapCtrl.mapAsyn(layurl,null,function(r){
			                    var info = eval('(' + r + ')');
			                     showLegUI(info, currentLegObj,index);
			                },function(err){
			                    /*if(errback){
			                        errback(r.responseText);
			                    }*/
			                });
			        }else{
			            //图层透明度重新设置
			            $("#legendframe").attr("src","layerLegend.jsp");
			        }
			    }
			}
		function showLegUI(resultObj,_currentLegObj,index){
			/**界面显示图例***/
			    $("#layerLegDiv").html("");
			     currentLegObj =  legendData[index];
			    if( currentLegObj == null){
			        return ;
			    }			
			    //解析图层图例结果
			    var layers =  resultObj.layers;
			    if(layers != null && layers.length>0){
			        var htmlstr = "";
			        //图层透明度重新设置
			        
			        for(var i=0;i<layers.length;i++){
			            var _obj = layers[i];
			            var cuIds =  ","+ currentLegObj.LAYER_TABLE+",";
			            if(cuIds.indexOf(","+_obj.layerId+",")!=-1){
			                var _legArr = _obj.legend ;
			                console.log(_obj);
			                htmlstr += "<div><span  style=\"font-size:12px;\">&nbsp;"+_obj.layerName+"（"+(_obj.layerId)+"）</span></div>";//标题
			                htmlstr +="<table style=\"margin:0px;\">";
			                if(_legArr!=null && _legArr.length>0){
			                    for(var j=0;j<_legArr.length;j++){
			                        var _legObj = _legArr[j];
			                        var legname = _legObj.label;
			                        if(legname.length > 4){
			                            legname = legname.substring(0,4);
			                        }
			                        if((j%3) == 0 ){
			                            if(j==0){
			                                htmlstr += "<tr>";
			                            }else{
			                                htmlstr += "</tr><tr>";
			                            }
			                        }
			                        //base64图片加载
			                        htmlstr += "<td style=\"width:160px;cursor:pointer;\"  title =\""+_legObj.label+"\" ><img  style=\"opacity: "+ currentLegObj.ALPHA+"\"  src=\"data:"+_legObj.contentType+";base64,"+_legObj.imageData+"\" /> <span style=\"font-size: 12px;color: #858585;\">"+legname+"</span></td>";
			                    }
			                }
			                htmlstr +="</tr></table>";
			            }
			
			        }
			        //绘制图例
			        $("#layerLegDiv").append(htmlstr);
			    }
			}	
		function fakeClick(obj) { 
       　　var ev = document.createEvent("MouseEvents");
　　　　ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
　　　　obj.dispatchEvent(ev);
　　}

　　function exportRaw(name, data) {
　　　　var urlObject = window.URL || window.webkitURL || window;
　　　　var export_blob = new Blob([data]);
　　　　var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
　　　　save_link.href = urlObject.createObjectURL(export_blob);
　　　　save_link.download = name;
　　　　fakeClick(save_link);
　　}

　　function saveFile(){
			$.ajax({
				type:"get",
				url:"data/test/idiom.json",
				async:true,
				success:function(e){
						var inValue =""
						for(var i=0;i<e.length;i++){
							var word = e[i].word;
							inValue += word;
							inValue += "\n";
							var py = e[i].pinyin
							inValue += py;
							inValue += "\n";
						}
						exportRaw('data/test/idiom.txt', inValue);
				}
			});　　　
　　}
  });
})();
