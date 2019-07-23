
  var pathRX = new RegExp(/\/[^\/]+$/)
    , locationPath = location.pathname.replace(pathRX, '/');
dojoConfig = {
    parseOnLoad: false,
    async: true,
    tlmSiblingOfDojo: false,
	  locale: "zh-cn",
    has: {
      'extend-esri': 1
    },
    paths:{ 
			"echarts": locationPath + "../libs/echart/echarts.min",
			"Viewer": locationPath + "../libs/Viewer/viewer.min",
			"PouchDB": locationPath + "../libs/pouchdb.min"
			//,"jQuery": locationPath + "../libs/jquery-1.10.1"
		},
		"shim": {
//  	'jqueryLibs' : { 'deps' : ['jQuery'] },
    	"jqueryLibs/jquery.alpha": { 'deps' : ['jQuery'] },
    	"jqueryLibs/jquery.beta": { 'deps' : ['jQuery'] },
    	"jqueryLibs/jquery.alpha": ['jQuery'] 
    },
    deps : ['jQuery'] ,
    packages : [{
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
    }, {
      name : "onemap",
      location : locationPath + "../onemap"
    },    
    {name: "jQuery", location: locationPath + "../libs", main: "jquery-1.10.1"},
    {name: "jqueryLibs", location: locationPath + "../libs/jquery"}]
};