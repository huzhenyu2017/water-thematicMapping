<template>
  <div class="box open">
    <div style="margin-bottom:-48px;overflow-y: auto;max-height:100%;padding-bottom:58px;padding-top:10px">
      <template v-if="param.isChart">
        <template v-for="item in icons">
          <div class="stylechunk" >
            <div class="styleimg" :style="{ background: `url(./static/${param.layer}/charticon/${item}.png) no-repeat center center`, 'background-size': 'cover'}" @click.prevent="setStyle" :title="item"></div>
            <span class="style-name">{{item}}</span>
          </div>
        </template>
      </template>
      <template v-else>
        <template v-for="item in items">
          <div class="stylechunk" >
            <div class="styleimg" :style="{ background: `url(./static/${param.layer}/${type}/${item}.png) no-repeat center center`, 'background-size': 'cover'}" @click.prevent="setStyle" :title="item"></div>
            <span class="style-name">{{item}}</span>
          </div>
        </template>
      </template>
    </div>
    <Button type="success" long @click.prevent='backToLayers' style="margin-top:20px">确认</Button>
  </div>
</template>

<script>


  const PointLayer = {
    template1: [
      '成灾水位点',
      '地表水水源地',
      '河湖取水口',
      '积水点',
      '生活－水',
      '生活用水',
      '水1',
      '水',
      '水井',
      '用水户',
    ],
    template2: [
      '储水箱',
      '地下水站',
      '分水闸',
      '公共供水企业',
      '河道水位站',
      '洪水预警',
      '简易水位站',
      '量水站',
      '农村供水工程',
      '取用水测站',
      '水泵',
      '水电',
      '水电站',
      '水管装置',
      '水库点',
      '水利行业单位',
      '水利行政机关',
      '水利企业',
      '水利事业单位',
      '水位站',
      '水文站',
      '水闸',
      '水质监测站',
      '污水处理厂',
      '乡镇水利管理单位',
      '消防水泵',
      '消防水箱-水池',
      '用水公司',
      '中水厂',
      '自来水厂',
      '成灾水位点',
      '地表水水源地',
      '河湖取水口',
      '积水点',
      '生活－水',
      '生活用水',
      '水',
      '水井',
      '用水户',
    ],
    template3: [
      '分水闸',
      '河道水位站',
      '洪水预警',
      '简易水位站',
      '量水站',
      '水泵',
      '水电站',
      '水管装置',
      '水库点',
      '水位站1',
      '水位站',
      '水闸',
      '消防水泵',
      '消防水箱-水池',
      '用水公司',
    ],
  }

  const PolygonLayer = {
    template1: [
      '1',
      '2',
      '3',
      '4',
      '5',

    ],
    template2: [
      '1',
      '2',
      '3',
      '4',
      '5',

    ],
    template3: [
      '1',
      '2',
      '3',
      '4',
      '5',

    ],
  }

  const LineLayer = {
    template1: [
      "实线",
      "虚线",
      "圆点"
    ],
    template2: [
      "实线",
      "虚线",
      "圆点"
    ],
    template3: [
      "实线",
      "虚线",
      "圆点"
    ],
  }

  const Layer = {
    PointLayer,
    PolygonLayer,
    LineLayer,
  }

  const ICONS = [
    '010101',
    '010102',
    '010103',
    '010104',
    '010105',
    '010106',
    '010107',
    '010109',
    '010110',
    '010111',
    '010201',
    '010202',
    '010203',
    '010204',
    '020101',
    '020102',
    '020201',
    '020202',
    '020203',
  ]

  export default {
    name: 'StylePick',
    props: ['param', 'topMenu', 'options'],
    data() {
      return {
        icons: ICONS,
      }
    },
    computed: {
      /*
      提供给当前图层的符号样式
       */
      items: function() {
        // 【当前图层的图层类型】【当前的制图模板】
        return Layer[ this.param.layer ][ this.__global__.type ];
      },
      type: function() {
        return this.__global__.type;
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
       * 将选中的符号样式应用到图层参数上
       * @param {[type]} e [description]
       */
      setStyle: function() {

        // 获取canvas二维绘图上下文
        var cnv = document.createElement('canvas');
        var ctx = cnv.getContext('2d');
        var pattern, img;

        /**
         * 异步获取图片
         * @param  {[type]} src [description]
         * @return {[type]}     [description]
         */
        function getImage( src ) {
          return new Promise( ( resolve, reject ) => {
            var img = new Image();
            img.src = src;
            img.onload = function () {
              resolve( this );
            }
          } )
        }

        return async function( e ) {
          e = e || event;
          var reg = /(\.\/static).*(\.png)/;
          var src = e.target.style.background.match( reg );
          // 设置图例图片样式
          this.param.stylePic = src[0];
          // 面状要素设置纹理
          if( this.param.layer === 'PolygonLayer' ) {

            // // 仅使用颜色填充
            // if( this.param.colorOnly ) {
            //
            // } else { // 同时使用颜色和纹理
            //   img = await getImage( src[0] );
            //   pattern = ctx.createPattern(img, 'repeat');
            //   this.param.color = pattern;
            // }

            img = await getImage( src[0] );
            pattern = ctx.createPattern(img, 'repeat');
            this.param.color = pattern;

          }
          else if( this.param.layer === "LineLayer" ) {
            var s = src[0].match(/(.(?!\/))+(?=\.png)/g)[0].slice( 1 );
            switch ( s ) {
              case "实线":
                this.param.lineDash = undefined;
                this.param.custom = null;
                break;
              case "虚线":
                this.param.lineDash = [50,25]; // 交替绘制线段和间距
                this.param.custom = null;
                break;
              case "圆点":
                this.param.custom = "dot";
                break;
              default:

            }

          }
          else {
            if( this.options && this.options.isChart ) {
              this.options.update( src[0].match(/([0-9]*)(?=\.png)/)[0] );
            } else {
              this.param.src = src[0];
            }
          }

        }
      }()
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box{
   width: 100%; background: #fff; padding: 0px 10px 10px; padding-bottom: 5px;  opacity: 0; transition: all .3s ease;
}
.box.open{ visibility: visible; opacity: 1; text-align: center; height: 100%}

.stylechunk{
  display: inline-block;
  box-sizing: border-box;
  background: #409fe0;
  margin: 3px;
  transition: all .3s ease;
  border-radius: 4px;
  padding: 2px;
}
.style-name {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  display: inline-block;
}
.styleimg {
  width: 56px;
  height: 56px;
}
.stylechunk:hover{
  transform: scale(1.3);
  box-shadow: 0 0 5px rgba(0,0,0,.4);
}
@media screen and (min-width: 2001px) {
  .styleimg {
    width: 56px;
    height: 56px;
  }

  .stylechunk{
    width: 60px;
    height: 60px;
  }

  .style-name {
    width: 55px;
  }
}
@media screen and (max-width: 2000px) {
  .styleimg {
    width: 56px;
    height: 56px;
  }

  .stylechunk{
    width: 60px;
    height: 60px;
  }

  .style-name {
    width: 55px;
  }
}

@media screen and (max-width: 1601px) {
  .styleimg {
    width: 40px;
    height: 40px;
  }

  .stylechunk{
    width: 44px;
    height: 44px;
  }

  .style-name {
    width: 44px;
  }
}

@media screen and (max-width: 1367px) {
  .styleimg {
    width: 26px;
    height: 26px;
  }

  .stylechunk{
    width: 30px;
    height: 30px;
  }

  .style-name {
    width: 30px;
  }
}
</style>
