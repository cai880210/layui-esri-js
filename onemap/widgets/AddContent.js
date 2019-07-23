define(["dijit/layout/ContentPane", "dojo/_base/declare","dojo/dom-construct","dojo/dom-attr", "dojo/dom-style","dojo/dom-class", "dojo/_base/kernel", "dojo/query", 
  "dojo/_base/array", "dojo/_base/lang","dijit/form/Form","dijit/form/TimeTextBox","dijit/form/DateTextBox","dijit/form/TextBox",
  "dijit/form/ValidationTextBox", "dijit/form/NumberTextBox","dijit/form/SimpleTextarea","esri/layers/GraphicsLayer","esri/graphic","esri/toolbars/draw"], 
function (ContentPane,declare,domConstruct, domAttr,domStyle, domClass, kernel, query, array, lang,Form,TimeTextBox,DateTextBox,TextBox,ValidationTextBox,NumberTextBox,
    SimpleTextarea,GraphicsLayer,Graphic,Draw) {
    var AddContent =  declare([ContentPane], {
        _subclass:"",
        btnList:null,
        flag:true,
        constructor: function (options, srcNoderef) {
          lang.mixin(this,options);
          this.map = options.map;
          this.sml = options.sml;
          this.fields = options.fields;
          this.closeCall = options.closeCall;
          this.validateForm = (options.hasOwnProperty("validateForm")) ? options.validateForm :null;
          this.saveCall = options.saveCall;
          this.saveData = (options.hasOwnProperty("saveData")) ? options.saveData :"";
          this.closeData = (options.hasOwnProperty("closeData")) ? options.closeData :"";
          this._subclass = (options.hasOwnProperty("subclass")) ? options.subclass :"";
        },
        postCreate: function () {
            this.inherited(arguments);
            this.tempLayer = new GraphicsLayer();
            this.map.addLayer(this.tempLayer);
            domClass.add(this.domNode, this._subclass); 
            this.createForm(this.domNode);
            this.createBtn(this.closeCall ,this.saveCall); 
            this.createUnderLayer(this.domNode);
        },
        startup: function () {
            this.inherited(arguments);
        },   
        createUnderLayer:function(refNode){
          this.underLayer = domConstruct.create("div", {"class":"index-mask",
            "style":{"display":"none"},
          'innerHTML':'<div class="save-tost">保存中<img style="width: 20px;" src="jimu.js/images/loading.gif" alt="加载图"></div>'  
          }, refNode); 
        },        
        createForm:function(refNode,pos){
          this._attrsForm = new Form({"class": "add-cont-form"},domConstruct.create("div", null, refNode));// domConstruct.create("form", {"class": "form"},refNode);
          this.createTable(this.fields,this._attrsForm.domNode,"first");
        },
        createTable: function(fields,refNode) {
          this.attributeTable = domConstruct.create("table", {
              cellspacing: "0",
              cellpadding: "0"
          },refNode);
          var c;
          var a = domConstruct.create("tbody", null, this.attributeTable);
          dojo.forEach(fields, lang.hitch(this, "createField", a), this);
          
        },
        createField:function(refNode,fieldItem,idx){
          var a,b,c,f,g;
          if(fieldItem.FIELD_NAME.toLowerCase() =="shape"){
            this.createGeometryField(fieldItem.FIELD_TYPE,refNode);
          }else if(fieldItem.EDITABLE){
            a = domConstruct.create("tr", {"class": "line2"}, refNode,"last");
            domConstruct.create("td", {
              "innerHTML": fieldItem.FIELD_NAME_CN,
              "class": "td1",
            }, a);
            b = domConstruct.create("td", null, a);
            
            if (fieldItem.preNode) {
              dojo.place(fieldItem.preNode.domNode, b, "first");
              g = fieldItem.preNode;
              fieldItem.dijit = fieldItem.preNode;
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
          var a,b,c,d;
          a = domConstruct.create("tr", {"class": "line2"}, refNode,"last");
          domConstruct.create("td", {
            "innerHTML": "空间图形",
            "class": "td1",
          }, a);
          b = domConstruct.create("td", null, a);
          c = domConstruct.create("a", {"onclick":lang.hitch(this,
              function(g){
                if(this.flag){
                  this.drawGeometry(g);
                }
                this.flag =false;
                lang.hitch(this,setTimeout,this.flag=true,1500);
              })}, b);
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
          //"id":"addGeometryDiv"
          this.geoToolNode = domConstruct.create("span", {"innerHTML": "添加图形","style":{"float":"left","margin-left":"5px","height":"20px","cursor":"pointer"}}, c);
          //"id":"addGeoJsonDiv"
          this.geoJsonNode = domConstruct.create("input", {"type":"hidden"}, c);
          return a;
        },
        createStringField: function(a, b, c) {
          var d = {
              "class": "input_7",
              "name":b.FIELD_NAME
          };
          a&&lang.mixin(d,a);
//          if(b.format){
//            
//          }
//          switch(b.stringFieldOption){
//          case "richtext":
//            
//            break;
//          case "textarea":
//            return new SimpleTextarea(d, domConstruct.create("div", null, c));           
//          default:
//            return new TextBox();
//          }
          return new ValidationTextBox(d, domConstruct.create("input", null, c));
//          return b.stringFieldOption === m.STRING_FIELD_OPTION_TEXTAREA ? (d["class"] += " atiTextAreaField", new K(d, k.create("div", null, c))) : b.stringFieldOption === m.STRING_FIELD_OPTION_RICHTEXT ? (d["class"] += " atiRichTextField", d.height = "100%", d.width = "100%", d.plugins = b.richTextPlugins || "bold italic underline foreColor hiliteColor | justifyLeft justifyCenter justifyRight justifyFull | insertOrderedList insertUnorderedList indent outdent | createLink".split(" "), a = new D(d, k.create("div", null, c)), a.startup(), a) : !a.nullable || !b.field || !b.field.nullable ? new L({
//              required: !0
//          },
//          k.create("div", null, c)) : new I(d, k.create("div", null, c))
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
          return new TimeTextBox(d, domConstruct.create("div", null, c))
        },
        createDateField: function(a, b, c) {
          a = {
              "class": "atiField",
              "name":b.FIELD_NAME,
              trim: !0
          };
          return new DateTextBox(a, domConstruct.create("div", null, c))
        },
        createNumberField: function(a, b, c) {          
//          if(b.format){
//            var numType = b.format.hasOwnProperty("numberFieldType")?b.formate.numberFieldType:null;
//            
//          }
          var d={
              "class":"input_7",
              "name":b.FIELD_NAME,
              constraints: {
                  places: 0
              },
              invalidMessage: "该值是数字！",
              trim: !0
          };
          a&&lang.mixin(d,a);
          return new NumberTextBox(d, domConstruct.create("div", null, c))
        },
        createBtn:function(closeCall,saveCall,data){
        	this.btnList = domConstruct.create("ul",{'class':"cont-btns"},this.domNode);
          var saveBtn = domConstruct.create("li",{
            "innerHTML":"<i class='mdi mdi-content-save'></i>保存",
            "onclick":lang.hitch(this,function(evt){
              this.tempLayer.clear();
              if(this.flag){
                var validable = this._attrsForm.validate();
                var isValid=true;
                this.validateForm&&(isValid = this.validateForm(this._attrsForm.domNode));
                if(isValid&&validable){
                  var g =  this.saveDataHandle();
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
		          //TODO init
		          this.initMap();
		          closeCall&&closeCall.apply(null,[evt,data]);
		        })
		      },this.btnList);
        },
        initMap:function(){
          this.tempLayer.clear();
          if(this.drawTool){
            this.drawTool.deactivate();
          }
        },
        addBtn:function(attrs){
          var closeBtn = domConstruct.create("li",attrs,this.btnList,"first");
        },
        drawGeometry:function(){
          domAttr.set(this.geoToolNode,"innerHTML", "开始绘制");
          this.tempLayer.clear();
          if(this.drawTool){
            this.drawTool.deactivate();
          }else{
            this.drawTool = new Draw(this.map);
          }
          this.drawTool.activate(this.drawType);
          this.drawTool.on("draw-end",lang.hitch(this,this._drawEndHandle));
        },
        _drawEndHandle:function(evt){
          var g = new Graphic(evt.geometry,this.sml);
          this.tempLayer.add(g);
          this.drawTool.deactivate();
          var geoJson = JSON.stringify(evt.geometry);
          domAttr.set(this.geoJsonNode,"value", geoJson);        
          domAttr.set(this.geoToolNode,"innerHTML", "继续编辑");  
          domClass.add(this.geoToolNode,"geoSucc"); 
          domClass.add(this.geoToolNode.parentNode, "on");      
        },
        saveDataHandle:function(){
          var geoJson = domAttr.get(this.geoJsonNode,"value"); 
          //TODO validate Form          
          
//          var validatable = this.validateForm(query("form.form")[0],this.fields);
//          if(!validatable){
//            alert("数据填写不正确！请重新填写！");
//            return ;
//          }
  
          if(geoJson ==''){
            alert("请添加图形");
            return ;
          }     
          
          //TODO Defer UI
          
//          domAttr.set("btn_save","disabled", true);
          domStyle.set(this.underLayer, "display", "block");
          
          //TODO parse Form to json
          //author cai
          
          var attrs = this._attrsForm.getValues();
          for(var key in attrs){
            var value = attrs[key];
            if(value instanceof Date){
              attrs[key] =value.getTime();
            }
          }
          var attrsJson = dojo.toJson(attrs,true);
          var geometry = JSON.parse(geoJson);
          
          var newG = new Graphic();
          newG.setAttributes(attrs); 
          newG.setGeometry(geometry);
          return newG;
        }
    });
    return AddContent;
});