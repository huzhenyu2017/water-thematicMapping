<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>

  /**
   * @vueMethods
   */

   const tileGridWMTS = new ol.tilegrid.WMTS({
     //分辨率，每级对应的分辨率，可在arcgis server的mapserver最后面找到
        resolutions: [
          1.406250026231581,
          0.7031250131157905,
          0.3515625065578952,
          0.1757812532789476,
          0.0878906266394738,
          0.0439453133197369,
          0.02197265665986845,
          0.010986328329934226,
          0.005493164164967113,
          0.0027465820824835565,
          0.0013732910412417782,
          6.866455206208891E-4,
          3.4332276031044456E-4,
          1.7166138015522228E-4,
          8.583069007761114E-5,
          4.291534503880557E-5,
          2.1457672519402785E-5,
          1.0728836259701392E-5,
          5.364418129850696E-6,
          2.682209064925348E-6,
          1.341104532462674E-6
        ],
        // resolutions:[
        //   0.010998661129462496,
        //   0.005499329375000746,
        //   0.002749664687500373,
        //   0.0013748335334806893,
        //   6.874167667403447E-4,
        //   3.4370838337017233E-4,
        //   1.7185419168508616E-4,
        //   8.592709584254308E-5,
        //   4.296354792127154E-5,
        //   2.148177396063577E-5,
        //   1.0740886980317885E-5,
        //   5.370443490158943E-6,
        //   2.684032014576556E-6,
        //   1.342016007288278E-6
        // ],
        //原点
        origin: [ -180.0, 90.0 ],
        // origin: [ -400.0, 400.0 ],
        tileSize: 256,
        //每级对应的id，与分辨率数组长度一致，必填。可在WMTS描述文档的<ows:Identifier>找到
        matrixIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13","14","15","16","17","18","19","20"]
        // matrixIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]
    });

    const options = {
        // 解决地图输出canvas污染问题
        // crossOrigin: 'anonymous',
        name: "basemap",
        tileGrid: tileGridWMTS,
        matrixSet: 'default028mm',
        projection: 'EPSG:4490',
        layer: "zjslmap_zjslvectormap",
        style: "default",
        version: "1.0.0",
        format: "image/png",
        transition: 0,
        opaque: 0,
        requestEncoding: "REST",
        //路径可以在WMTS描述文档里面的<ResourceURL>里找到
        url:
        'http://114.215.249.116:6080/arcgis/rest/services/zjslmap/zjslvectormap/MapServer/WMTS/tile/1.0.0/zjslmap_zjslvectormap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png'
        // 'http://223.75.52.36:26080/arcgis/rest/services/test4/shuili111/MapServer/WMTS/tile/1.0.0/zjslmap_zjslvectormap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png'
    }

  export default {
    name: 'tilelayer',
    // props: ['params'],
    data() {
      return {
        _olLayer: null, // 用来在内部保存layer的引用
      }
    },
    created() {

      /**
       * 底图图层
       */
      this._olLayer = new ol.layer.Tile({
          extent: [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634],
          source: new ol.source.WMTS(options)
      });

      // var params = this.params
      //
      // // 图层对象都要定义一个update函数，用于实时更新制图参数
      // this._olLayer.update = function() {
      //   console.log( params );
      // }
      //
      // // 将制图参数和图层对象绑定
      // this.params.__myob__.dep.addSub( this._olLayer );

      // 将当前图层添加到ol.Map中
      this.$nextTick(t => this.$parent.$emit("addtile", this._olLayer));

    },
    mounted() {

    }
  }
</script>
