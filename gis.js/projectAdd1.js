/*global define, require, location*/
/*jshint laxcomma:true*/
(function () {
  'use strict';

  var pathRX = new RegExp(/\/[^\/]+$/)
    , locationPath = location.pathname.replace(pathRX, '/');

  require([
    'controllers/appcontroller',
    'services/mapservices',"jQuery", "jqueryLibs/jquery.alpha", "jqueryLibs/jquery.beta",
    'dojo/domReady!'
  ], function (appCtrl, mapServices) {
  
	var aa = layui.jquery
  ,layer = layui.layer
  ,form = layui.form
  ,laypage = layui.laypage;

  layer.ready(function(){
    layer.msg('hello');
  });
      $(function() {
        $('body').alpha().beta();
    });
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
      	
	    },
	    basemapLoad:function(layer){
	    	console.log(layer);
	    },
    });
  });

})();
