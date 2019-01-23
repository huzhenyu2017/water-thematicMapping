<template>
  <transition name="scale" mode="out-in">
    <div v-bind:class="{ layercardbox: true }" v-if="param.isText" key="text">
      <Card>
          <p slot="title">{{param.name}}-注记配置</p>
          <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
              {{ visible }}
          </span>
          <Row>
            注记字体
            <Select v-model="param.font">
                <Option v-if="textFonts.length" v-for="textFont in textFonts" :value="textFont" :key="textFont">{{ textFont }}</Option>
            </Select>
          </Row>
          <Row>
            注记风格
            <Select v-model="param.fontStyle">
                <Option v-for="item in textStyles" :value="item.enType" :key="item.enType">{{ item.cnType }}</Option>
            </Select>
          </Row>
          <Row>
            注记位置
            <Select v-model="param.textBaseline">
                <Option v-for="item in textBaselines" :value="item.enType" :key="item.enType">{{ item.cnType }}</Option>
            </Select>
          </Row>
          <!-- <Row>
            注记间隔
            <Select v-model="param.maxAngle">
                <Option v-for="item in maxAngles" :value="item.enType" :key="item.enType">{{ item.cnType }}</Option>
            </Select>
          </Row> -->
          <Row>
            水平偏移
            <Slider v-model="param.offsetX" show-input :max='50' :min='-50' :step='2' show-tip='never'></Slider>
          </Row>
          <Row>
            垂直偏移
            <Slider v-model="param.offsetY" show-input :max='50' :min='-50' :step='2' show-tip='never'></Slider>
          </Row>
          <Row>
            <div style="margin-top:10px;">
              <div style="float:left">
                <span>注记大小</span>
              </div>
              <div style="float:right">
                <i-switch size="large" v-model="manual">
                  <span slot="open">手动</span>
                  <span slot="close">自动</span>
                </i-switch>
              </div>
            </div>
          </Row>
          <Row>
            <Slider v-model="param.fontSize" :max='30' :min='5' :step='1' show-tip='never' :disabled="!manual"></Slider>
          </Row>
          <Row>
            边线宽度
            <Slider v-model="param.fontStrokeWidth" show-input :max='5' :min='0' :step='1' show-tip='never'></Slider>
          </Row>
          <Row>
            <Button type="ghost" size="small" @click="changeToText"><Icon type="chevron-left"></Icon>符号配置</Button>
            <Button type="ghost" size="small" @click.prevent="toColorPage">注记颜色<Icon type="chevron-right"></Icon></Button>
          </Row>
      </Card>
    </div>

    <div v-bind:class="{ layercardbox: true }" v-else key="polyline">
      <Card>
        <p slot="title">{{param.name}}</p>
        <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
            {{ visible }}
        </span>
        <!-- 控制线宽 -->
        <Row>
          <div style="margin-top:10px;">
            <div style="float:left">
              <span>线宽</span>
            </div>
            <div style="float:right">
              <i-switch size="large" v-model="param.manual_width">
                <span slot="open">手动</span>
                <span slot="close">自动</span>
              </i-switch>
            </div>
          </div>
        </Row>
        <Row>
          <Slider v-model="param.width" :max='widthMax' :min='widthMin' :step='0.1' show-tip='never' :disabled="!param.manual_width"></Slider>
        </Row>
        <!--自定义样式的样式间隔-->
        <Row>
          <div style="margin-top:10px;">
            <div style="float:left">
              <span>样式间隔</span>
            </div>
            <div style="float:right">
              <i-switch size="large" v-model="param.manual_interval">
                <span slot="open">手动</span>
                <span slot="close">自动</span>
              </i-switch>
            </div>
          </div>
        </Row>
        <Row>
          <Slider v-model="param.interval" :max='intervalMax' :min='intervalMin' :step='0.0001' show-tip='never' :disabled="!param.manual_interval"></Slider>
        </Row>
        <Row>
          <!-- <ButtonGroup shape="circle"> -->
              <Button type="ghost" size="small" @click="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
              <Button type="ghost" size="small" @click="changeToText">注记配置</Button>
              <Button type="ghost" size="small" @click.prevent="toStylePage">样式 <Icon type="chevron-right"></Icon></Button>
          <!-- </ButtonGroup> -->
        </Row>
      </Card>
    </div>
  </transition>
</template>

