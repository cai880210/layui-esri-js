/**
 * onemap.layer.TDTAnnoLayer
 * 调用天地图
 * @createDate : 2017-02-28
 * @classDescription : 地图
 */
define(["dojo/_base/declare","esri/layers/TiledMapServiceLayer","esri/layers/TileInfo","esri/geometry/Extent","esri/SpatialReference"],function(declare,TiledMapServiceLayer,TileInfo,Extent,SpatialReference){
	return 	declare([TiledMapServiceLayer], {
		/**
		 * 定义属性变量
		 */
		tileMatrixSet : "",
		tileInfo: null,  
		//tileMatrixSet：影像或者矢量    spatialReference ：坐标系  lods：比例尺
		constructor: function(tileMatrixSet,mapwkids,lods) {
			this.tileMatrixSet = tileMatrixSet;
			this.spatialReference =  new SpatialReference({wkid:parseInt(mapwkids)});
		    this.initialExtent = (this.fullExtent = new Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference));
	        this.tileInfo = new TileInfo({
                "rows": 256,
                "cols": 256,
                "compressionQuality": 0,
                "origin": {
                    "x": -180,
        
                    "y": 90
                },
                "spatialReference": {
                    "wkid": parseInt(mapwkids)
                },
                "lods": lods
            });
            this.loaded = true;
            this.onLoad(this);
        },
       getTileUrl: function (level, row, col) {
			return "http://?TileType=CGCS_DOMMAP_CIA&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col + "&d="+ new Date().getTime()+"";
            //return "http://t0.tianditu.cn/"+this.tileMatrixSet+"_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER="+this.tileMatrixSet+"&STYLE=default&TILEMATRIXSET=c&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col + "&FORMAT=tiles";
        },
		/**
		 * 销毁
		 */
		destroy: function(){
			
		}
	});
});

