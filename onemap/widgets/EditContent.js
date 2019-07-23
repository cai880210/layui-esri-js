define(["dijit/layout/ContentPane", "dojo/_base/declare","dojo/dom-construct","dojo/dom-attr", "dojo/dom-class", "dojo/_base/kernel", "dojo/query", 
  "dojo/_base/array","dojo/dom-style", "dojo/_base/lang","dojo/_base/connect",'dojo/on',"dijit/form/Form","dijit/form/TimeTextBox","dijit/form/DateTextBox","dijit/form/TextBox",
  "dijit/form/ValidationTextBox","dijit/form/NumberTextBox","dijit/form/SimpleTextarea","esri/layers/GraphicsLayer","esri/graphic","esri/toolbars/edit","esri/symbols/SimpleFillSymbol"], 
function (ContentPane,declare,domConstruct, domAttr, domClass, kernel, query, array,domStyle, lang,connect,on,Form,TimeTextBox,DateTextBox,TextBox,ValidationTextBox,NumberTextBox,
    SimpleTextarea,GraphicsLayer,Graphic,Edit,SimpleFillSymbol) {
    var EditContent = declare([ContentPane], {
        _subclass:"",
        btnList:null,
        flag:true,
        constructor: function (options, srcNoderef) {
          lang.mixin(this,options);
          this.map = options.map;
          this.feature = options.feature;
          this.fields = options.fields;
          this.closeCall = options.closeCall;
          this.saveCall = options.saveCall;
          this.geoEditable = (options.hasOwnProperty("geoEditable")) ? options.geoEditable :true;
          this.saveData = (options.hasOwnProperty("saveData")) ? options.saveData :"";
          this.closeData = (options.hasOwnProperty("closeData")) ? options.closeData :"";
          this._subclass = (options.hasOwnProperty("subclass")) ? options.subclass :"";
        },
        postCreate: function () {
            this.inherited(arguments);
            this.extentSym = new SimpleFillSymbol({
              "type": "esriSFS",
              "style": "esriSFSSolid",
              "color": [70,70,0,0],
              "outline": {
               "type": "esriSLS",
               "style": "esriSLSSolid",
               "color": [0,255,0,0],
               "width": 2
              }
            });
            this.tempLayer = new GraphicsLayer();
            this.map.addLayer(this.tempLayer);
            domClass.add(this.domNode, this._subclass); 
            this.createForm(this.domNode);
            this.createUnderLayer(this.domNode);
            this.createBtn(this.closeCall ,this.closeData);
            
        },
        startup: function () {
            this.inherited(arguments);
        },   
        createForm:function(refNode,pos){
          this._attrsForm = new Form({"class": "form"},domConstruct.create("div", null, refNode));// domConstruct.create("form", {"class": "form"},refNode);
          this.createTable(this.fields,this._attrsForm.domNode,"first");
          this.setForm();
        },
        createUnderLayer:function(refNode){
          this.underLayer = domConstruct.create("div", {"class":"index-mask",
            "style":{"display":"none"},
          'innerHTML':'<div class="save-tost">保存中<img style="width: 20px;" src="jimu.js/images/loading.gif" alt="加载图"></div>'  
          }, refNode); 
        },
        setForm:function(){
          dojo.forEach(this.fields, lang.hitch(this,function(fieldItem,idx) {
            var node = fieldItem.customField || fieldItem.dijit;
            var c = this.feature.attributes[fieldItem.FIELD_NAME];
            if(node){
              switch(node.declaredClass){
                case "dijit.form.DateTextBox":                                
                  c = "" === c ? null: new Date(c);
                  break;
                default:
                  break;
              }
              node.domNode?node.set("value",c):domAttr.set(node,"value", c);              
              //node.set("value",c);
            }
          })); 
          var geoJson = JSON.stringify(this.feature.geometry);
          domAttr.set(this.geoJsonNode,"value", geoJson);
        },
        createTable: function(fields,refNode) {
          var setFields=fields;
//          setFields.sort(function(a, b){
//              return b.SEQUENCE - a.SEQUENCE;
//          });// 根据字段排序
          this.attributeTable = domConstruct.create("table", {
              cellspacing: "0",
              cellpadding: "0"
          },refNode);
          var c;
          var a = domConstruct.create("tbody", null, this.attributeTable);
          dojo.forEach(setFields, lang.hitch(this, "createField", a), this);          
        },
        createField:function(refNode,fieldItem,idx){
          var a,b,c,f,g;
          var isHasShape=0;
          if(fieldItem.FIELD_NAME.toLowerCase() =="shape"&&this.geoEditable){
        	  this.createGeometryField(fieldItem.FIELD_TYPE,refNode);
          }else if(fieldItem.FIELD_NAME =="OBJECTID"){
            var g = this.createOidField();
            fieldItem.dijit = g;
          }else if(fieldItem.EDITABLE){
            a = domConstruct.create("tr", {"class": "line2"}, refNode,"last");
            domConstruct.create("td", {
              "innerHTML": fieldItem.FIELD_NAME_CN,
              "class": "td1",
            }, a);
            b = domConstruct.create("td", null, a);
            if (fieldItem.customField) {
              dojo.place(fieldItem.customField.domNode, b, "first");
              g = fieldItem.customField;
              fieldItem.dijit = fieldItem.customField;
            }else{              
              f = (fieldItem.hasOwnProperty("opt")) ? fieldItem.opt :null;
              switch (fieldItem.FIELD_TYPE) {
              case "NVARCHAR2":
                  g = this.createStringField(f, fieldItem, b);
                  break;
              case "DATE":
                  g = this.createDateField(f, fieldItem, b);
                  //this.createTimeField(f, c, b);
                  break;
              case "esriGeometryPoint":
                break;
              case "esriGeometryPolyline":
                  break;
              case "esriGeometryPolygon":
                break;
              case "NUMBER":
                  g = this.createNumberField(f, fieldItem, b);
                  break;
              default:
                  g = this.createStringField(f, fieldItem, b);
                  break;
              }
              fieldItem.dijit = g;
            }
          } 
        },
        createGeometryField:function(type,refNode){
          var a,b,c,d,e;
          a = domConstruct.create("tr", {"class": "line2"}, refNode,"last");
          domConstruct.create("td", {
            "innerHTML": "空间图形",
            "class": "td1",
          }, a);
          b = domConstruct.create("td", null, a);
          c = domConstruct.create("a", {
            "onclick":lang.hitch(this,function(g){
              if(this.flag){
                this.editGeometry(g);
              }
              this.flag =false;
              lang.hitch(this,setTimeout,this.flag=true,1500);
            },this.feature)
          }, b);

          switch(type){
            case "esriGeometryPoint":
              this.drawType = "point";
              d = domConstruct.create("span", {"class":"blkpoi"}, c);              
              break;
            case "esriGeometryPolyline":
              this.drawType = "polyline";
              d = domConstruct.create("span", {"class":"blkLine"}, c);
                break;
            case "esriGeometryPolygon":
              this.drawType = "polygon";
              d = domConstruct.create("span", {"class":"blkRec"}, c);
              break;
          }
        //"id":"editGeometryDiv"
          this.geoToolNode = domConstruct.create("span", {            
            "innerHTML": "编辑图形",
            "style":{"float":"left","margin-left":"5px","height":"20px","cursor":"pointer"}
          }, c);
          //"id":"editGeoJsonDiv"
          this.geoJsonNode = domConstruct.create("input", {"type":"hidden"}, c);
          e = domConstruct.create("a", {
            "onclick":lang.hitch(this,function(g){
              this.editToolbar.deactivate();
            })
          }, b);
          this.endToolNode = domConstruct.create("span", {            
            "innerHTML": "结束编辑",
            "style":{"float":"left","margin-left":"5px","height":"20px","cursor":"pointer"}
          }, e);
          return a;
        },
        createOidField:function(){
          this.oidNode = domConstruct.create("input", {
            "name":"OBJECTID",
            "type":"hidden"}, this._attrsForm.domNode,"last");
          return this.oidNode;
        },
        createStringField: function(a, b, c) {
          var d = {
              "class": "input_7",
              "name":b.FIELD_NAME
          };
          a&&lang.mixin(d,a);
//          switch(b.stringFieldOption){
//          case "richtext":
//            
//            break;
//          case "textarea":
//            return new SimpleTextarea(d, domConstruct.create("div", null, c));           
//          default:
//            return new TextBox();
//          }
          return new ValidationTextBox(d, domConstruct.create("input", null, c,"first"));
        },
        createTimeField: function(a, b, c) {
          var d = {
              "class": "atiField",
              trim: !0,
              constraints: {
                  formatLength: "medium"
              }
          };
          a&&lang.mixin(d,a);
          this._datePackage && (d.datePackage = this._datePackage);
          return new TimeTextBox(d, domConstruct.create("div", null, c,"first"))
        },
        createDateField: function(a, b, c) {
          var d = {
              "class": "atiField",
              "name":b.FIELD_NAME,
              trim: !0
          };
          a&&lang.mixin(d,a);
          return new DateTextBox(d, domConstruct.create("div", null, c,"first"))
        },
        createNumberField: function(a, b, c) {          
//          if(b.format){
//            var numType = b.format.hasOwnProperty("numberFieldType")?b.formate.numberFieldType:null;
//            
//          }
          var d = {
              "class":"input_7",
              "name":b.FIELD_NAME,
              constraints: {
                  places: 0
              },
              invalidMessage: this.NLS_validationInt,
              trim: !0
          }
            a&&lang.mixin(d,a);
          return new NumberTextBox(d, domConstruct.create("div", null, c,"first"))
        },
        createBtn:function(closeCall,saveCall,data){
          this.btnList = domConstruct.create("ul",{'class':"cont-btns"},this.domNode);
          var saveBtn = domConstruct.create("li",{
            "innerHTML":"<i class='mdi mdi-content-save'></i>保存",
            "onclick":lang.hitch(this,function(evt){ 
              if(this.editToolbar){
                this.editToolbar.deactivate();
              }
              if(this.flag){
                var validable = this._attrsForm.validate();
                var isValid=true;
                this.validateForm&&(isValid = this.validateForm(this._attrsForm.domNode));
                if(isValid&&validable){
                  var g =  this.parseDataHandle();
                  this.saveCall&&this.saveCall.apply(this,[g,evt]);
                }else{
                  alert("数据填写出错，请检查！");
                }
              }
              this.flag =false;
              lang.hitch(this,setTimeout,this.flag=true,1500);
            })
          },this.btnList);
          var closeBtn = domConstruct.create("li",{
            "innerHTML":"<i class='mdi mdi-cancel'></i>取消",
            "onclick":lang.hitch(this,function(evt){
              this.resetMap();
              this.closeCall&&this.closeCall.apply(this,[evt]);
            })
          },this.btnList);
        },
        addBtn:function(attrs){
          var closeBtn = domConstruct.create("li",attrs,this.btnList,"first");
        },
        editGeometry:function(g){
          alert("请鼠标按住图形的点再拖动实现编辑！");
          this.tempLayer.clear();
          if(this.editToolbar){
            this.editToolbar.deactivate();
          }else{
            this.editToolbar = new Edit(this.map);
          }
          domAttr.set(this.geoToolNode,"innerHTML", "开始编辑");
          //var g = this.highLight(idx);
          switch(g.geometry.type){
            case "point":
              this.editToolbar.activate(Edit.MOVE, g);
              this.editToolbar.on("deactivate",lang.hitch(this,this.editEndHandle));
              this.editToolbar.on("graphic-move-stop",lang.hitch(this,this.moveEndHandle));
              break;
            default:
              var extent = g.geometry.getExtent();
              var newG = new Graphic();
              newG.setGeometry(g.geometry);
              newG.setSymbol(this.extentSym);
              this.tempLayer.add(newG);
              this.editToolbar.activate(Edit.EDIT_VERTICES, g);
              this.editToolbar.on("deactivate",lang.hitch(this,this.editEndHandle));
              this.editToolbar.on("vertex-move-stop",lang.hitch(this,function(e){
                var extent = e.graphic.geometry.getExtent();
                newG.setGeometry(e.graphic.geometry);
              }));
              this.editEndHandle = on.pausable(newG.getDojoShape().getNode(),"dblclick",lang.hitch(this,function(e){
                console.log(e);
                console.log(g);
                this.editToolbar.deactivate();
              }));
              connect.connect(newG.getDojoShape().getNode(), 'mouseover', lang.hitch(this, function(e){         
                this.map.disableDoubleClickZoom();
                this.editEndHandle.resume();
              }));
              connect.connect(newG.getDojoShape().getNode(), 'mouseout', lang.hitch(this, function(e){          
                this.map.enableDoubleClickZoom();
                this.editEndHandle.pause();
              })); 
              break;
          } 
        },
        editEndHandle:function(e){
          console.log(e);
          this.tempLayer.clear();
          var status = e.info;
          if(status.isModified){
            var geoJson = JSON.stringify(e.graphic.geometry);
            //domAttr.set("editGeoJsonDiv","value", geoJson); 
            domClass.add(this.geoToolNode,"geoSucc");  
            domAttr.set(this.geoToolNode,"innerHTML", "继续编辑");       
            domClass.add(this.geoJsonNode.parentNode, "on");
          }else{
            domAttr.set(this.geoToolNode,"innerHTML", "继续编辑"); 
          } 
        },
        moveEndHandle:function(e){
          this.editToolbar.deactivate();
          this.tempLayer.clear();
          var target = e.target;
          if(target._modified){
            var geoJson = JSON.stringify(e.graphic.geometry);
            //domAttr.set("editGeoJsonDiv","value", geoJson); 
            domClass.add(this.geoToolNode,"geoSucc");  
            domAttr.set(this.geoToolNode,"innerHTML", "继续编辑");       
            domClass.add(this.geoJsonNode.parentNode, "on");
          }else{
            domAttr.set(this.geoToolNode,"innerHTML", "继续编辑"); 
          } 
        },
        parseDataHandle:function(){
          var geoJson = domAttr.get(this.geoJsonNode,"value"); 
          //TODO validate Form          
          
//          var validatable = this.validateForm(query("form.form")[0],this.fields);
//          if(!validatable){
//            alert("数据填写不正确！请重新填写！");
//            return ;
//          }
  
//          if(geoJson ==''){
//            alert("请添加图形");
//            return ;
//          }     
          
          //TODO Defer UI
          
//          domAttr.set("btn_save","disabled", true);
          domStyle.set(this.underLayer, "display", "block");
          
          //TODO parse Form to json
          //author cai
          var oid = domAttr.get(this.oidNode,"value"); 
          var attrs = this._attrsForm.getValues();
          for(var key in attrs){
            var value = attrs[key];
            if(value instanceof Date){
              attrs[key] =value.getTime();
            }
          }
          attrs["OBJECTID"] = parseInt(oid);
          var attrsJson = dojo.toJson(attrs,true);
          var geometry = JSON.parse(geoJson);
          //this.feature.setAttributes(attrs); 
          //note: editor has saved the geometry to this.feature 
//          this.feature.setGeometry(geometry);
          var feature={};
          feature.geometry = this.feature.geometry;
          feature.attributes = attrs;
          return feature;
        },        
        resetMap:function(){       
          if(this.editToolbar){
            this.editToolbar.deactivate();
          }
          var geoJson = domAttr.get(this.geoJsonNode,"value");  
          var geometry = JSON.parse(geoJson);
          var type = this.feature.geometry.type;
          switch(type){
          case"point":
            break;
          case "polyline":
            this.feature.geometry.removePath(0);
            this.feature.geometry.addPath(geometry.paths[0]);
            break;
          default:
            this.feature.geometry.removeRing(0);
            this.feature.geometry.addRing(geometry.rings[0]);
            break;
          }

//          lang.mixin(this.feature.geometry,geometry);
//          console.log(this.feature.geometry);
          this.feature.draw();
          //this.feature.setGeometry(geometry);
          //var g = new Graphic();
        }
    });
    return EditContent;
});