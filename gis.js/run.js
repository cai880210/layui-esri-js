/*global define, require, location*/
/*jshint laxcomma:true*/
(function () {
  'use strict';
	var pathRX = new RegExp(/\/[^\/]+$/)
    , locationPath = location.pathname.replace(pathRX, '/');

//dojoConfig = {
//  parseOnLoad: false,
//  async: true,
//  tlmSiblingOfDojo: false,
//	  locale: "zh-cn",
//  has: {
//    'extend-esri': 1
//  },
//  paths:{ 
//			"echarts": locationPath + "../libs/echart/echarts.min"
//		},
//  packages : [{
//    name: 'controllers',
//    location: locationPath + 'map/controllers'
//  }, {
//    name: 'services',
//    location: locationPath + 'map/services'
//  }, {
//    name: 'utils',
//    location: locationPath + 'map/utils'
//  },{
//    name: 'stores',
//    location: locationPath + 'map/stores'
//  }, {
//    name: 'widgets',
//    location: locationPath + 'map/widgets'
//  }, {
//    name : "onemap",
//    location : locationPath + "../onemap"
//  },
//  {name: "jquery", location: locationPath + "../libs/jquery", main: "jquery-1.10.1"}]
//};
//
  require({
    async: true,
    aliases: [
      ['text', 'dojo/text']
    ],
    paths:{ 
			"echarts": locationPath + "../libs/echart/echarts.min",
			"PouchDB": locationPath + "../libs/pouchdb.min"
			,			"jquery": locationPath + "../libs/jquery/jquery-1.10.1"
		},
    packages: [{
      name: 'controllers',
      location: locationPath + '../gis.js/controllers'
    }, {
      name: 'services',
      location: locationPath + '../gis.js/services'
    }, {
      name: 'utils',
      location: locationPath + '../gis.js/utils'
    },{
      name: 'stores',
      location: locationPath + '../gis.js/stores'
    }, {
      name: 'widgets',
      location: locationPath + '../gis.js/widgets'
    }, 
    {
      name : "onemap",
      location : locationPath + "../onemap"
    },
//  {
//  	name: "PouchDB",
//  	location : locationPath + "../libs/pouchdb.min"
//  },
    {
      name: 'app',
      location: locationPath + '../gis.js',
      main: 'main'
    }]
  }, ['app']);
})();
