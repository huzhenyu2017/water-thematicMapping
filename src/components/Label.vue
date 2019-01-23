<template lang="html">
  <!-- ref特性可以为子组件赋予一个 ID 引用，可以通过this.$refs.refID在JavaScript里直接访问此组件 -->
  <canvas ref="label" class="label"></canvas>
</template>

<script>
const Y = 64;

export default {
  name: 'Label',
  // *props有两种方式：
  // 1.显式声明（如下使用props[...]进行显示调用） 
  // 2.隐式声明（没有在props[]中，直接在父组件传入一个非prop特性，而这些特性会被添加到这个组件的根元素上）
  // *单向下行绑定：
  // 父级 prop 的更新会向下流动到子组件中，但是反过来则不行，因此不能直接修改props中的内容（"只读"）
  // 若想将子组件的更新反馈到父组件，则要使用$emit()方法进行父组件事件激活，同时传递数据(可以用.sync修饰符)
  props: [ 'params', 'editable', 'features', 'printSize' ],
  // 禁用特性继承：
  // 如果不希望组件的根元素继承特性，你可以设置 inheritAttrs: false
  // 这尤其适合配合实例的 $attrs 属性使用，该属性包含了父组件传递给子组件的所有特性名和特性值({"propName":"prop"})
  // 有了inheritAttrs: false 和 $attrs，你就可以手动决定这些特性会被赋予哪个元素
  data() {
    return {
      canvassize: null, // 画布大小（[width,height]）
      active: false,
      ctxt: null, // canvas的二维绘图上下文
      showList: null, // 数组，元素为布尔型，用于保存哪些要素图层需要渲染注记
      fontsize: 14, // 字体大小
      valueCache: null, //符号大小缓存
    }
  },
  watch: {
    params: {
      /**
       * 监听params制图参数的变化，用于实时更新是否显示标注
       * @return {[type]} [description]
       */
      handler: function( params ) {
        debugger;
        this.showList = params.map( function( param, i ) {
          return param.showLabels?param:param.showLabels;
        })

        this.renderLabels();
      },
      deep: true,
    },
    /**
     * 监听打印尺寸，如果不为空，按打印尺寸重设
     * @type {[type]}
     */
    printSize: function( nv ) {
      // debugger
      if( nv ) {
        this.canvasResize( nv );
        // 全部绘制
        this.renderLabels();
      }
    },
    /**
     * 标注元素是否可编辑
     * @param  {[Boolean]} nv [新值]
     * @param  {[Boolean]} ov [旧值]
     * @return {[type]}    [description]
     */
    editable: function( nv, ov ) {
      // 使用computed属性的话，切换editable后的效果没有马上出现，watch没有这个问题
      // 改变触发鼠标事件的canvas
      if( nv === 'label' ) {
        this.$refs.label.style[ 'pointer-events' ] = 'auto';
        this.active = true;
      } else {
        this.$refs.label.style[ 'pointer-events' ] = 'none';
        this.active = false;
      }
    },

  },
  methods: {
    /**
     * 设置画布大小
     * @param {Array} printSize 打印尺寸
     * @return {[type]} [description]
     */
    canvasResize( printSize ) {
      // 获取ol画布大小
      this.canvassize = printSize || this.__global__.olMap.getSize();//这里是获取到当前地图容器div的尺寸,而不是地图canvas尺寸
      // 设置upfitter的canvas大小，其他方式设置的会被拉伸
      this.$refs.label.width = this.canvassize[ 0 ];
      this.$refs.label.height = this.canvassize[ 1 ];
    },

    /**
     * 绘制注记
     * @return {[type]} [description]
     */
    renderLabels( transform ) {

      // debugger;
      var features = this.features; //包含两个点图层的数组features[0],features[1]
     
      var ctxt = this.ctxt;
      // 清空画布
      ctxt.clearRect( 0, 0, ...this.canvassize );

      // 获取地图坐标系到当前canvas坐标系的转换矩阵
      // object，其中包含了像素<-->地图坐标系的转换矩阵
      var frameState = this.__global__.olMap.frameState_;
      var labelTransform = transform || frameState.coordinateToPixelTransform;
      // frameState.coordinateToPixelTransform = coordinateToPixelTransform || frameState.coordinateToPixelTransform;
      // console.log(frameState);

      if( !frameState || !this.showList || this.showList.every(function( value ) { return !value}) || !this.features.length ) return;

      //测试字体大小随地图缩放而变化
      let zoom = this.__global__.olMap.getView().getZoom();
      const maxZoom = this.__global__.olMap.getView().getMaxZoom();
      const minZoom = this.__global__.olMap.getView().getMinZoom();
      // var fonsizeTmp = this.fontsize*(1 + 1.5*(( zoom - minZoom ) / ( maxZoom - minZoom )));
      var that = this;

      this.showList.forEach( ( value, index ) => {
        debugger;
        if( !value ) return;
        // console.log(this.features[ index ]);
        if(this.features[ index ] === undefined) return;
        
        // 遍历要素
        this.features[ index ].forEach( ( featureInfo ) => {
          //线条宽度
          ctxt.lineWidth = value.fontStrokeWidth;
          //线条颜色
          ctxt.strokeStyle = value.fontStrokeColor;
          // 线头样式
          ctxt.lineCap = "round";
          // 获取要素在地图坐标系下的坐标
          // 经纬度坐标转换为ol Canvas 像素坐标
          // !!ol.transform.apply会改写featureInfo.origin，所以传入featureInfo.origin的备份
          // 有moveTo属性说明移动过了，就用移动过的坐标
          // debugger;
          let moved = featureInfo.hasOwnProperty( 'moveTo' );
          let coordinate = moved? featureInfo.moveTo :  featureInfo.origin;
          // coordinate = ol.transform.apply( frameState.coordinateToPixelTransform, coordinate.slice() );
          coordinate = ol.transform.apply( labelTransform, coordinate.slice() );
          // 保证注记不压盖符号(向右平移)
          // coordinate[0] = coordinate[0] + 4* parseInt( zoom - minZoom +1);
          coordinate[0] = coordinate[0] + value.text.fontOffx * parseInt( zoom - minZoom +1);

          // 适配Edge浏览器注记y方向偏移的情况
          if(that.__global__.browserType == 'Edge'){
            if(transform){
              // coordinate[1] = coordinate[1];
            }else{
              coordinate[1] = coordinate[1] + 30;
            }
          }

          // 如果在canvas可视范围之外，就跳过绘制
          if( !((coordinate[ 0 ] > 0 && coordinate[ 0 ] < this.canvassize[ 0 ]) && ( coordinate[ 1 ] > 0 && coordinate[ 1 ] < this.canvassize[ 1 ] )) ) return;

          // 测试按属性绘制注记
          if(featureInfo.hasOwnProperty('value')){
            // if(typeof(value.showFieldValue) == "undefined" || !featureInfo.hasOwnProperty('value') || featureInfo.value < value.showFieldValue )  return;
            if(typeof(value.showFieldValue) == "undefined" || featureInfo.value < value.showFieldValue) return;
            // 手动设置字体大小
            if(value.textManual){
              ctxt.font=`${value.fontStyle} ${value.fontSize}px ${value.font},${value.fontFamily}`; //blod,normal,italic
              this.fontsize = value.fontSize;
              // 绘制注记字体边线
              if(value.fontStrokeWidth != 0){
                ctxt.strokeStyle = value.fontStrokeColor;
                ctxt.strokeText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
              }
              // 绘制实心注记字体
              ctxt.fillStyle= value.fontFill;
              ctxt.fillText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
            }
            // 按比例自动设置字体大小
            else{
              var dela = parseInt(zoom - minZoom -1);
              var fonsizeTmp = value.text.initSize + dela* value.text.fontDelta;
              value.fontSize = fonsizeTmp;
              this.fontsize = value.fontSize;
              ctxt.font=`${value.fontStyle} ${value.fontSize}px ${value.font},${value.fontFamily}`; //blod,normal,italic
              // ctxt.fillStyle="#003366";
              // 绘制注记字体边线
              if(value.fontStrokeWidth != 0){
                ctxt.strokeStyle = value.fontStrokeColor;
                ctxt.strokeText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
              }
              // 绘制实心注记字体
              ctxt.fillStyle= value.fontFill;
              ctxt.fillText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
            }
          }else{
            // 手动设置字体大小
            if(value.textManual){
              ctxt.font=`${value.fontStyle} ${value.fontSize}px ${value.font},${value.fontFamily}`; //blod,normal,italic
              this.fontsize = value.fontSize;
              // 绘制注记字体边线
              if(value.fontStrokeWidth != 0){
                ctxt.strokeStyle = value.fontStrokeColor;
                ctxt.strokeText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
              }
              // 绘制实心注记字体
              ctxt.fillStyle= value.fontFill;
              ctxt.fillText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
            }
            // 按比例自动设置字体大小
            else{
              var dela = parseInt(zoom - minZoom -1);
              var fonsizeTmp = value.text.initSize + dela* value.text.fontDelta;
              value.fontSize = fonsizeTmp;
              this.fontsize = value.fontSize;
              ctxt.font=`${value.fontStyle} ${value.fontSize}px ${value.font},${value.fontFamily}`; //blod,normal,italic
              // ctxt.fillStyle="#003366";
              // 绘制注记字体边线
              if(value.fontStrokeWidth != 0){
                ctxt.strokeStyle = value.fontStrokeColor;
                ctxt.strokeText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
              }
              // 绘制实心注记字体
              ctxt.fillStyle= value.fontFill;
              ctxt.fillText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
            }
          }
          

          // 绘制标注
          if( moved ) {
            // 拖拽标注的线条
            // ctxt.beginPath();
            // ctxt.moveTo( ...ol.transform.apply( frameState.coordinateToPixelTransform, featureInfo.origin.slice() ) );
            // ctxt.lineTo( ...coordinate );
            // ctxt.stroke();
          }

          // // 手动设置字体大小
          // if(value.textManual){
          //   ctxt.font=`${value.fontStyle} ${value.fontSize}px ${value.font},${value.fontFamily}`; //blod,normal,italic
          //   this.fontsize = value.fontSize;
          //   // 绘制注记字体边线
          //   if(value.fontStrokeWidth != 0){
          //     ctxt.strokeStyle = value.fontStrokeColor;
          //     ctxt.strokeText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
          //   }
          //   // 绘制实心注记字体
          //   ctxt.fillStyle= value.fontFill;
          //   ctxt.fillText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
          // }
          // // 按比例自动设置字体大小
          // else{
          //   var dela = parseInt(zoom - minZoom -1);
          //   var fonsizeTmp = value.text.initSize + dela* value.text.fontDelta;
          //   value.fontSize = fonsizeTmp;
          //   this.fontsize = value.fontSize;
          //   ctxt.font=`${value.fontStyle} ${value.fontSize}px ${value.font},${value.fontFamily}`; //blod,normal,italic
          //   // ctxt.fillStyle="#003366";
          //   // 绘制注记字体边线
          //   if(value.fontStrokeWidth != 0){
          //     ctxt.strokeStyle = value.fontStrokeColor;
          //     ctxt.strokeText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
          //   }
          //   // 绘制实心注记字体
          //   ctxt.fillStyle= value.fontFill;
          //   ctxt.fillText( featureInfo.name, ...coordinate );// "..."展开运算符,用于array和object上把内容展开
          // }
          
        } )

      } )

      // fonsizeTmp = 0;

    },
  },
  mounted() {
    var map = this.__global__.olMap;

    // 鼠标操作无视这层canvas，这样就能在下一层的ol的canvas触发鼠标事件
    this.$refs.label.style[ 'pointer-events' ] = 'none';
    this.ctxt = this.$refs.label.getContext( "2d" );
    // this.$emit( 'pass-context', this.ctxt );
    this.$emit( 'pass-context', this.$refs.label );

    // 设置当前canvas大小
    if( this.__global__.olMap ) {
      this.canvasResize();
    }
    // 当窗口大小改变的时候重新设置canvas的大小
    //
    if (window.addEventListener) {
      window.addEventListener('resize', () => {
        this.canvasResize();
        // 全部绘制
        this.renderLabels();
      }, false);
    } else if (window.attachEvent)  {
      window.attachEvent('onresize', () => {
        this.canvasResize();
        // 全部绘制
        this.renderLabels();
      });
    }

    // 直接在mounted中调用，frameState_还没有初始化，在队列中中调用没问题
    setTimeout( () => {
      // 初始绘制
      // 先进行了初始化mouted(), 后进行passfeatures,因此这里没有获得features数据,画不出注记
      // debugger;
      // this.renderLabels();//初始化mouted()时没有获得features数据,因此初始画不出注记
      // 当地图发生变化的时候（拖拽缩放），重绘注记
      // 弃用change事件。change事件只在拖拽结束或缩放结束的时候触发
      // map.getView().on( 'change', () => {
      //   this.renderLabels();
      // } )
      map.on( 'pointerdrag', () => {
        this.renderLabels();
      } )
      map.getView().on('change:resolution',() => {
        this.renderLabels();
      });

      // function initRenderLabel () {
      //   debugger;
      //   // var that = this;
      //   if () {
      //     setTimeout(initRenderLabel, 100);
      //   } else {
      //     this.renderLabels();
      //   }
      // }
      // initRenderLabel();
      // setTimeout( () =>{
      //   this.$forceUpdate();//强制刷新
      //   // debugger;
      //   // this.renderLabels();
      //   // this.__global__.olMap.getView().setZoom(8);
      // },10000)
      // map.getView().setZoom(8);

    }, 0)

    // 绑定鼠标点击事件
    this.$refs.label.onmousedown = ( ev ) => {
      // 鼠标事件的y坐标需要坐标转化，减去上面一条header
      var e = ev || event;
      var x = e.clientX;
      var y = e.clientY - Y;


      // 获取地图坐标系到当前canvas坐标系的转换矩阵
      // object，其中包含了像素<-->地图坐标系的转换矩阵
      var frameState = this.__global__.olMap.frameState_;
      // 判断是否点击在任何一个注记上
      this.features.forEach( ( features, index ) => {
        if( !this.params[ index ].showLabels ) return;
        features.forEach( ( featureInfo, index ) => {
          let coordinate = featureInfo.hasOwnProperty( 'moveTo' )? featureInfo.moveTo :  featureInfo.origin

          coordinate = ol.transform.apply( frameState.coordinateToPixelTransform, coordinate.slice() );
           // 适配Edge浏览器注记y方向偏移的情况
          if(this.__global__.browserType == 'Edge'){
            coordinate[1] = coordinate[1] + 32;
          }
          // 如果在canvas可视范围之外，就跳过
          if( !((coordinate[ 0 ] > 0 && coordinate[ 0 ] < this.canvassize[ 0 ]) && ( coordinate[ 1 ] > 0 && coordinate[ 1 ] < this.canvassize[ 1 ] )) ) return;
          debugger;
          // var xX = coordinate[ 0 ] + this.ctxt.measureText(featureInfo.name).width;
          // var yX = coordinate[ 1 ] - this.params[ index ].fontSize;
          if( ( x > coordinate[ 0 ] && x < coordinate[ 0 ] + this.ctxt.measureText(featureInfo.name).width ) && ( y < coordinate[ 1 ] && y > coordinate[ 1 ] - this.fontsize ) ) {
            debugger;
            // 鼠标点击位置与注记左下角的差值
            let dx = x - coordinate[0];
            let dy = y - coordinate[1];

            this.$refs.label.onmousemove = ( ev ) => {
              var e = ev || event;
              // 计算注记新的左下角点的canvas坐标
              var x = e.clientX - dx;
              var y = e.clientY - Y - dy;
              // 保存新的经纬度坐标
              featureInfo.moveTo = ol.transform.apply( frameState.pixelToCoordinateTransform, [ x, y ] );
              this.renderLabels();
            }
            // 鼠标抬起后清空事件监听
            this.$refs.label.onmouseup = function() {
              this.onmousemove = null;
              this.onmouseup = null;
            }
            return;
          }

        } )
      } )
    }
  }
}
</script>

<style lang="css">
  .label {
    position: absolute;
  }
</style>
