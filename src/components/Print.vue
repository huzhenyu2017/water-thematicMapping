<template lang="html">
  <div style="padding: 25px 50px; width: 100%; height:100%;display:flex;align-items: flex-start;">
    <div style="flex: 0 0 auto;width:25%;height:100%;background-color:#fff;padding:25px;">
      <!-- 打印参数 -->
      <div v-if="showType === 'print'">
        <!-- <button type="button" name="button" @click="print">打印</button> -->
          <Row style="padding-right:10px">
            纸张类型
              <Select v-model="paperType">
                  <Option v-for="(papertype, index) in papertypes" :value="papertype" :key="index">{{papertype}}</Option>
              </Select>
          </Row>
          <Row span="12">
            纸张方向
              <Select v-model="direction">
                  <Option v-for="(direction, index) in directions" :value="direction" :key="index">{{direction}}</Option>
              </Select>
          </Row>
          <Row span="12">
            纸张宽度(mm)
            <InputNumber v-model="paperType !== '自定义'? size[0]:paperWidth" :disabled="paperType !== '自定义'"></InputNumber>
          </Row>
          <Row span="12">
            纸张高度(mm)
            <InputNumber v-model="paperType !== '自定义'? size[1]:paperHeight" :disabled="paperType !== '自定义'"></InputNumber>
          </Row>
          <ButtonGroup size="large">
              <Button type="ghost" @click="changeType( 'mapping' )">上一步</Button>
              <Button type="ghost" @click="changeType( 'upfitter' )">下一步</Button>
          </ButtonGroup>
      </div>

      <!-- 地图整饰 -->
      <div v-else-if="showType === 'upfitter'">
        图名
        <Input v-model="mapName" placeholder="浙江省..." style="width: 300px"></Input>
        <Slider v-model="legendRatio" :step="0.01" :max="0.5" :min="0.01"></Slider>
        <ButtonGroup size="large">
            <Button type="ghost" @click="changeType( 'print' )">上一步</Button>
            <Button type="ghost" @click="print">下一步</Button>
        </ButtonGroup>
      </div>
    </div>

    <!-- 打印的地图部分 -->
    <div style="flex: 1 1 auto;height:100%;background-color:#fff;display:flex;justify-content:center;align-items:center;">
      <div ref='mapcontainer' style="width:50%;height:80%;box-shadow:10px 10px #ccc;position:relative;">
        <MapContainer @bindMap='bindMap'>
          <TileLayer></TileLayer>
        </MapContainer>
        <SmallUpfitter
        :params = 'params'
        :sizeInPixel = 'sizeInPixel'
        :legendRatio = 'legendRatio'
        :scaleRatio = 'scaleRatio'
        :compassRatio = 'compassRatio'
        v-if="showType === 'upfitter'"/>
      </div>
    </div>
  </div>
</template>

<script>
import MapContainer from './MapContainer.vue';
import TileLayer from './TileLayer.vue';
import SmallUpfitter from './SmallUpfitter.vue';

const PAPERWIDTH = 210;
const PAPERHEIGHT = 297;

