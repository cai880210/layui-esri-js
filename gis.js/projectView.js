/*global define, require, location*/
/*jshint laxcomma:true*/
(function () {
  'use strict';

  var pathRX = new RegExp(/\/[^\/]+$/)
    , locationPath = location.pathname.replace(pathRX, '/');

  require([
    'controllers/appcontroller',
    'services/mapservices','Viewer',"jQuery", "jqueryLibs/jquery.alpha", 
    'dojo/domReady!'
  ], function (appCtrl, mapServices,Viewer) {
  
	var aa = layui.jquery
  ,layer = layui.layer
  ,form = layui.form
  ,laypage = layui.laypage;

  layer.ready(function(){
    layer.msg('hello');
  });
    $(function() {
        $('body').alpha();
    });
    console.debug('DEBUG - Starting application');
    var mapCtrl = appCtrl.init({
      elem: 'map-add',
      mapOptions: {
        //basemap: 'gray',
//      extent: new Extent({
//		      "xmin":117.84598507495897,"ymin":24.452872042962895,"xmax":118.16355862232226,"ymax":24.613890414544926,
//		      "spatialReference":{"wkid":4490}
//		    }),
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
    
	var options = {
    // inline: true,
    url: 'data-original',
    ready: function (e) {
      console.log(e.type);
    },
    show: function (e) {
      console.log(e.type);
    },
    shown: function (e) {
      console.log(e.type);
    },
    hide: function (e) {
      console.log(e.type);
    },
    hidden: function (e) {
      console.log(e.type);
    },
    view: function (e) {
      console.log(e.type);
    },
    viewed: function (e) {
      console.log(e.type);
    },
    zoom: function (e) {
      console.log(e.type);
    },
    zoomed: function (e) {
      console.log(e.type);
    }
  };
  //$('#jq22').viewer(options);
  var pictures = document.querySelector('#jq22');
  var viewer = new Viewer(pictures, options);
  });

})();
