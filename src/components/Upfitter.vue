<template lang="html">
  <canvas ref="upfitter" class="upfitter"></canvas>
</template>

<script>
// Y坐标转换需要减去的常量
const Y = 64;
// 单行图例的宽高
const WIDTH_legend = 220;
const HEIGHT_legend = 50;

export default {
  name: 'Upfitter',
  props: [ 'params', 'editable' ],
  data() {
    return {
      canvassize: null, // 画布大小（[width,height]）
      ctxt: null, // 二维绘图上下文
      legendLTWH: [], // 图例左上角点坐标和宽高[ x, y, width, height ]
      // 保存图例、比例尺、指北针以及地图标题位置宽高信息的对象
      LTWH: {
        legend: [], // 图例
        scale: [], // 比例尺
        compass: [], // 指北针
      },
      cm2px: null,
      /**
       * 参数缓存，如果一些必要的参数没有发生变化，就不更新图例
       */
      params_cache: null,
      // 指北针的图片缓存
      compassImage: null,
      active: false, // 当前canvas是否可以编辑
    }
  },
  methods: {
    /**
     * 设置画布大小
     * @return {[type]} [description]
     */
    canvasResize() {
      // 获取ol画布大小
      this.canvassize = this.__global__.olMap.getSize();
      // 设置upfitter的canvas大小，其他方式设置的会被拉伸
      this.$refs.upfitter.width = this.canvassize[ 0 ];
      this.$refs.upfitter.height = this.canvassize[ 1 ];
    },

    /**
     * 判断缓存是否可用
     * @param Object nv 参数对象
     * @param Number index 参数索引
     */
    cacheUsable( nv, index ) {
      var cache = this.params_cache[ index ];
      for( var attr in cache ) {
        if( cache.hasOwnProperty( attr ) ) {
          // 没有缓存的图片对象,需要更新;样式变化，需要更新
          if( ( attr === 'image' && !cache[ attr ] ) || ( nv.hasOwnProperty( attr ) && cache[ attr ] !== nv[ attr ] ) ) {
            return false;
          } else if( attr === 'image' ) continue;
        }
      }
      return true;
    },
    /**
     * 将符号样式与符号颜色混合得到图例的绘制样式
     * @param [number] x 图片左上角x坐标
     * @param [number] y 图片左上角y坐标
     * @param [number] w 图片宽度
     * @param [number] h 图片高度
     * @param [string] color 要混合的颜色（十六进制）
     * @return [object] imageData 图像数据
     */
    calcImage( x, y, w, h, color ) {
      // 十六进制颜色转rgb
      var sColor = color.toLowerCase();
      var colorArr = [];
      // 十六进制颜色值字符串检测
      if(sColor && /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(sColor)){
        // 简略写的情况#fff
        if(sColor.length === 4){
          var sColorNew = "#";
          for( var i = 1; i < 4; i++ ){
            sColorNew += sColor.slice( i,i + 1 ).concat( sColor.slice( i, i + 1 ) );
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        for(var i=1; i<7; i+=2){
          colorArr.push(parseInt("0x"+sColor.slice( i,i+2 ) ) );
        }
      }else{
        // rgba 颜色检测
        color.replace( /[rR][gG][bB][aA]?\([\s]*(\d{1,3}),[\s]*(\d{1,3}),[\s]*(\d{1,3}),?[\s]*(0\.\d{1,2}|1|0)?\){1}/g, function( match, $1, $2, $3, $4 ){
          colorArr = [ +$1, +$2, +$3 ];
        } )
      }

      // 获取图片的像素值
      var imageData = this.ctxt.getImageData( x, y, w, h );
      var data = imageData.data;
      var r = colorArr[0] / 255.0;
      var g = colorArr[1] / 255.0;
      var b = colorArr[2] / 255.0;

      // 逐像素处理颜色混合
      for (var i = 0, ii = data.length; i < ii; i += 4) {
        if( data[ i + 3 ] == 0 ) {
          // 完全透明的地方处理为图例背景色
          data[ i ] = 100;
          data[ i + 1 ] = 100;
          data[ i + 2 ] = 100;
          data[ i + 3 ] = 123;
        } else {
          data[ i ] *= r;
          data[ i + 1 ] *= g;
          data[ i + 2 ] *= b;
        }
      }
      return imageData;
    },

    /**
     * 更新地图指北针
     * @param  {[type]} ev  [鼠标事件]
     * @param  {[type]} dx [鼠标按下的位置x值和元素左上角点的x差值]
     * @param  {[type]} dy [鼠标按下的位置y值和元素左上角点的y差值]
     */
    updatecompass( ev, dx, dy ) {
      if( !ev ) {
        let a = this.LTWH.compass;
        // 擦除优化，如果是拖拽触发的重绘，因为之前已经清空了画布，这里就不需要擦除了
        this.active || this.ctxt.clearRect( ...a );
        // 如果指北针的图片有缓存的话
        if( this.compassImage ) {
          this.ctxt.drawImage( this.compassImage, a[0], a[1] );
        } else {
            let image = new Image();
            let scope = this;
            image.src = './static/compass.png';
            image.onload = function(){
                scope.ctxt.drawImage( this, a[0], a[1] );
                scope.compassImage = this;
                scope.__global__.compassImage = this;
            }
        }

        return
      }

      // 更新当前元素的位置
      this.updateLTWH( 'compass', ev, dx, dy );
    },

    /**
     * [updatelegend 重绘图例]
     * @param  {[type]} ev  [鼠标事件]
     * @param  {[type]} dx [鼠标按下的位置x值和元素左上角点的x差值]
     * @param  {[type]} dy [鼠标按下的位置y值和元素左上角点的y差值]
     * @return {[type]}    [description]
     */
    updatelegend( ev, dx, dy ) {
      /*
       无论是样式更新，还是拖拽，或是其他图面要素拖拽，都需要重绘
       除了缩放，缩放的时候，图例是不需要更新的，但是这里没有做判断
       */
      if( !ev ) {
        // 判断样式是否和缓存一致，如果一致就不更新图例样式
        var needUpdate = !this.params.every( this.cacheUsable );
        // 擦除优化，如果是拖拽触发的重绘，因为之前已经清空了画布，这里就不需要擦除了
        this.active || this.ctxt.clearRect( ...this.LTWH.legend );

//        this.ctxt.fillStyle = "rgba(255, 255, 255, 1)";
//        this.ctxt.fillRect ( ...this.LTWH.legend );

        let a = this.LTWH.legend;
        let ctxt = this.ctxt;
        let scope = this;

        const d = 5;

        // 逐行绘制图例，list中保存绘制的任务及参数，为了在绘制图例背景之后再逐行绘制图例
        // list的元素是promise，promise resolve之后返回的数组内容对应如下：
        // 单行图例对应的参数索引，绘制函数名，绘制参数
        let list = this.params.map( function( param, index ){
          return new Promise( ( resolve, reject ) => {
            // 如果样式需要更新
            if( needUpdate ) {
              // 如果样式是图片的话
              if( /\.png/i.test( param.stylePic ) ) {
                /*
                图例的样式包括图片样式和颜色（要混合到一起）
                参考ol.style.IconImage类的replaceColor方法
                 */
                var imgObj = new Image();
                imgObj.src = param.stylePic;

                //待图片加载完后，将其显示在canvas上
                imgObj.onload = function(){
                  let x = a[0] + d; // 图片左上角位置
                  let y = a[1] + HEIGHT_legend * index + d;
                  let s =  HEIGHT_legend - d * 2; // 边长
                  ctxt.drawImage(this, x, y, s, s);//this即是imgObj,改变图片的大小：HEIGHT_legend - d * 2 方的

                  var imageData
                  //如果面图层使用图片样式填充,则图例不需要按照颜色进行混合
                  if(param["layer"] != "PolygonLayer"){
                    imageData = scope.calcImage( x, y, s, s, param.color );
                  }else{
                    imageData = ctxt.getImageData( x, y, s, s );
                  }
                  // 保存图片对象的缓存
                  scope.params_cache[index][ 'image' ] = imageData;
                  resolve( [ index, 'putImageData', imageData, x, y ] );
                  // ctxt.putImageData( imageData, x, y );
                }
              }
              // 样式仅仅是颜色的话
              else {
                  scope.params_cache[index][ 'image' ] = param.stylePic;
                  resolve( [ index, 'fillRect', param.stylePic, a[0] + d, a[1] + HEIGHT_legend * index + d, HEIGHT_legend - d * 2, HEIGHT_legend - d * 2 ] )
                  // ctxt.fillRect( a[0] + d, a[1] + HEIGHT_legend * index + d, HEIGHT_legend - d * 2, HEIGHT_legend - d * 2 );
              }

              // 更新缓存
              for( var attr in scope.params_cache[index] ) {
                if(attr === 'image') {
                  continue;
                } else {
                  scope.params_cache[index][ attr ] = param[ attr ];
                }
              }
            } 
            //如果样式不需要更新
            else {
              // 如果样式是图片的话
              if( /\.png/i.test( param.stylePic ) ) {
                resolve( [ index, 'putImageData', scope.params_cache[index][ 'image' ], a[0] + d, a[1] + HEIGHT_legend * index + d ] )
                // ctxt.putImageData( scope.params_cache[index][ 'image' ], a[0] + d, a[1] + HEIGHT_legend * index + d );
              }
              // 样式仅仅是颜色的话
              else {
                scope.params_cache[index][ 'image' ] = param.stylePic;
                resolve( [ index, 'fillRect', param.stylePic, a[0] + d, a[1] + HEIGHT_legend * index + d, HEIGHT_legend - d * 2, HEIGHT_legend - d * 2] )
                // ctxt.fillRect( a[0] + d, a[1] + HEIGHT_legend * index + d, HEIGHT_legend - d * 2, HEIGHT_legend - d * 2 );
              }

            }

            // // 绘制文字
            // ctxt.font="bold 20px Arial";
            // ctxt.fillStyle="#058";
            // ctxt.fillText( param.name, a[0] + d * 2 + HEIGHT_legend, a[1] + HEIGHT_legend * index + d + HEIGHT_legend / 2 );
          } )

        } )

        ctxt.font="bold 23px Arial";

        // then中传入的参数是二维数组，包含了所有promise的resolve参数
        Promise.all( list ).then( ( o ) => {
          // 绘制背景
          ctxt.fillStyle = "rgba(100, 100, 100, 0.5)";
          ctxt.fillRect ( ...scope.LTWH.legend );
          o.forEach( ( value ) => {
            // 绘制图像
            if( value[ 1 ] === 'fillRect' ) {
              ctxt.fillStyle = value[ 2 ];
              ctxt[ value[1] ]( ...value.slice(3) );
            } else {
              ctxt[ value[1] ]( ...value.slice(2) );
            }

            // 绘制文字
            ctxt.fillStyle="#fffff0";
            ctxt.fillText( scope.params[ value[0] ].name, a[0] + d * 2 + HEIGHT_legend, a[1] + HEIGHT_legend * value[0] + d + HEIGHT_legend / 2 );
          } )
        } )

        return
      }

      // 更新当前元素的位置
      this.updateLTWH( 'legend', ev, dx, dy );
    },

    /**
     * 计算分母取整后的比例尺
     * @param  {[number]} scale [比例尺]
     * @return {[array]}       [分子，分母]
     */
    calcScale( scale ) {
      let s = parseInt( scale ).toString().length - 1;

      // 将分母转换为10*，20*，50*
      let m;
      let min;
      // 找到原来的分母和哪个数字最接近
      let b = [ 1, 2, 5 ];
      b.forEach( function( value ) {
        let t = Math.abs( scale - value * Math.pow( 10, s ) );
        if( !min || t < min ) {
          min = t;
          m = value * Math.pow( 10, s )
        }
      } )

      return [ m / scale, m ];
    },

    /**
     * [updatescale 重绘比例尺]
     * @param  {[type]} ev  [鼠标事件]
     * @param  {[type]} dx [鼠标按下的位置x值和元素左上角点的x差值]
     * @param  {[type]} dy [鼠标按下的位置y值和元素左上角点的y差值]
     * @return {[type]}    [description]
     */
    updatescale( ev, dx, dy ) {
      if( !ev ) {
        let a = this.LTWH.scale;
        // 擦除优化，如果是拖拽触发的重绘，因为之前已经清空了画布，这里就不需要擦除了
        this.active || this.ctxt.clearRect( ...a );

        // 获取当前的分辨率：map units per pixels，每个像素代表的实际距离（地图单位）
        // 分辨率除以常数获得比例尺
        let scale = this.__global__.olMap.getView().getResolution() / 2.3794610058302803e-9;
        // 取整后的比例尺[分子， 分母]
        let s = this.calcScale( scale );

        // 为了好看，把数值和长度都×5。 单位之前统一为厘米
        let c = 5;
        let x1 = a[0] + 3;
        let x2 = a[0] + 3 + s[0] * this.cm2px * c;
        let y1 = a[1] + a[3] * 0.75 - 7;
        let y2 = a[1] + a[3] * 0.75;

        // 更新图例区域宽度
        // 后面多加一点保证都能包含进去
        a[ 2 ] = x2 - x1 + 10;

        // this.ctxt.fillStyle = "rgba(200, 100, 0, 0.5)";
        // this.ctxt.fillRect ( ...a );

        // 绘制文字

        this.ctxt.font="bold 20px Arial";
        this.ctxt.fillStyle="#058";
        this.ctxt.fillText( s[1] * c / 100 + "m", a[0] + 8, a[1] + a[3] / 2 );

        this.ctxt.beginPath();

        this.ctxt.moveTo( x1, y1 );
        this.ctxt.lineTo( x1, y2 );
        this.ctxt.lineTo( x2, y2 );
        this.ctxt.lineTo( x2, y1 );

        // 线宽
        this.ctxt.lineWidth = 5;
        this.ctxt.strokeStyle = "black";
        this.ctxt.stroke();

        return
      }

      // 更新当前元素的位置
      this.updateLTWH( 'scale', ev, dx, dy );
    },
    /**
     * 更新位置位置和大小
     * @param string ele 要更新的图面元素名称字符串
     * @param object ev 鼠标事件
     * @param  {[type]} dx [鼠标按下的位置x值和元素左上角点的x差值]
     * @param  {[type]} dy [鼠标按下的位置y值和元素左上角点的y差值]
     */
    updateLTWH: function( ele, ev, dx, dy ) {
      let e = ev || event;
      // 鼠标在canvas坐标坐标系下的坐标
      let x = e.clientX;
      let y = e.clientY - Y;

      // 清空画布
      this.ctxt.clearRect( 0, 0, ...this.canvassize );

      // 更新比例尺位置
      this.LTWH[ ele ][0] = x - dx;
      this.LTWH[ ele ][1] = y - dy;
      // 保存当前图例的位置信息
      if(ele == 'legend'){
        this.__global__.legendArray = this.LTWH[ ele ];
      }

      for ( var variable in this.LTWH ) {
        if (this.LTWH.hasOwnProperty(variable)) {
          this[ `update${variable}` ]();
        }
      }
    },
    /**
     * 计算位置和大小的初始值
     * @return {[type]} [description]
     */
    calcLTWH: function() {

      /**
       * [计算新的位置]
       * @param  {[string]} element [当前元素的元素名]
       * @return {[type]}         [description]
       */
      return function( element ) {
        debugger;
        // 图例
        const COUNT = this.params.length;
        let a = this.LTWH[ 'legend' ];
        // x
        a[ 0 ] = this.canvassize[ 0 ] - WIDTH_legend -10;
        // y
        if(this.__global__.browserType == 'Firefox'){
          a[ 1 ] = this.canvassize[ 1 ] - HEIGHT_legend * COUNT - 15 - Y;
        }
        else if(this.__global__.browserType == 'Chrome'){
          a[ 1 ] = this.canvassize[ 1 ] - HEIGHT_legend * COUNT - 15;
        }
        else{
          a[ 1 ] = this.canvassize[ 1 ] - HEIGHT_legend * COUNT - 15;
        }
        // width
        a[ 2 ] = WIDTH_legend;
        // height
        a[ 3 ] = HEIGHT_legend * COUNT;
        // 保存图例初始位置
        this.__global__.legendArray = a;

        // 比例尺
        a = this.LTWH[ 'scale' ];
        // x
        // a[ 0 ] = this.LTWH[ 'legend' ][0] - 850 - 50;
        a[ 0 ] = this.canvassize[ 0 ]*0.2 + 30;
        // y
        if(this.__global__.browserType == 'Firefox'){
          a[ 1 ] = this.canvassize[ 1 ] - 50 - 15 - Y;
        }
        else if(this.__global__.browserType == 'Chrome'){
          a[ 1 ] = this.canvassize[ 1 ] - 50 - 15;
        }
        else{
          a[ 1 ] = this.canvassize[ 1 ] - 50 - 15;
        }
        // width
        a[ 2 ] = 300;
        // height
        a[ 3 ] = 50;

        // 指北针
        a = this.LTWH[ 'compass' ];
        // x
        a[ 0 ] = this.canvassize[ 0 ]*0.2 + 15;
        // y
        a[ 1 ] = 10;
        // width
        a[ 2 ] = 100;
        // height
        a[ 3 ] = 100;
      }
    }(),
  },
  watch: {
    params: {
      /**
       * 监听params制图参数的变化，用于实时更新图例
       * @return {[type]} [description]
       */
      handler: function( params ) {
        this.updatelegend();
      },
      deep: true,
    },
    /**
     * 图面元素是否可编辑
     * @param  {[Boolean]} nv [新值]
     * @param  {[Boolean]} ov [旧值]
     * @return {[type]}    [description]
     */
    editable: function( nv, ov ) {
      // 使用computed属性的话，切换editable后的效果没有马上出现，watch没有这个问题
      // 改变触发鼠标事件的canvas
      if( nv === 'map' ) {
        this.$refs.upfitter.style[ 'pointer-events' ] = 'auto';
        this.active = true;
      } else {
        this.$refs.upfitter.style[ 'pointer-events' ] = 'none';
        this.active = false;
      }
    },

  },
  created() {
    // 初始化参数缓存。保存和图例更新相关的信息
    this.params_cache = this.params.map( function( value, index ) {
        return {
            // 绘制图例使用的参数都是stylePic，无论颜色还是图片
            stylePic: value.stylePic,
            color: value.color,
            // 还要考虑分级设色的情况，现在还没有！！！
            image: null,
        }
    } )
  },
  mounted() {
    // 鼠标操作无视这层canvas，这样就能在下一层的ol的canvas触发鼠标事件
    this.$refs.upfitter.style[ 'pointer-events' ] = 'none';
    this.ctxt = this.$refs.upfitter.getContext( "2d" );

    // 设置大小
    if( this.__global__.olMap ) {
      this.canvasResize();
    }
    var r = () => {
      this.canvasResize();
      // 计算各个图面元素的初始位置和宽高
      this.calcLTWH();
      // 全部绘制
      for ( var variable in scope.LTWH ) {
        if (this.LTWH.hasOwnProperty(variable)) {
          this[ `update${variable}` ]();
        }
      }
    }
    // 当窗口大小改变的时候重新设置canvas的大小
    if (window.addEventListener) {
      window.addEventListener('resize', r, false);
    } else if (window.attachEvent)  {
      window.attachEvent('onresize', r);
    }

    // 计算各个图面元素的初始位置和宽高
    this.calcLTWH();

    /*
    有问题！！！！
    css绝对单位：cm/pt/in/pc/mm
    用绝对单位来设定它的宽度，然后获取其对应的px尺寸。
     */
    window.cm2px = this.cm2px = function() {
      let d = document.createElement( 'div' );
      d.style.width = "1cm";
      document.getElementsByTagName('body')[0].appendChild( d );
      let w = d.offsetWidth;
      document.getElementsByTagName('body')[0].removeChild( d );
      // 1cm = w px
      return w;
    }()

    this.__global__.cm2px = this.cm2px;

    // 初始绘制
    for (var variable in this.LTWH) {
      if (this.LTWH.hasOwnProperty(variable)) {
        this[ `update${variable}` ]();
      }
    }

    // 绑定鼠标点击事件
    this.$refs.upfitter.onmousedown = ( ev ) => {
      // 鼠标事件的y坐标需要坐标转化，减去上面一条header
      var e = ev || event;
      var x = e.clientX;
      var y = e.clientY - Y;
      // 判断是否点击在任何一个图面元素上
      for ( var variable in this.LTWH ) {
        if ( this.LTWH.hasOwnProperty(variable) ) {
          let a = this.LTWH[ variable ]
          // 判断是否点在了元素上，直接用isPointInPath？
          if( ( x >= a[0] && x <= ( a[0] + a[2] ) ) && ( y >= a[1] && y <= ( a[1] + a[3] ) ) ) {
            // 鼠标点击位置与元素左上角的差值
            let dx = x - a[0];
            let dy = y - a[1];
            this.$refs.upfitter.onmousemove = ( e ) => {
              this[ `update${variable}` ]( e, dx, dy );
            }
            // 鼠标抬起后清空事件监听
            this.$refs.upfitter.onmouseup = function() {
              this.onmousemove = null;
              this.onmouseup = null;
            }
            return;
          }
        }
      }
    }

    /**
     * 监听地图分辨率变化，处理比例尺
     * @return {[type]} [description]
     */
    let map = this.__global__.olMap;
    let scope = this;
    map.getView().on('change:resolution',function() {
      scope.updatescale();
    });
  }
}
</script>

<style lang="css">
  .upfitter {
    position: absolute;
  }
</style>