<script>

  const INTERVAL = {
    '7': 0.02,
    '8': 0.0175,
    '9': 0.015,
    '10': 0.0125,
    '11': 0.01,
    '12': 0.0075,
    '13': 0.005,
    '14': 0.0025,
    '15': 0.00125,
    '16': 0.001,
    '17': 0.0005,
    '18': 0.0003,
    '19': 0.0002,
    '20': 0.0001,
    '21': 0.0001,
    '22': 0.0001,
  }; // 每个地图分级都对应一个样式间距；

  export default {
    name: 'LinePanel',
    props: ['param','topMenu'],
    mounted() {
      var scope = this;
      // 确保ol地图对象已经保存
      setTimeout( function() {
        /**
         * 监听地图分辨率变化的处理函数
         * @return {[type]} [description]
         */
        function checkZoom () {
          // 如果是手动控制的话直接返回
          // debugger
          let zoom = scope.zoom = map.getView().getZoom();
          // 自动控制注记大小
          if( !scope.manual ) {
            const fontSize = scope.param.text.initSize;
            // 计算新的符号缩放大小
            var dela = parseInt(zoom - minZoom -1);
            var fontTempSize =  fontSize + dela*1;
            // scope.param.text.font = `italic ${fontTempSize}px 宋体,sans-serif`;
            scope.param.fontSize = fontTempSize;
          }
          // 自动计算新的符号缩放大小
          if( !scope.param.manual_width ) {
            // scope.param.width = ( scope.widthMax - scope.widthMin ) * ( ( zoom - minZoom ) / ( maxZoom - minZoom ) )
            const initWidth = scope.param.text.initWidth;
            var dela = parseInt(zoom - minZoom -1);
            // 确保线宽不为负
            if(initWidth+dela*0.2 <= initWidth){
              scope.param.width = initWidth+0.2;
            }
            else{
              scope.param.width = initWidth + dela*0.2;
            }   
          }
          // 自动控制样室间隔
          if( !scope.param.manual_interval ) {
            scope.param.interval = INTERVAL[parseInt( zoom )];
            // console.log( parseInt( zoom ), INTERVAL[parseInt( zoom )] );
          } else {
            // 如果样式间隔是手动控制，每次缩放都要重新赋值间隔的区间
            // 最优间距
            // const best = INTERVAL[parseInt( zoom )];
            // scope.intervalMax = best * 4;
          }
        }

        var map = scope.__global__.olMap;
        map.getView().on('change:resolution',checkZoom);
        var maxZoom = map.getView().getMaxZoom();
        var minZoom = map.getView().getMinZoom();
      }, 0 )
    },
    methods: {
      /**
       * 切换至注记配置面板
       * @return {[type]} [description]
       */
      changeToText() {
        this.param.isText = !this.param.isText;
      },
      /**
       * 更改图层可见性
       * @return {[type]} [description]
       */
      changeVisibility() {
        this.param.visible = !this.param.visible;
      },
      /**
       * 跳转到颜色选择页
       * @return {[type]} [description]
       */
      toColorPage() {
        this.topMenu.toPage( 'color', this.param,{ isColroText :this.param.isText} );
      },
      /**
       * 跳转到样式选择页
       * @return {[type]} [description]
       */
      toStylePage() {
        this.topMenu.toPage( 'style', this.param );
      }
    },
    data () {
      return {
        // manual_width: false, // 线宽是否手动
        // manual_interval: false, // 样式间隔是否手动
        widthMax: 10,
        widthMin: 0.04,
        intervalMax: 0.02,
        intervalMin: 0.0001,
        zoom: 7,
        // 注记字体
        textFonts : ["宋体","微软雅黑","黑体","微软正黑体","楷体","仿宋","细明体"],
        // 注记字体样式
        textStyles : [{"enType":"italic","cnType":"斜体"},{"enType":"bold","cnType":"粗体"},{"enType":"normal","cnType":"常规"},{"enType":"lighter","cnType":"细体"}],
        // 注记放置位置
        textBaselines:[{"enType":"middle","cnType":"居中"},{"enType":"bottom","cnType":"底部"},{"enType":"top","cnType":"顶部"},{"enType":"hanging","cnType":"悬挂"},{"enType":"ideographic","cnType":"表意"}],//{"enType":"alphabetic","cnType":"字母次序"}
        // 是否手动调整字体大小
        manual: false,
        // 注记最大间隔角度
        maxAngles: [{"enType":Math.PI/3,"cnType":"60度"},{"enType":Math.PI/3.5,"cnType":"50度"},{"enType":Math.PI/4,"cnType":"45度"},{"enType":Math.PI/4.5,"cnType":"40度"},{"enType":Math.PI/5,"cnType":"30度"}],
      }
    },
    computed: {
      /**
       * 图层可见性
       * @return {[type]} [description]
       */
      visible: function() {
        return this.param.visible? '隐藏' : '显示';
      },
      // /**
      //  * 样式间隔的最大值
      //  * @return {[type]} [description]
      //  */
      // intervalMax: function() {
      //
      //   // 如果是手动控制，地图的每一级都要重新绑定间隔的最大值
      //   if( this.manual_interval ) {
      //     console.log(this.zoom);
      //     return INTERVAL[parseInt( this.zoom )] * 4;
      //   } else { // 如果是自动控制
      //     return 0.02;
      //   }
      // },
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
