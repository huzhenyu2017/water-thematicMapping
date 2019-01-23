<template>
    <transition name="scale" mode="out-in">
      <div v-bind:class="{ layercardbox: true }" v-if="param.isGrade" key="grade">
        <Card>
            <p slot="title">{{param.name}}-分级设色</p>
            <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
                {{ visible }}
            </span>
            <Row>
              <Select v-model="param.gradeField">
                  <Option v-if="param.fields.length" v-for="item in param.fields" :value="item.field" :key="item.field">{{ item.field }}</Option>
              </Select>
            </Row>
            <Row>
              <Select v-model="param.gradeMethod">
                  <Option v-for="item in gradeMethods" :value="item" :key="item">{{ item }}</Option>
              </Select>
            </Row>
            <Row>
              分级数
              <Slider v-model="param.gradeCount" show-input :max='10' :min='3' :step='1' show-tip='never'></Slider>
            </Row>
            <Row>
              <Button type="ghost" size="small" @click="changeToGrade">普通纹理</Button>
              <Button type="ghost" size="small" @click.prevent="toColorPage">选择色系</Button>
            </Row>
        </Card>
      </div>

      <div v-bind:class="{ layercardbox: true }" v-else-if="param.isText" key="text">
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
              <Select v-model="param.textAlign">
                  <Option v-for="item in textAligns" :value="item.enType" :key="item.enType">{{ item.cnType }}</Option>
              </Select>
            </Row>
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
              <Slider v-model="param.fontSize" :max='30' :min='10' :step='1' show-tip='never' :disabled="!manual"></Slider>
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

      <div v-bind:class="{ layercardbox: true }" v-else key="polygon">
        <Card>
            <p slot="title">{{param.name}}</p>
            <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
                {{ visible }}
            </span>
            <Row>
                <!-- <ButtonGroup shape="circle"> -->
                    <Button type="ghost" size="small" @click.prevent="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
                    <Button type="ghost" size="small" @click="changeToGrade">分级设色</Button>
                    <Button type="ghost" size="small" @click="changeToText">注记配置</Button>
                    <Button type="ghost" size="small" @click.prevent="toStylePage">样式 <Icon type="chevron-right"></Icon></Button>
                <!-- </ButtonGroup> -->
            </Row>
        </Card>
      </div>
      
    </transition>
</template>

<script>

  export default {
    name: 'PolygonPanel',
    props: ['param', 'topMenu'],
    //测试注记能否随比例尺变化(测试成功!)
    mounted() {
      var scope = this;
      // 确保ol地图对象已经保存
      setTimeout( function() {
        /**
         * 监听地图分辨率变化的处理函数
         * @return {[type]} [description]
         */
        function checkZoom () {
          // 是否自动适配注记大小（如果是手动控制的话直接返回）
          if( !scope.manual ) {
            // debugger;
            var zoom = map.getView().getZoom();
            const fontSize = scope.param.text.initSize;
            // 计算新的注记缩放大小
            var dela = parseInt(zoom - minZoom -1);
            var fontTempSize =  fontSize + dela*1.25;
            // scope.param.text.font = `italic ${fontTempSize}px 宋体,sans-serif`;
            scope.param.fontSize = fontTempSize;
          }

          // 按属性分级显示要素
          if(scope.param.showField != null){
            debugger
            var pos = parseInt(zoom - minZoom);
            if(pos > scope.param.zoomArray.length-1){
              scope.param.showFieldValue = 0;
            }
            else{
              scope.param.showFieldValue = scope.param.zoomArray[pos];
            }
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
      /**
       * [跳转到颜色选择页]
       * @return {[type]}             [description]
       */
      toColorPage() {
          this.topMenu.toPage( 'color', this.param, { isColorBar: this.param.isGrade , isColroText :this.param.isText} );
      },
      /**
       * 跳转到样式选择页
       * @return {[type]} [description]
       */
      toStylePage() {
        this.topMenu.toPage( 'style', this.param );
      },

      changeToGrade () {
        this.param.isGrade = !this.param.isGrade;
      },

       /**
       * 切换至注记配置面板
       * @return {[type]} [description]
       */
      changeToText() {
        this.param.isText = !this.param.isText;
      },
      handleClose2 (event, name) {
        const index = this.count.indexOf(name);
        this.count.splice(index, 1);
      }
    },
    data () {
      return {
        gradeMethods: ['等间距分段', '等比分段'],
        // 注记字体
        textFonts : ["宋体","微软雅黑","黑体","微软正黑体","楷体","仿宋","细明体"],
        // 注记字体样式
        textStyles : [{"enType":"italic","cnType":"斜体"},{"enType":"bold","cnType":"粗体"},{"enType":"normal","cnType":"常规"},{"enType":"lighter","cnType":"细体"}],
        // 注记放置位置
        textAligns:[{"enType":"center","cnType":"居中"},{"enType":"left","cnType":"右对齐"},{"enType":"right","cnType":"左对齐"}],//{"enType":"start","cnType":"起始点"},{"enType":"end","cnType":"结束点"}
        // 是否手动调整字体大小
        manual: false,
      }
    },
    computed: {
      visible: function() {
        return this.param.visible? '隐藏' : '显示';
      }
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  /* .colorpick{
    height: 5em;
    width: 5em;
  } */
  .ivu-select-dropdown {
    position: absolute !important;
  }

  .ivu-select {
    margin-bottom: 10px;
  }

</style>