export default {
  name: 'Print',
  props: [ 'params', 'labelContext' ],
  data() {
    return {
      // 确认打印参数的地图对象
      printMap: null,
      // 打印纸张类型
      paperType: 'A4',
      papertypes: [ 'A0', 'A1', 'A2', 'A3', 'A4', '自定义' ],
      // 纸张方向
      direction: '横向',
      directions: [ '纵向', '横向' ],
      // 地图中心经纬度
      center: null,
      // 地图分辨率
      resolution: null,
      // 用于双向绑定的纸张尺寸
      paperWidth: 297,
      paperHeight: 210,
      // 当前界面的显示状态
      showType: 'print',
      // 图名
      mapName: '浙江省...',
      // 画布大小（像素值）
      sizeInPixel: null,
      legendRatio: 0.2,
      scaleRatio: 0.1,
      compassRatio: 0.1,
    }
  },
  computed: {
    /**
     * 国际标准纸张尺寸预设
     * @return {[type]} [description]
     */
    size: function() {
      var size;

      switch (this.paperType) {
        case "A4":
          size = [ 210, 297 ];
          break;
        case "A3":
          size = [ 297, 420 ];
          break;
        case "A2":
          size = [ 420, 594 ];
          break;
        case "A1":
          size = [ 594, 841 ];
          break;
        case "A0":
          size = [ 841,1189 ];
          break;
        case "自定义":
          return null;
      }

      if( this.direction === '横向' ) size.reverse();
      if( this.paperType !== '自定义' ) {
        this.paperWidth = size[ 0 ];
        this.paperHeight = size[ 1 ];
      }

      return size;
    },
    /**
     * 最终用的地图尺寸（mm）
     * @return {[type]} [description]
     */
    finalSize() {
      return  this.paperType === '自定义' ? [ this.paperWidth, this.paperHeight ] : this.size;
    }
  },
  watch: {
    /*
    监听纸张方向，更新打印用地图
     */
    direction: function( newValue ) {
      // 更新地图宽高比
      this.r();
    },
    paperWidth: function() {
      this.r();
    },
    paperHeight: function() {
      this.r();
    }
  },
  methods: {
    /**
     * 调整页面显示内容
     * @type {[type]}
     */
    changeType( type ) {
      if( type === 'mapping' ) {
        this.$emit( 'backToMapping' );
      }
      this.showType = type;
    },
    /**
     * [print description]
     * @return {[type]} [description]
     */
    print: function() {
      // 保存地图原本的尺寸
      var oldsize = null;
      var center = null;
      var resolution = null;
      return function() {
        var map = this.__global__.olMap;
        // 保存原来的尺寸，设置打印尺寸
        oldsize = map.getSize();
        // 毫米单位的地图尺寸转换为像素
        let size = this.finalSize.map( function( value ) { return value * window.cm2px / 10 } );
        map.setSize( size );
        // 保存旧中心，设置打印中心
        center = map.getView().getCenter();
        map.getView().setCenter( this.center );
        // 保存旧分辨率，设置新分辨率
        resolution = map.getView().getResolution();
        map.getView().setResolution( this.resolution );
        debugger
        var scope = this;

        // 重设label图层大小
        this.$emit( 'toPrintRize', size );

        setTimeout( function() {
          map.once('postcompose', function(event) {
            debugger
            var canvas = event.context.canvas;
            // if (navigator.msSaveBlob) {
            //   navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
            // } else {
            //   canvas.toBlob(function(blob) {
            //     saveAs(blob, 'map.png');
            //   });
            // }

            if (navigator.msSaveBlob) {
              navigator.msSaveBlob(scope.labelContext.msToBlob(), 'map.png');
            } else {
              scope.labelContext.toBlob(function(blob) {
                saveAs(blob, 'map.png');
              });
            }

          });
          // map.renderSync();

          // 恢复地图原来的状态

          map.setSize( oldsize );
          map.getView().setCenter( center );
          map.getView().setResolution( resolution );

          // 重设label图层大小
          scope.$emit( 'toPrintRize', oldsize );
          map.renderSync();
        }, 0 )

        this.$nextTick(function () {
          // DOM 现在更新了

        })

      }

    }(),
    /**
     * 绑定用于确认打印参数的地图对象
     * @param  {[type]} olMap [description]
     * @return {[type]}       [description]
     */
    bindMap( olMap ) {
      this.printMap = olMap;
      olMap.on( 'pointerdrag', () => {
        this.updateMapParams();
      } )
      olMap.getView().on('change:resolution',() => {
        this.updateMapParams();
      });
    },
    /**
     * 更新地图的打印参数
     * @return {[type]} [description]
     */
    updateMapParams() {
      var olMap = this.printMap;
      // 地图左上角的经纬度
      var lt = olMap.getCoordinateFromPixel( [ 0, 0 ] );
      // 地图右下角的经纬度
      var rb = olMap.getCoordinateFromPixel( olMap.getSize() );
      // 地图的中心位置
      this.center = olMap.getView().getCenter();
      // 地图的分辨率
      // The resolution at which the provided extent will render at the given size.
      this.resolution = olMap.getView().getResolutionForExtent( [ ...lt, ...rb ], this.size );
    },
    /**
     * 更新打印用地图尺寸
     * @type {[type]}
     */
    r() {
      let WH = this.finalSize[ 0 ] / this.finalSize[ 1 ];
      let c = this.$refs.mapcontainer;
      if( !c ) return;
      let h = c.offsetHeight;
      c.style.width = h * WH + 'px';
      let sizeInPixel = [ h * WH, h ];
      this.sizeInPixel = sizeInPixel;
      this.printMap.setSize( sizeInPixel );
      this.mapwidth = h * WH;
      this.mapheight = h;
      this.updateMapParams();
    },
  },
  mounted() {
    var scope = this;
    // 控制打印用地图宽高比和纸张一致
    setTimeout( () => {
      // 计算打印用地图大小（像素值）
      scope.r();

      // 更新地图打印参数
      this.updateMapParams();

      // 当窗口大小改变的时候重新设置canvas的大小
      if (window.addEventListener) {
        window.addEventListener('resize', () => { scope.r() }, false);
      } else if (window.attachEvent)  {
        window.attachEvent('onresize', () => { scope.r() });
      }
    }, 0 )

  },
  components: {
    MapContainer,
    TileLayer,
    SmallUpfitter,
  },
}
</script>

<style lang="css">
</style>
