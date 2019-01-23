<template>
  <layout :style="{height: '100%', width: '100%'}">
    <layout v-show="showType === 'mapping'" :style="{height: '100%', width: '100%'}">
        <MapMenu :params = 'params'/>
        <MapContainer :size='size' :resolution='resolution' :center='center'>
          <!-- WMTS瓦片底图(父组件为MapContainer) -->
          <TileLayer/>
          <!-- 矢量专题要素图层(父组件为MapContainer) -->
          <template v-for="(param, index) in params">
            <component v-bind:is='param.layer' :param = 'param' :index = 'index' :key = 'index' @feaure-loaded='passFeatures'></component>
          </template>
        </MapContainer>
        <!-- 和ol的canvas同属于一个层叠上下文，且层叠顺序相同，所以后来居上，保证Upfitter和label在ol的canvas上面 (推荐始终使用 kebab-case 的事件名)-->
        <Label  :params = 'params' :features = 'features' :editable='editable' @pass-context='bindLabelContext'/>  
        <Upfitter :params = 'params' :editable='editable'/>
        <Tool @switch='editMapElements' @draw='draw' :editable='editable' :draw='drawType' :params='params'/>
        <!-- <button @click="printTest">打印测试</button> -->
        <!-- <MapLegend :params = 'params' /> -->
    </layout>
    <Print
      v-if="showType === 'print'"
      @toPrintRize='toPrintRize'
      @backToMapping='backToMapping'
      :params = 'params'
      :labelContext='labelContext'
    />
  </layout>
</template>

