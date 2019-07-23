/*global define, require, location*/
/*jshint laxcomma:true*/
(function () {
  'use strict';
  var apiUrl = 'http://gis.eginsoft.cn:7000/arcgis_js_v327_api/arcgis_js_api/library/3.27/3.27/';
  var pathRX = new RegExp(/\/[^\/]+$/)
    , locationPath = location.pathname.replace(pathRX, '/');
	console.log(window);
  require({
    parseOnLoad: false,
    baseUrl: "/front_end_frame",
    async: true,
    tlmSiblingOfDojo: false,
	  locale: "zh-cn",
    has: {
      'extend-esri': 1
    },
    paths:{ 
			"echarts":  "./libs/echart/echarts.min",
			"PouchDB":  "./libs/pouchdb.min"
			//,"jQuery": locationPath + "./libs/jquery-1.10.1"
		},
//		"shim": {
////  	'jqueryLibs' : { 'deps' : ['jQuery'] },
//  	"jqueryLibs/jquery.alpha": { 'deps' : ['jQuery'] },
//  	"jqueryLibs/jquery.beta": { 'deps' : ['jQuery'] },
//  	"jqueryLibs/jquery.alpha": ['jQuery'] 
//  },
//  deps : ['jQuery'] ,
    packages : [{
      name: 'controllers',
      location: './gis.js/controllers'
    }, {
      name: 'services',
      location:  './gis.js/services'
    }, {
      name: 'utils',
      location: './gis.js/utils'
    },{
      name: 'stores',
      location: './gis.js/stores'
    }, {
      name: 'widgets',
      location: './gis.js/widgets'
    }, {
      name : "onemap",
      location :  "./onemap"
    },  
    {
      name : "esri",
      location : apiUrl + "esri"
    }, 
    {
      name : "dojo",
      location : apiUrl +  "dojo"
    }, 
    {
      name : "dijit",
      location : apiUrl +"dijit"
    }, 
    {
      name : "dojox",
      location : apiUrl +"dojox"
    }, 
    {name: "jQuery", location:  "./libs", main: "jquery-1.10.1"},
    {name: "jqueryLibs", location:  "./libs/jquery"}]
},[
    'controllers/appcontroller',
    'services/mapservices',"jQuery", "jqueryLibs/jquery.alpha", "jqueryLibs/jquery.beta",
    'dojo/domReady!'
  ], function (appCtrl, mapServices) {

//   console.log($('body').alpha().beta());
//  $('body').alpha();
// 
    console.debug('DEBUG - Starting application');

    var mapCtrl = appCtrl.init({
      elem: 'map-add',
      mapOptions: {
        //basemap: 'gray',
        logo:false,slider:false,
        zoom: 1
      },
      basemap: mapServices.loadServices(),
      mapLoad:function(obj){
      	var scale = obj.map.getScale();
	    },
	    basemapLoad:function(layer){
	    	console.log(layer);
	    },
    });
  });

})();
