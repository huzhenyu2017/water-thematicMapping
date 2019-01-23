<template>

  <!-- 颜色色盘 -->
  <div class="box open">
    <div class="hd">
      <div class="colorView" v-bind:style="`background-color: ${displayColor}`"></div>
    </div>
    <div class="bd">
      <h3>主题颜色</h3>
      <ul :class="{ 'banned': isColorBar, 'tColor': true }">
        <li
          v-for="color of tColor"
          v-bind:style="{ backgroundColor: color }"
          v-on:mouseover="hoveColor = color"
          v-on:mouseout="hoveColor = null"
          v-on:click="updataValue(color)"
        ></li>
      </ul>
      <ul class="bColor">
        <li v-for="item of colorPanel">
          <ul :class="{ 'colorbar': isColorBar }">
            <li
              v-for="color of item"
              v-bind:style="{ backgroundColor: color }"
              v-on:mouseover="hoveColor = color"
              v-on:mouseout="hoveColor = null"
              v-on:click="updataValue(color)"
            ></li>
          </ul>
        </li>
      </ul>
      <h3>标准颜色</h3>
      <ul :class="{ 'banned': isColorBar, 'tColor': true }">
        <li
          v-for="color of bColor"
          v-bind:style="{ backgroundColor: color }"
          v-on:mouseover="hoveColor = color"
          v-on:mouseout="hoveColor = null"
          v-on:click="updataValue(color)"
        ></li>
      </ul>
    </div>
    <Button type="success" long @click.prevent='backToLayers' style="margin-top:66px">确认</Button>
  </div>
</template>