<script>

  // 制图界面的顶层组件
  import MapMenu from './MapMenu.vue'
  import MapContainer from './MapContainer.vue'
  import TileLayer from './TileLayer.vue'
  import LineLayer from './LineLayer.vue'
  import PointLayer from './PointLayer.vue'
  import PolygonLayer from './PolygonLayer.vue'
  import Print from './Print.vue'
  // import MapLegend from './Legend.vue'
  import Tool from './Tool.vue'
  import Upfitter from './Upfitter.vue'
  import Label from './Label.vue'
  import { PolylineParam, PointParam, PolygonParam } from '../core/mappingParams.js'
  import observe from '../core/observer.js'

  /****************************/
  var source = new ol.source.Vector();

  var styleFunction = function(feature) {
    var geometry = feature.getGeometry();
    var styles = [
      // linestring
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        })
      })
    ];

    geometry.forEachSegment(function(start, end) {
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      var rotation = Math.atan2(dy, dx);
      // arrows
      styles.push(new ol.style.Style({
        geometry: new ol.geom.Point(end),
        image: new ol.style.Icon({
          src: 'https://openlayers.org/en/v4.6.5/examples/data/arrow.png',
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation
        })
      }));
    });

    return styles;
  };
  var vector = new ol.layer.Vector({
    source: source,
    style: styleFunction
  });

  var added = false;
  /****************************/

  const mappingParams = {
    // 点
    esriGeometryPoint: PointParam,
    // 线
    esriGeometryPolyline: PolylineParam,
    // 面
    esriGeometryPolygon: PolygonParam,
  }

  /**
   * 当参数数组params中所有的参数都获得了各自的制图数据之后，调用allDone方法
   * @type {[type]}
   */
  Object.defineProperty( Array.prototype, 'doneRequestParams', {
    set: function(newValue) {
      if( newValue < 0 || newValue > this.length ) return;
      if( newValue === this.length ) this.allDone();
      this._doneRequestParams = newValue;
    },
    get: function() {
      return this._doneRequestParams || 0;
    }
  })
  // 传入allDone
  Array.prototype.callback = function( fn ) { this.allDone = fn; }

  export default {
    name: 'Mapping',
    components: {
      MapMenu,
      MapContainer,
      TileLayer,
      Label,
      Upfitter,
      Tool,
      LineLayer,
      PointLayer,
      PolygonLayer,
      Print,
      // MapLegend,
    },
    data () {
      return {
        params: null,
        editable: 'feature', // 当前可编辑的canvas
        drawType: null, // 当前的涂鸦类型，null就是不涂鸦
        features: [],
        painting: null, // 地图上涂鸦的ol.interaction对象
        showType: 'mapping',
        labelContext: null,

        // 地图尺寸，用于打印前后设置尺寸
        size: null,
        // 分辨率
        resolution: null,
        // 地图中心经纬度
        center: null,
      }
    },
    methods: {
      /**
       * 绑定canvas上下文到当前组件
       * @param  {[type]} ctxt [description]
       * @return {[type]}      [description]
       */
      bindLabelContext: function( ctxt ) {
        this.labelContext = ctxt;
      },
      /**
       * 设置地图打印尺寸
       * @return {[type]} [description]
       */
      toPrintRize( size ){
        this.size = size;
      },
      /**
       * 返回制图界面
       * @return {[type]} [description]
       */
      backToMapping() {
        this.showType = 'mapping';
      },
      /**
       * 根据excel读到的数组生成geojson对象
       * @param  {[Array]} a      [excel读到的数组对象]
       * @param  {[Object]} fields [保存了有效字段的对象]
       * @return {[Object]}        [返回GeoJSON对象]
       */
       getGeoJSON: function( a, fields ) {
        var geojson = {
          "type": "FeatureCollection",
          "features": null,
         };

        geojson.features = a.map( function( value, index ) {
          var feature = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [ value[ fields.x ], value[ fields.y ] ],
            },
            "properties": {

            }
          }
          return feature;
        } )

        return geojson;
      },
      /**
       * 切换至编辑图面元素或者标注
       * @param string type 要编辑的元素类型字符串
       * @return {[type]} [description]
       */
      editMapElements( type ) {
        if( type === 'print' || type === 'mapping' ) {
          this.showType = type;
          return;
        }
        debugger
        this.editable  = type;
        if( this.editable !== 'feature' ) {
          this.drawType = null;
          this.__global__.olMap.removeInteraction( this.painting );
        }
      },
      /**
       * 涂鸦
       * @param  {string} type 涂鸦的类型
       * @return {[type]}      [description]
       */
      draw:function( type ) {

          var map = this.__global__.olMap;

          if( !added ) { map.addLayer( vector ); added = true; }

          // 两次点选同一个绘制，关闭绘制，或者当当前绘制的canvas不是ol的canvas的时候也关闭绘制
          if( type === this.drawType || this.editable !== 'feature' ) {
            this.drawType = null;
            map.removeInteraction( this.painting );
            return;
          }

          this.drawType = type;

          this.painting = new ol.interaction.Draw({
            source: source,
            type: 'LineString'
          })

          map.addInteraction( this.painting );
      },
      /**
       * 矢量要素图层加载完成后，将要素信息整体修饰后(添加注记信息),传递给label组件
       * @param Array featureArr 要素数组
       * @param number index 要素对应params的索引
       * @param String textField 对应图层要素名称字段
       * @return {[type]} [description]
       */
      passFeatures( index, featureArr,textField,showField ) {
        debugger
        this.features[ index ] = featureArr.map( ( feature, i ) => {
          var a = {};

          // origin属性：标注位置的原点
          switch ( this.params[ index ].layer ) {
            case 'PointLayer':
              // debugger;
              a.origin = feature.getGeometry().getCoordinates();
              a.name = feature.values_[textField];
              if(showField){
                a.value = feature.values_[showField];
              }
              // a.text = this.params[ index ].text;//用于区分不同的点要素图层
              break;
            case 'LineLayer':
              // a.origin =
              break;
            case 'PolygonLayer':

              break;
          }
          return a;
        } )
      },
    },
    created() {
      /* 如果新建走如下流程,如果是编辑模板,则另走服务器获取则直接赋值 */
      // 没有路由缓存，所以，每次路由改变都会重新构建一遍组件
      // 加载
      this.$Spin.show();
      //如果是新建模板
      if(this.__global__.mappingTemplate === null){
        // 获取当前的制图模板类型
        const MAPINGTYPE = this.__global__.type;
        // 获取当前的制图数据数组
        const DATA = this.__global__.mappingData;
        // 制图参数，将传给子组件
        var params = [];

        DATA.forEach( ( value, index ) => {
          // 数据类型，（点线面）
          const DATATYPE = value.geotype;
          // 点线面对应的参数
          const Param = mappingParams[ DATATYPE ] || mappingParams[ "esriGeometryPoint" ];
          var p = new Param();

          // 如果是系统发布的服务数据
          if( value.type === 'default' ) {
            debugger;
            // 模板对应图层的样式以及注记配置规则(面要素测试)
            if(DATATYPE === "esriGeometryPolygon"){
              p.text = value.rules.text;
              p.color = value.rules.color;
              p.stylePic = value.rules.stylePic;
              //要想某个图层参数改变-->渲染同步更新,如果子属性也是对象，则需要在observer中对子属性(对象)进行处理
              p.font = value.rules.text.font;//字体
              p.fontStyle = value.rules.text.fontStyle;//字体样式
              p.fontSize = value.rules.text.fontSize;//字号
              p.fontFamily = value.rules.text.fontFamily;//字体系列
              p.fontFill = value.rules.text.fill.color_,//字体颜色
              p.fontStrokeColor = value.rules.text.stroke.color_,//字体边线
              p.fontStrokeWidth = value.rules.text.stroke.width_;//边线宽度
              p.offsetX = value.rules.text.offsetX;//x方向偏移
              p.offsetY = value.rules.text.offsetY;//y方向偏移
              p.textAlign = value.rules.text.textAlign;//注记放置位置
            }
            if(DATATYPE === "esriGeometryPolyline"){
              p.text = value.rules.text;
              p.color = value.rules.color;
              p.stylePic = value.rules.stylePic;
              p.custom = value.rules.custom;
              //要想某个图层参数改变-->渲染同步更新,如果子属性也是对象，则需要在observer中对子属性(对象)进行处理
              p.font = value.rules.text.font;//字体
              p.fontStyle = value.rules.text.fontStyle;//字体样式
              p.fontSize = value.rules.text.fontSize;//字号
              p.fontFamily = value.rules.text.fontFamily;//字体系列
              p.fontFill = value.rules.text.fill.color_,//字体颜色
              p.fontStrokeColor = value.rules.text.stroke.color_,//字体边线
              p.fontStrokeWidth = value.rules.text.stroke.width_;//边线宽度
              p.offsetX = value.rules.text.offsetX;//x方向偏移
              p.offsetY = value.rules.text.offsetY;//y方向偏移
              p.textBaseline = value.rules.text.textBaseline;//线注记放置位置
              p.maxAngle = value.rules.text.maxAngle;
            }
            if(DATATYPE === "esriGeometryPoint"){
              if(value.name ==="泵站"){
                if(this.__global__.type === 'template3'){
                  p.text = value.rules[1].text;
                  p.color = value.rules[1].color;
                  p.stylePic = p.src = value.rules[1].stylePic;
                  p.showLabels = value.rules[1].showLabels;
                  p.scale = value.rules[1].scale;
                  //要想某个图层参数改变-->渲染同步更新,如果子属性也是对象，则需要在observer中对子属性(对象)进行处理
                  p.font = value.rules[1].text.font;//字体
                  p.fontStyle = value.rules[1].text.fontStyle;//字体样式
                  p.fontSize = value.rules[1].text.fontSize;//字号
                  p.fontFamily = value.rules[1].text.fontFamily;//字体系列
                  p.fontFill = value.rules[1].text.fill,//字体颜色
                  p.fontStrokeColor = value.rules[1].text.stroke,//字体边线
                  p.fontStrokeWidth = value.rules[1].text.strokeWidth;//边线宽度
                }else{
                  p.text = value.rules[0].text;
                  p.color = value.rules[0].color;
                  p.stylePic = p.src = value.rules[0].stylePic;
                  p.showLabels = value.rules[0].showLabels;
                  p.scale = value.rules[0].scale;
                  //要想某个图层参数改变-->渲染同步更新,如果子属性也是对象，则需要在observer中对子属性(对象)进行处理
                  p.font = value.rules[0].text.font;//字体
                  p.fontStyle = value.rules[0].text.fontStyle;//字体样式
                  p.fontSize = value.rules[0].text.fontSize;//字号
                  p.fontFamily = value.rules[0].text.fontFamily;//字体系列
                  p.fontFill = value.rules[0].text.fill,//字体颜色
                  p.fontStrokeColor = value.rules[0].text.stroke,//字体边线
                  p.fontStrokeWidth = value.rules[0].text.strokeWidth;//边线宽度
                }
              }
              else{
                p.text = value.rules.text;
                p.color = value.rules.color;
                p.stylePic = p.src = value.rules.stylePic;
                p.showLabels = value.rules.showLabels;
                p.scale = value.rules.scale;
                //要想某个图层参数改变-->渲染同步更新,如果子属性也是对象，则需要在observer中对子属性(对象)进行处理
                p.font = value.rules.text.font;//字体
                p.fontStyle = value.rules.text.fontStyle;//字体样式
                p.fontSize = value.rules.text.fontSize;//字号
                p.fontFamily = value.rules.text.fontFamily;//字体系列
                p.fontFill = value.rules.text.fill,//字体颜色
                p.fontStrokeColor = value.rules.text.stroke,//字体边线
                p.fontStrokeWidth = value.rules.text.strokeWidth;//边线宽度
              }
            }

            // 按属性分级别显示测试
            if(value.hasOwnProperty('showNodes')){
              debugger
              if(value.name ==="泵站"){
                if(this.__global__.type === 'template3'){
                  p.zoomArray = value.showNodes.zoomArray[1];
                  p.showField = value.showNodes.showField;
                  p.showFieldValue = value.showNodes.zoomArray[1][1];//给属性一个初始值(zoom=8的时候的值)
                }else{
                  p.zoomArray = value.showNodes.zoomArray[0];
                  p.showField = value.showNodes.showField;
                  p.showFieldValue = value.showNodes.zoomArray[0][1];//给属性一个初始值(zoom=8的时候的值)
                }
              }else{
                p.zoomArray = value.showNodes.zoomArray;
                p.showField = value.showNodes.showField;
                p.showFieldValue = value.showNodes.zoomArray[1];//给属性一个初始值(zoom=8的时候的值)
              }
            }

            // 数据源，数据源不需要observable，如果是用户上传的话，会是一个对象，就比较复杂
            // 如果需要按照所选行政区域进行数据请求，可以使用where选项(如：where=ADCD='海宁市')
            var filter;
            if(this.__global__.type == 'template3'){
              // filter = "ADCD='德清县'";//测试按照行政区域筛选
              //   if(value.name ==="防汛物资仓库"){
              //     filter = "ADCD='德清县' or ADMN='德清县'";
              //   }
              filter = "1=1";//无筛选条件(全选)
            }
            else{
              filter = "1=1";//无筛选条件(全选)
            }
           
            p.url = `${value.address}/0/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=&geometryType=${value.geotype}&outFields=*&where=${filter}`;
            p.textField = value.text;
            p.gradeField= value.gradeField;
          }

          // 如果数据是用户上传的数据
          else if( value.type === 'custom' ) {
            // 目前只支持点数据
            p.url = this.getGeoJSON( value.data, value.data.fields )
          }
          debugger
          // 参数可响应
          observe( p );

          p.container = params;//p.container用于在layers中监听是否加载成功数据 -->param.container.doneRequestParams++;
          // 数据名称
          p.name = value.name;
          params.push( p );

        })
        this.params = params;
        // 已经获取到制图数据源数据的参数个数
        params.doneRequestParams = 0;
        // 数据都添加到地图上后，隐藏加载动画
        const allDone = () => {
          this.$Spin.hide();
          this.params.forEach( ( value ) => { delete value.container } );
        };
        params.callback( allDone );
      }

      // 如果从我的模板进入
      else{
        let templateContent = this.__global__.mappingTemplate;
        // 制图参数，将传给子组件
        let params = [];
        templateContent.forEach( ( value, index ) => {
          // 数据类型，（点线面）
          let DATATYPE = "";
          let layerType = value.layer;
          switch(layerType){
            case "LineLayer":
              DATATYPE = "esriGeometryPolyline"
              break;
            case "PointLayer":
              DATATYPE = "esriGeometryPoint"
              break;
            case "PolygonLayer":
              DATATYPE = "esriGeometryPolygon"
              break;
            default: break;
          }
          // 点线面对应的参数
          const Param = mappingParams[ DATATYPE ];
          var p = new Param();

          // 简化操作，恢复模板对应制图参数
          debugger
          p = value;
          // 针对面要素的图片纹理填充，需要进行手动设置
          if(layerType=='PolygonLayer'){
            if(typeof(value.color)=== "object"){
              // 获取canvas二维绘图上下文
              var cnv = document.createElement('canvas');
              var ctx = cnv.getContext('2d');
              var pattern, img;

              /**
               * 异步获取图片
               * @param  {[type]} src [description]
               * @return {[type]}     [description]
               */
              function getImage( src ){
                return new Promise( ( resolve, reject ) => {
                  var img = new Image();
                  img.src = src;
                  img.onload = function () {
                    resolve( this );
                  }
                } )
              }
              //then方法的第一个参数是resolved状态的回调函数，第二个参数（可选）是rejected状态的回调函数
              //then方法返回的是一个新的Promise实例,因此可以采用链式写法，即then方法后面再调用另一个then方法
              getImage(value.stylePic)
              .catch((error)=> {
                console.log('oh no', error);
              })
              .then((img)=>{ 
                pattern = ctx.createPattern(img, 'repeat');
                p.color = pattern;
              });
            }else{
              p.color = value.color;
            }
          }

          // 为制图参数添加观察者，保证参数可响应
          observe( p );
          p.container = params;
          params.push( p );

        })

        this.params = params;
        // 已经获取到制图数据源数据的参数个数
        params.doneRequestParams = 0;
        // 数据都添加到地图上后，隐藏加载动画
        const allDone = () => {
          this.$Spin.hide();
          this.params.forEach( ( value ) => { delete value.container } );
        };
        params.callback( allDone );
      }

    },
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
