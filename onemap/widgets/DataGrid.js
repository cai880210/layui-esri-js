define(["dojo/dom-attr","dojo/dom-class","dojo/dom",
  'dojo/_base/declare',"dojo/dom-style",
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  "dojo/dom-construct","dojo/request/xhr","dojo/request/script",
  'dojo/topic',
  'dojo/aspect',
  'dojo/query',
  'dojo/on',"esri/layers/GraphicsLayer","esri/graphic","esri/geometry/Multipoint","esri/geometry/geometryEngine",
	"esri/toolbars/draw",
	"esri/toolbars/edit","dojo/text!./templates/DataGrid.html",
  "dojo/_base/connect",'dojo/on',"dijit/_Widget", "dijit/_Templated",
  'jquery','onemap/widgets/jquery.easyPaging','onemap/widgets/jquery.paging'
],
function(domAttr,domClass,dom,declare,domStyle,lang, array, html,domConstruct,xhr,script, topic, aspect, query,
	on,GraphicsLayer,Graphic,Multipoint,geometryEngine,Draw,Edit,template,connect, on,_Widget, _Templated,$) {
	var clazz = declare([_Widget, _Templated], {
    // DemoWidget code goes here 
    //please note that this property is be set by the framework when widget is loaded.
    templateString: template,
		_data:null,
		features:null,
		Dialog:null,
		titlefield:null,
		editToolbar:null,
		editEndHandle:null,
		targetItem:{},
		highLightSymbol:null,
		tempLayer:null,
		symbol:null,
		geoShowable:true,
		map:null,
		geometryService:null,
		geometry:null,
		isClick:true,
		constructor:function(options,srcRefNode){	
			this.inherited(arguments);		
			this.features = options.features;
			this.pageOptions = options.pageOptions;	
			this.nums = options.nums;
			this.mapZoom = options.mapZoom;
			//this.geometryService = (options.hasOwnProperty("geometryService")) ? options.geometryService :null;
			this.strLi = options.strLi;
			this.closeback = (options.hasOwnProperty("closeback")) ? options.closeback :null;
			this.iWcontentNode = (options.hasOwnProperty("iWcontentNode")) ? options.iWcontentNode :null;
//			new IWContent({
//        "title":title,
//        "content":contentStr,
//        "closeback":lang.hitch(this,function(e){
//          this.map.infoWindow.hide();
//          this.closeback&&this.closeback.apply(null,e);
//        })
//      })
			this.geoShowable = (options.hasOwnProperty("geoShowable")) ? options.geoShowable :true;
			this.fields = options.fields;
			this.titleField = (options.hasOwnProperty("titleField")) ? options.titleField :null;
			this.editable = (options.hasOwnProperty("editable")) ? options.editable :false;
      this.highLightSymbol = options.highLightSymbol;
      console.log(options.highLightSymbol);
			this.symbol = options.symbol;			
			this.featureType = options.featureType;
			this.map = options.map;
		},
		init:function(){
			this.listInit();
			this.features = [];
      this.dataLayer.clear();
      this.tempLayer.clear();
			domConstruct.empty(this._listHtml);
			domStyle.set(this.dataListBox, "display", "none");
      domStyle.set(this.NoSearchlist, "display", "none");
			$("#" + this.id + "Paging").html(`<li class="page-item">
          <span aria-hidden="true">«</span>
          <span class="sr-only">Prev</span>
        </li>
        <li class="page-item">#n</li>
        <li class="page-item">#n</li>
        <li class="page-item">#c</li>
        <li class="page-item">
          <span aria-hidden="true">»</span>
          <span class="sr-only">Next</span>
        </li>`);
		},

		listInit:function(){
			if(this.targetItem.hightLightFlag){
				this.targetItem.hightLightFlag = false;
				var i = dojo.indexOf(this.features,this.targetItem.graphic);
				this.features[i].setSymbol(this.symbol);
			}
			if(this.map.infoWindow.isShowing){
	  		this.map.infoWindow.hide();
	  	}	
		},
		resetList:function(features,nums,pageOptions){			
			this.init();			
			if(features.length != 0 ){
				domStyle.set(this.dataListBox, "display", "block");
				this.createList(features,this._listHtml);
				this.initPage(nums,pageOptions);
			}else{
				domStyle.set(this.NoSearchlist, "display", "block");
			}
		},
		setOption:function(option){
		  lang.mixin(this,option);
		},
		setContentNode:function(callback){
		  this.contentNode = callback.apply();
		},
		setItems:function(features){
		  if(this.geoShowable){
		    this.listInit();
		  }			
			this.features = [];
			if(features.length != 0 ){
				domStyle.set(this.dataListBox, "display", "block");
				domConstruct.empty(this._listHtml);
				this.createList(features,this._listHtml);
			}else{
				domStyle.set(this.NoSearchlist, "display", "block");
			}
		},
    postCreate: function() {
      this.inherited(arguments);
      if(this.geoShowable){
        this.dataLayer =  new GraphicsLayer();
        this.map.addLayer(this.dataLayer);
        this.tempLayer =  new GraphicsLayer();
        this.map.addLayer(this.tempLayer);
        this.dataLayer.on("click",lang.hitch(this,function(evt){
          this.listInit();
          var g = evt.graphic;
          var i = dojo.indexOf(this.features,g);        
          this.highLight(i);
          this.contentNode=this.iWcontentNode.apply(null,[g]);
          this.showInfowindow(g);
        }));
      }
    },
    destroy:function(){
    	this.init();
    },
    startup: function() {
      this.inherited(arguments);
      if(this.features.length == 0){
      	domStyle.set(this.NoSearchlist, "display", "block");
      }else{
      	domStyle.set(this.dataListBox, "display", "block");
      	this.createList(this.features,this._listHtml);
      	this.initPage(this.nums,this.pageOptions);
      }
    },
    initPage:function(nums,pageOptions){
      var a = $("#" + this.id + "Paging").easyPaging(nums, pageOptions);
    },
    initModel:function(){
  		if(this.Dialog){
				this.Dialog.destroy();
			}
			if(this.editToolbar){
				this.editToolbar.deactivate();
			}
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
		_setItemContent:function(fields,editFlag){
			
var htmlContent =`<form class="form">
    			<table  cellspacing="0" cellpadding="0" class="showTableCls" style="width:100%">
      			<tbody class ="editable-content">`;  
      			var j=0;
      			for(var i=0;i<fields.length;i++){
      				var field = fields[i];
      				if(field.EDITABLE){
      					var value='',oidDiv='';
      					if(editFlag&&j==0){	      					
      						oidDiv = '<input type="hidden" name="OBJECTID" value="{OBJECTID}" class="input_7">';	      					
      					}else if(editFlag){
      						value='{'+field.FIELD_NAME+'}';
      					}
      					htmlContent +='<tr class ="line2"><td class="td1">'+field.FIELD_NAME_CN+'</td><td class="td2">'+oidDiv+'<input type="text" name="'+field.FIELD_NAME+'" value="' + value + '" class ="input_7"></td></tr>';
      					j++;
      				}
      			}
      			var txt = "",divId ="";
      			if(editFlag){
      				txt = "编辑图形";
      				callId = "editGeometryDiv"
      				jsonId = "editGeoJsonDiv";
      			}else{
      				txt = "添加图形";
      				callId ="addGeometryDiv";
      				jsonId = "addGeoJsonDiv";
      			}
htmlContent +='<tr class ="line2"><td class="td1">空间图形</td><td class="td2"><a><span class="blkRec"></span>';
htmlContent +='<span id="'+callId+'" class="" style="float:left;margin-left:5px;height:20px;cursor:pointer">' + txt + '</span><input type="hidden" id ="' + jsonId + '" value=\'{geoJson}\' /></a></td></tr>';
htmlContent +=`</tbody>		            
          </table>
          <div class ="btns" style="padding-bottom:10px">      
            		<input type="button" name="" id="btn_save" class ="button_3 button-sirens2" value="保存"	/>
                <input type="button" name="" id="btn_cancel" class ="button_3  button-sirens1" value="取消">
          </div>
          </form>
    			`;
    			return htmlContent;
		},
		_drawEndHandle:function(evt){
			var g = new Graphic(evt.geometry,this.symbol);
			this.tempLayer.add(g);
			this.drawTool.deactivate();
			var geoJson = JSON.stringify(evt.geometry);
			domAttr.set("addGeoJsonDiv","value", geoJson);				
			domAttr.set("addGeometryDiv","innerHTML", "继续编辑");	
			domClass.add("addGeometryDiv","geoSucc");
			domClass.add(query("#addGeoJsonDiv")[0].parentNode, "on");			
		},
		createItem:function(item,idx,srcNodeRef){

  		var li = domConstruct.create("li",{id:"li_oid_" + item.OBJECTID},srcNodeRef);
  		var a = domConstruct.create("a",{"innerHTML":lang.replace(this.strLi,item),"onclick":lang.hitch(this,function(e){
  		  if(this.isClick&&this.geoShowable){
  		    this.containOnclick(e,idx);
  		  } 
        this.isClick = false;
        lang.hitch(this,setTimeout,this.isClick=true,1500);
  		})},li);
  		var div = domConstruct.create("div",{style:{position:"relative"}},li);
  		if(this.editable){
  			var span = domConstruct.create("span",{"innerHTML":"编辑","style":{"cursor":"pointer","position":"absolute","right":"10px","top":"-90px"},"onclick":lang.hitch(this,function(e){
	  			this._editOnclick(e,idx);
	  		})},div);
  		}
	  	return li;
		},
		markGraphic:function(feature){
      /*
       * 构建地图的图形及渲染
       * */
			//feature.symbol = this.symbol;
			var g = new Graphic(feature);	
			g.setSymbol(this.symbol);
			return g;			
		},
		highLight:function(idx){
			var feature = this.features[idx];	
			feature.setSymbol(this.highLightSymbol);			
			this.dataLayer.redraw();
			this.targetItem.graphic = feature;
			this.targetItem.hightLightFlag = true;
			return feature;
		},
		containOnclick:function(e,idx){
			this.listInit();
			var graphic = this.highLight(idx);
			this.contentNode= this.iWcontentNode.apply(null,[graphic]);
			this.showInfowindow(graphic);
		},
		showInfowindow:function(graphic){
		  
      /*
       * 气泡居中
       * 及设置气泡内容
       */
			if (graphic.geometry.type == "point") {
				var point = graphic.geometry;
				//this.map.centerAndZoom(graphic.geometry, this.map.getNumLevels());
      } else {
      	var point = graphic.geometry.getExtent().getCenter();
      	//this.map.setExtent(graphic.geometry.getExtent().expand(5.5));
      }
		  this.map.centerAndZoom(point,this.mapZoom).then(lang.hitch(this, function() {			
					var featureAttributes = graphic.attributes;
          var title = "";
          if(this.titleField&&this.titleField !=""){
          	title = featureAttributes[this.titleField];
          }					
        	this.map.infoWindow.setTitle(title);
        	this.map.infoWindow.setContent(this.contentNode.domNode);
        	this.map.infoWindow.show(point); 
      }));
		},
		_getContent: function(attributes,fields) {
			var line = "",br = "",content = "";
			for(var i=0;i<fields.length;i++){
				var field =fields[i];
				if(field.DISPLAYSHOW){
					content += br + field.FIELD_NAME_CN + ":" + attributes[field.FIELD_NAME];
        	br = "<br>";
				}
			}
      content += '<div class="btns"><input type="button" id="btn_info" class="" value="查看详细"></div>';	
      return content;
    },
		_editOnclick:function(e,idx){
		    if(this.Dialog){
					this.Dialog.destroy();
				}
		    var feature = this.features[idx];	
		    console.log(feature);
		    var obj ={};
		    obj.geoJson = JSON.stringify(feature.geometry);
		    var attribute =lang.mixin(obj,feature.attributes);
    	  var htmlContent = this._setItemContent(this.fields,true);
  			var content = lang.replace(htmlContent,obj);
				this.showDialog(content,lang.hitch(this,function(e){
					this._showEditItem(e,idx);
				}),lang.hitch(this,function(e){
					this._hideEditItem(e,idx);
				}));
		},
    showDialog:function(content,onShow,onHide){
      /*
       * 弹窗自定义及
       * 开关事件
       * */
      if(this.Dialog){
        this.Dialog.destroy();
      }
      this.Dialog =new Dialog({
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
		_hideEditItem:function(data,idx){				
				if(this.editToolbar){
					this.editToolbar.deactivate();
				}
				var feature = this.features[idx];	
				//var g = new Graphic();
				feature.setSymbol(this.symbol);	
				lang.hitch(this,setTimeout,this.Dialog.destroy(),0);	
		},
		_showEditItem:function(data,idx){
      /*
       * 展示编辑表单
       */
			query("#editGeometryDiv").on("click",lang.hitch(this,function(){
				if(this.editToolbar){
					this.editToolbar.deactivate();
				}else{
					this.editToolbar = new Edit(this.map);
				}
				var g = this.highLight(idx);				
				this.editToolbar.activate(Edit.EDIT_VERTICES, g);
				this.editToolbar.on("deactivate",lang.hitch(this,function(e){					
					var status = e.info;
					if(status.isModified){
						var geoJson = JSON.stringify(e.graphic.geometry);
						//domAttr.set("editGeoJsonDiv","value", geoJson);	
						domClass.add("editGeometryDiv","geoSucc");	
						domAttr.set("editGeometryDiv","innerHTML", "继续编辑");				
						domClass.add(query("#editGeoJsonDiv")[0].parentNode, "on");		
					}
				}));
				this.editEndHandle = on.pausable(g.getDojoShape().getNode(),"dblclick",lang.hitch(this,function(e){
					this.editToolbar.deactivate();
				}));
				connect.connect(g.getDojoShape().getNode(), 'mouseover', lang.hitch(this, function(e){	        
	        this.map.disableDoubleClickZoom()
	        this.editEndHandle.resume();
	      }));
	      connect.connect(g.getDojoShape().getNode(), 'mouseout', lang.hitch(this, function(e){
	        
	        this.map.enableDoubleClickZoom()
	        this.editEndHandle.pause();
	      }));				
			}));
	     query("#btn_cancel").on("click",lang.hitch(this,function(){
	        lang.hitch(this,setTimeout,this.Dialog.destroy(),0); 
	      }));
			query("#btn_save").on("click",lang.hitch(this,function(){	
				domAttr.set("btn_save","disabled", true);	
				var obj ={};
				var jsonData = $('form.form').serializeArray();
				jsonData.map(function(item,idx){
					if(item.name =="OBJECTID"){
						obj[item.name] = parseInt(item.value);
					}else{
						obj[item.name] =item.value;
					}
				});
				var newG = this.features[idx];
//				var geoJson = domAttr.get("editGeoJsonDiv","value");	
//				var geometry = JSON.parse(geoJson);
				//newG.setGeometry(geometry);
				//console.log(newG);
				var feature={};
				feature.geometry = newG.geometry;
				feature.attributes = obj;
				var data = {
					features : JSON.stringify([feature]),
					layerId : this.layerId
				};
				this._applyEdits(data,idx,this.updateItemUI,function(e){
					console.log(e);
					alert("网络忙，请稍后再试！");
					domAttr.set("btn_save","disabled", false);	
				});//LayerId = pg.ID
			}));
			query("#btn_cancel").on("click",lang.hitch(this,function(e){
				this._hideEditItem(e,idx);
			}));
		},
		updateItemUI:function(data,idx){
      /*
       * 编辑完成更新页面
       */
			var featrues = JSON.parse(data.features);			
			var attr =featrues[0].attributes;
			
			var feature = this.features[idx];	
			feature.setSymbol(this.symbol);	
			feature.setAttributes(attr);			
			var g = this.createItem(attr,idx,null);	
			dojo.place(g,"li_oid_" + attr.OBJECTID,"replace");
			//dom.byId("li_oid_" + attr.OBJECTID) = g;
			console.log(g);
		},
		_applyEdits:function(data,idx,callback,errhandle){
      /*
       * 调用编辑接口
       */
//			var obj = {
//							layerId: layerId,
//							features: JSON.stringify([feature]);
//				};	
				
			xhr(this.editUrl, {  
					method:"POST",
	        handleAs: "text",
	        headers: {"X-Requested-With": null},
	        data:data
	    }).then(lang.hitch(this,function(res){	 
	    	//var flag = confirm("数据保存成功！是否关闭数据编辑？");
        res = JSON.parse(res);
        if(res.state =="success"){
          alert("数据保存成功！");
          callback&&callback.apply(this,[data,idx]); 
        }else{
          alert("数据保存失败！稍后再试！");
        }     			    	
	    }),lang.hitch(this,function(err){
	    	console.log(err);
	    	errhandle&&errhandle.apply(this,[data,idx]);
	    }));  
		},
		createList:function(datas,srcNodeRef){
			var ul =  domConstruct.create("ul",null,srcNodeRef);
      dojo.map(datas,lang.hitch(this,function(item,idx){    
        this.createItem(item.attributes,idx,ul);
        }));
			if(this.geoShowable){
		     this.dataLayer.clear();
		      this.features=[];
		      this.geometry = null;
		      this.features = dojo.map(datas,lang.hitch(this,function(item,idx){
            var g = this.markGraphic(item);
            this.dataLayer.add(g);
            
            if(this.geometry){
              this.geometry.hasOwnProperty("paths")?this.geometry.addPath(g.geometry.paths[0]):
                this.geometry.hasOwnProperty("rings")?this.geometry.addRing(g.geometry.rings[0]):this.geometry.addPoint(g.geometry)
            }else{
              switch(g.geometry.type){
              case "point":
                this.geometry = new Multipoint(this.map.spatialReference);
                this.geometry.addPoint(g.geometry);
                break;
              default:
                this.geometry = g.geometry;
                break;
              }
            }
		        return g;
		      }));
		      if(this.features.lenth ==1){
		        this.map.centerAndZoom(this.features.geometry,this.mapZoom);
		      }else{
		         var geo = geometryEngine.convexHull(this.geometry);
		         console.log(geo);
		         var queryExtent = geo.getExtent();
		         this.map.setExtent(queryExtent, true);
		      }
			}
			return ul;
		}
  });
  return clazz;
});