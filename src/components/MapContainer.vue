<template>
  <div>
    <!-- 假如父组件需要在子组件内放一些DOM，那么这些DOM是显示、不显示、在哪个地方显示、如何显示，由slot分发负责 -->
    <!-- 具名slot: 将放在子组件里的不同html标签放在不同的位置
          1.父组件在要分发的标签里添加 slot=”name” 属性
          2.子组件在对应分发的位置的slot标签里，添加name=”name” 属性
     -->
    <slot></slot>
  </div>
</template>

<script>

/**
 * ol和proj4都以静态文件的方式引进来的，方便调试
 *
 */

export default {
  name: 'mapContainer',
  data() {
    return {
      _olMap: null
    };
  },
  // props,
  // methods,
  mounted () {
    
    // //获取当前窗口尺寸
	  // var winWidth=0;
    // var winHeight=0;
    // //获取窗口宽度
    // if(window.innerWidth)
    //     winWidth=window.innerWidth;
    // else if (document.body&&document.body.clientWidth)
    //     winWidth=document.body.clientWidth;
    // if(window.innerHeight)
    //     winHeight=window.innerHeight;
    // else if (document.body&&document.body.clientHeight)
    //     winHeight=document.body.clientHeight;
    // //通过深入Document内部对body进行检测，获取窗口大小
    // if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
    // {
    //     winHeight = document.documentElement.clientHeight;
    //     winWidth = document.documentElement.clientWidth;
    // }

    // var marginWidth = winWidth*0.2 + 'px';
    // 地图根节点的样式
    this.$el.style.overflow = "hidden";
    this.$el.style.height = '100%';
    this.$el.style.width = '100%';
    // this.$el.style.margin = `0 0 0 ${marginWidth}`;


    // OpenLayers不支持4490坐标系，需要自定义坐标系
    proj4.defs( "EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs" );
    var projection4490 = new ol.proj.get('EPSG:4490');
    projection4490.setExtent([-180,-90,180,90]);


     var layers = [
       // baseLayer,
     ];

    this._olMap = new ol.Map({
      target: this.$el,
      layers: layers,
      view: new ol.View({
        center: [120.2, 29.4],
        projection: 'EPSG:4490',
        extent: [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634],
        zoom: 8, //8
        minZoom: 7,//7
        maxZoom: 20  //20
      }),
    });

    // 地图对象保存至全局
    if( !this.__global__.olMap ) {
      this.__global__.olMap = this._olMap;
      // this.$forceUpdate();//强制刷新
      const esrijsonFormat = new ol.format.EsriJSON();
      if(this.__global__.type == 'template3'){
        setTimeout( () =>{
          /* 按照制图区域改变地图中心-缩放级别 */
          this.__global__.olMap.getView().setCenter([120.089, 30.552]);
          this.__global__.olMap.getView().setZoom(13);
        },100)
      }

      // 如果是从我的模板进入，复位center与zoom
      if(this.__global__.templateId!=null){
        setTimeout( () =>{ 
          debugger;
          var center = this.__global__.mappingTemplate[0].center;
          var centerPt = new Array();
          centerPt.push(center[0]);
          centerPt.push(center[1]);
          var zoom = this.__global__.mappingTemplate[0].zoom;
          this.__global__.olMap.getView().setCenter(centerPt);
          this.__global__.olMap.getView().setZoom(zoom);
        },100)
      }

    } else { // 打印的情况，将地图对象绑定到父组件print
      this.$emit( 'bindMap', this._olMap );
    }

    // 添加瓦片
    this.$on("addtile", l => this._olMap.addLayer( l ));
    // 移除瓦片
    this.$on("removetile", l => this._olMap.removeLayer( l ));


    Object.defineProperties(this, /** @lends module:map/map# */{
      /**
       * OpenLayers的Map实例
       * @type {ol.Map|undefined}
       */
      $map: {
        enumerable: true,
        get: () => this.$olObject,
      },
      /**
       * OpenLayers view instance.
       * @type {ol.View|undefined}
       */
      $view: {
        enumerable: true,
        get: () => this._view,
      },
    })
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .vue2ol {
    height: 100%;
    width: 100%;
    /* overflow: hidden; */
  }
</style>