<script>

  export default {
    name: 'ColorPick',
    props: ['param', 'topMenu', 'options'],
    data () {
      return {
        // 鼠标经过的颜色块
        hoveColor: null,
        // 主题颜色
        tColor: ['#000', '#fff', '#eeece1', '#1e497b', '#4e81bb', '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'],
        // 颜色面板
        colorConfig: [
          ['#7f7f7f', '#f2f2f2'],
          ['#0d0d0d', '#808080'],
          ['#1c1a10', '#B6B29F'],
          ['#0e243d', '#A1B4CC'],
          ['#233f5e', '#B5C3D2'],
          ['#632623', '#D5B6B6'],
          ['#4d602c', '#CAD4BA'],
          ['#3f3150', '#C4BDCC'],
          ['#1e5867', '#B3D0D7'],
          ['#99490f', '#E9C9B1'],

        ],
        // 标准颜色
        bColor: ['#8b0000','#c21401', '#ff1e02', '#FF8C00','#ffc12a','#ffff3a','#ADFF2F','#90cf5b', '#00af57','#008000','#006400','#87CEEB','#00afee', '#0071be', '#000080','#00215f', '#72349d','#C71585','#ff69b4','#FFC0CB'],
      }
    },
    computed: {
      // 颜色面板
      colorPanel () {
        let colorArr = []
        for (let color of this.colorConfig) {
          colorArr.push(this.gradient(color[1], color[0], 5))
        }
        return colorArr
      },
      // 是否是选择色系
      isColorBar () {
        if( !this.options ) return false;
        return this.options.hasOwnProperty('isColorBar') && this.options.isColorBar;
      },
      // 是否是注记颜色
      isColroText(){
        if( !this.options ) return false;
        return this.options.hasOwnProperty('isColroText') && this.options.isColroText;
      },

      /**
       * 目前选中的颜色值，有一些情况不是展示param.color属性:
       * 点符号聚类，展示的应该是param.clusterColor属性
       * @return {[type]} [description]
       */
      displayColor() {
        return this.param.clusterColor || this.param.color;
      }

    },
    methods: {
      /**
       * 点击确认，返回到图层页
       * @return {[type]} [description]
       */
      backToLayers() {
        this.topMenu.toPage( 'layers', this.param );
      },
      /**
       * 更新颜色值
       * @param  {[type]}  value      [description]
       * @return {[type]}             [description]
       */
      updataValue (value) {
        var options = this.options;
        // 如果是选择色系的话
        if( options && options.isColorBar ) {
          let key = 9;
          // 找到点选颜色对应的色系的索引，保存到key中
          this.colorPanel.find( function( colorArr, index ) {
            if( colorArr.find( function( color ) {  return color === value } ) ) {
              key = index;
              return true
            } else {
              return false
            }
          } )
          // 更新色系的其实颜色和终止颜色
          this.param.startColor = this.colorConfig[ key ][ 1 ];
          this.param.stopColor = this.colorConfig[ key ][ 0 ];
          return;
        }; 

        // 如果是注记颜色选择
        if( options && options.isColroText ) {
          this.param.fontFill = value;
          return;
        }; 

        // 除了上面选色系这种情况，对于带options的，统一都执行update函数
        if( options && ( typeof options.update === 'function' ) ) {
          options.update( value );
          return
        }
        this.param.color = value;
        (this.param.layer === 'PolygonLayer') && (this.param.stylePic = value);
      },
      // 格式化 hex 颜色值
       parseColor (hexStr) {
         if (hexStr.length === 4) {
           hexStr = '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3]
         } else {
           return hexStr
         }
       },
       // RGB 颜色 转 HEX 颜色
       rgbToHex (r, g, b) {
         let hex = ((r << 16) | (g << 8) | b).toString(16)
         return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
       },
       // HEX 转 RGB 颜色
       hexToRgb (hex) {
         hex = this.parseColor(hex)
         let rgb = []
         for (let i = 1; i < 7; i += 2) {
           rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
         }
         return rgb
       },
      // 计算渐变过渡颜色
       gradient (startColor, endColor, step) {
         // 讲 hex 转换为 rgb
         let sColor = this.hexToRgb(startColor)
         let eColor = this.hexToRgb(endColor)
         // 计算R\G\B每一步的差值
         let rStep = (eColor[0] - sColor[0]) / step
         let gStep = (eColor[1] - sColor[1]) / step
         let bStep = (eColor[2] - sColor[2]) / step
         let gradientColorArr = []
         // 计算每一步的hex值
         for (let i = 0; i < step; i++) {
           gradientColorArr.push(this.rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])))
         }
         return gradientColorArr
       },
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  ul,li,ol{ list-style: none; margin: 0; padding: 0; }
  input{ display: none; }
  .colorBtn{ width: 25px; height: 25px; }
  .colorBtn.disabled{ cursor: no-drop; }
  .box{
     width: 100%; background: #fff; margin-top: 2px; padding: 10px; padding-bottom: 5px;  opacity: 0; transition: all .3s ease;
  }
  .box h3{ margin: 0; font-size: 14px; font-weight: normal; margin-top: 10px; margin-bottom: 5px; line-height: 1; }
  .box.open{ visibility: visible; opacity: 1; text-align: center;}
  .colorView{ height: 30px; transition: background-color .3s ease; margin: 0 auto;}
  .hd .defaultColor{ width: 80px; float: right; text-align: center; border: 1px solid #ddd; cursor: pointer; }
  .tColor li{ display: inline-block; margin: 0 2px; transition: all .3s ease; }
  .tColor li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
  .bColor li{
      display: inline-block; margin: 0 2px;
    }
  .bColor li li{ display: block; transition: all .3s ease; margin: 0; }
  .bColor li li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }

  @media screen and (min-width: 2001px) {
    .tColor li{ width: 25px; height: 25px;}
    .bColor li{
        width: 25px;
      }
    .bColor li li{ width: 25px; height: 25px;}
  }
  @media screen and (max-width: 2000px) {
    .tColor li{ width: 25px; height: 25px;}
    .bColor li{
        width: 25px;
      }
    .bColor li li{ width: 25px; height: 25px;}
  }

  @media screen and (max-width: 1601px) {
    .tColor li{ width: 20px; height: 20px;}
    .bColor li{
        width: 20px;
      }
    .bColor li li{ width: 20px; height: 20px;}
  }

  @media screen and (max-width: 1367px) {
    .tColor li{ width: 17px; height: 17px;}
    .bColor li{
        width: 17px;
      }
    .bColor li li{ width: 17px; height: 17px;}
  }

</style>
<style>
  .colorbar:hover > li {
    box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3);
  }
  .banned {
    cursor: not-allowed;
  }
</style>
