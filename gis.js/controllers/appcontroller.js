/*global define */
define(["dojo/_base/declare",'dojo/_base/lang',
  'controllers/mapcontroller',
  'widgets/edit/editTools','onemap/widgets/MyOverviewMap',
  'esri/IdentityManager'
], function (declare ,lang,MapController, EditTools,MyOverviewMap) {
	var mapCtrl = null;
	var clazz = declare([],{
		
	});

  function mapLoaded(map) {
//  var editTools = new EditTools({
//    map: map
//  }, 'map-tools');

  }
	clazz.init = function (config) {
		if(mapCtrl === null){
			mapCtrl = new MapController(config);
    	config.hasOwnProperty("mapLoad")&&mapCtrl.load().then(config.mapLoad);
    	mapCtrl.mapGallery("myBaseMap-content");
    	config.hasOwnProperty("basemapLoad")&&mapCtrl.basemapLoad().then(config.basemapLoad);
    	config.hasOwnProperty("zoomEnd")&&mapCtrl.zoomEnd(config.zoomEnd);
    	
		}
		return mapCtrl;
  }

  return clazz;

});
