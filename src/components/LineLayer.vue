<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>

  const extent =  [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634];
  const esrijsonFormat = new ol.format.EsriJSON();

  var getNextBreak = function() {
    /**
     * 计算两点间间距
     * @param  {Array} p1 第一个点
     * @param  {Array} p2 第二个点
     * @return {number}    两点间间距
     */
    function distanceBetween( p1, p2 ) {
      return Math.sqrt(Math.pow(Math.abs( p1[0] - p2[0] ), 2) + Math.pow(Math.abs( p1[1] - p2[1] ), 2));
    }
    /**
     * 计算在线段p1p2上距离p1距离为delta的点
     * @param  {[type]} p1    [description]
     * @param  {[type]} p2    [description]
     * @param  {[type]} delta [description]
     * @return {[type]}       [description]
     */
    function c( p1, p2, delta ) {
      var d = distanceBetween( p1, p2 );
      var ratio = delta / d;
      var dx = p2[0] - p1[0];
      var dy = p2[1] - p1[1];
      if( isNaN( dx ) || isNaN( dy ) || isNaN( ratio ) || isNaN( d ) ) {
        debugger
      }
      return [ p1[0] + dx * ratio, p1[1] + dy * ratio ];
    }

    /**
     * 计算下一个断点
     * @param  {Array} first 代表上一个断点的数组
     * @param  {number} delta 断点之间的间距
     * @param  {Array} polyLine 代表多段线的数组（剩余的多段线，已经分割好的就不传进来了）
     * @return {Array|Boolean}       下一个断点，如果已经没办法再分一次的话，返回 false
     */
    return function ( first, delta, polyLine ) {

      // 如果下一个断点在polyLine[0]和first之间
      var distance = distanceBetween( first, polyLine[ 0 ] );
      if( distance > delta ) {
        return c( first, polyLine[0], delta );
      }

      // 保存到first的长度刚刚大于delta的点的索引
      var index = 0;
      var distanceOld = 0;

      while ( distance < delta ) {
        // 如果已经到最后了，还不够分一次的话，返回 false
        if( !polyLine[ index + 1 ] ) return false;
        distanceOld = distance;
        distance += distanceBetween( polyLine[ index ], polyLine[ ++index ] )
      }

      var p1 = polyLine[ index -1 ];
      var p2 = polyLine[ index ];
      var d = delta - distanceOld;

      // 去掉已经分段好的部分
      polyLine.splice( 0, index );

      return c( p1, p2, d );

    }
  }()

  export default {
    name: 'linelayer',
    props: ['param', 'index'],
    data() {
      return {
        _olLayer: null, // 用来在内部保存layer的引用
      }
    },
    created() {
      /**
       * 矢量图层
       */
      var param = this.param;
      var scope = this;

      var vectorSource = new ol.source.Vector({
        loader: function(extent, resolution, projection) {
          var url = param.url;
          $.ajax({url: url, dataType: 'jsonp', success: function(response) {
            if (response.error) {
              alert(response.error.message + '\n' +
                  response.error.details.join('\n'));
            } else {
              // dataProjection will be read from document
              var features = esrijsonFormat.readFeatures(response, {
                featureProjection: projection
              });
              if (features.length > 0) {
                vectorSource.addFeatures(features);
                scope.$emit( 'feaure-loaded', scope.index, features,param.textField );
              }

              // 通知顶层数据已经添加到地图上了
              param.container.doneRequestParams++;
            }
          }});
        },
      });

      var textStyle =  {
        // font: this.param.text.font,
        font: `${this.param.fontStyle} ${this.param.fontSize}px ${this.param.font},${this.param.fontFamily}`,
        fill: new ol.style.Fill({
          color: this.param.fontFill,
        }),
        stroke: new ol.style.Stroke({
          color: this.param.fontStrokeColor,
          width: this.param.fontStrokeWidth
        }),
        // 测试背景填充
        // backgroundFill:new ol.style.Fill({
        //   // color:'#003366'
        // }),
        offsetX:this.param.text.offsetX,
        offsetY:this.param.text.offsetY,
        textAlign:this.param.text.textAlign,
        scale: this.param.text.scale,//注记展示大小比例
        placement:this.param.text.placement,
        overflow: this.param.text.overflow,//是否全部展示注记
      };

      const style = new ol.style.Style({
        stroke: new ol.style.Stroke(
          this.param
        ),
        text: new ol.style.Text(
          textStyle
        )
      });

      this._olLayer = new ol.layer.Vector({
        source: vectorSource,
        style: function(feature) {
          if(feature.get(param.textField) != " "){
            style.getText().setText(feature.get(param.textField));
          }
          else{
            style.getText().setText('');
          }
          return style;
        }
      });

    //  // 初始的样式
    //  var initialStyle = new ol.style.Style({
    //    // fill: new ol.style.Fill({
    //    //   color: 'rgba(225, 225, 225, 255)'
    //    // }),
    //    stroke: new ol.style.Stroke( this.param )
    //  });

    //  this._olLayer = new ol.layer.Vector({
    //    source: vectorSource,
    //    style: initialStyle
    //  });

      // 图层对象都要定义一个update函数，用于实时更新制图参数
      this._olLayer.update = function() {
        /**
         * 计算中垂线
         * @return {[type]} [description]
         */
        function calMiddlePoints(point1,point2){
          //k斜率
          var k = (point2[1] - point1[1]) / (point2[0] - point1[0]);
          //middle point for inpoint1 and inpoint2
          var middlePoint = new Array();
          middlePoint[0] = (point1[0] + point2[0]) / 2;
          middlePoint[1] = (point1[1] + point2[1]) / 2;
          var k01=-1/k;
          var b01 = middlePoint[1] -k01 * middlePoint[0];
          //caculate another point of middle line

          var b1 =2*(-middlePoint[0] + k01 * b01- k01 * middlePoint[1]);
          var a1 = 1 + k01 * k01;
          // 其中最后的一个数值5000代表的是中点到另一个点的距离，可以依据自己的需求来设置，我直接写成了5000m(如果为经纬度则使用弧度为单位)
          var c1 = middlePoint[0] * middlePoint[0] + b01 * b01 - 2 * b01 * middlePoint[1] + middlePoint[1] * middlePoint[1] - 0.001 * 0.001;
          // 固定距离-中垂线的两个端点，
          var p1 = new Array();
          var p2 = new Array();

          //如果无解则退出
          var delta=b1 * b1 - 4 * a1 * c1;
          if (delta < 0)
          {
              p1 = null;
              p2 = null;
              return;
          }
          p1[0] = (-b1 + Math.sqrt(delta )) / (2 * a1);
          p1[1] = k01 * p1[0] + b01;

          p2[0] = (-b1 - Math.sqrt(delta)) / (2 * a1);
          p2[1] = k01 * p2[0] + b01;
          
          return [p1,p2];
        }

        /**
         * 根据制图参数生成样式
         * @return {[type]} [description]
         */
        function styleGenerator() {
          debugger;
          // 如果是自定义样式
          if( param.custom ) {
            switch (param.custom) {
              case 'dot':
                let styles_dot = [
                  new ol.style.Style({
                     stroke: new ol.style.Stroke(param),
                     text: new ol.style.Text( textStyle ),
                   }),
                  new ol.style.Style({
                     image: new ol.style.Circle({
                       radius: param.width * 1.125,
                       // radius: param.width * 2,
                       fill: new ol.style.Fill({
                         color: param.color
                       })
                     }),
                     geometry: function(feature) {
                       // 每次重绘都会调用（拖拽、缩放都包括）
                       var map = scope.__global__.olMap || null;
                       var maxZoom = map && map.getView().getMaxZoom();
                       var minZoom =  map && map.getView().getMinZoom();
                       var coordinates = feature.getGeometry().getCoordinates();
                       var a = [], p, first;
                       // 样式间隔
                      //  debugger
                       var delta = param.interval;
                       // var delta = 0.00009725575650549532 * Math.pow( ( 24 - map.getView().getZoom() ), 2 );
                       // 有可能是multiLineString
                       if( typeof coordinates[0][0] == 'object' ) {
                         coordinates.forEach( function( value ) {
                           // 如果是multiLineString的话，那么子元素都还是数组，孙子元素也是数组但是代表的是一个坐标
                           // value代表一条线。包含线上所有的拐点和端点
                           first = value[ 0 ];
                           while( p = getNextBreak( first, delta, value ) ) {
                             a.push( p );
                             first = p;
                           }
                           // 获取当前的缩放等级
                           // var zoom = map.getView().getZoom();
                         } )
                       } else {
                         first = coordinates[ 0 ];
                         while( p = getNextBreak( first, delta, coordinates ) ) {
                           a.push( p );
                           first = p;
                         }
                       }
                       return new ol.geom.MultiPoint(a);
                     }
                   }),
                ];
                // 注记配置面板参数变化随之更新
                styles_dot[0].getText().setFont(`${param.fontStyle} ${param.fontSize}px ${param.font},${param.fontFamily}`);//更新字体字号
                if(param.isText){
                  styles_dot[0].getText().getFill().setColor(param.fontFill);//更新字体颜色
                  if(param.fontStrokeWidth==0){
                    styles_dot[0].getText().getStroke().setWidth(param.fontStrokeWidth);//更新字体边线
                  }
                  else{
                    styles_dot[0].getText().getStroke().setWidth(param.fontStrokeWidth);//更新字体边线
                  }
                  styles_dot[0].getText().setOffsetX(param.offsetX);//更新x方向偏移
                  styles_dot[0].getText().setOffsetY(param.offsetY);//更新y方向偏移
                  styles_dot[0].getText().setTextBaseline(param.textBaseline);//更新注记放置位置
                  // styles_dot[0].getText().setMaxAngle(param.maxAngle);//更新注记间隔
                }
                return  function(feature) {
                  //用于判断,如果要素满足某些条件,才显示注记
                  if(feature.get(param.textField) != " "){  
                    styles_dot[0].getText().setText(feature.get(param.textField));
                  }
                  else{
                    styles_dot[0].getText().setText('');
                  }
                  // styles_dot[0].getText().setText(feature.get(param.textField));
                  return styles_dot;
                }
                break;
              case 'cross':
                let styles_cross = [
                  new ol.style.Style({
                    stroke: new ol.style.Stroke(param),
                    text: new ol.style.Text( textStyle ),
                  }),
                  new ol.style.Style({
                    stroke: new ol.style.Stroke(param),
                    geometry: function(feature) {
                      // 每次重绘都会调用（拖拽、缩放都包括）
                      var map = scope.__global__.olMap || null;
                      var maxZoom = map && map.getView().getMaxZoom();
                      var minZoom =  map && map.getView().getMinZoom();
                      var coordinates = feature.getGeometry().getCoordinates();
                      var a = [], p, first;
                      // 样式间隔
                      var delta = param.interval;
                      // var delta = 0.00009725575650549532 * Math.pow( ( 24 - map.getView().getZoom() ), 2 );
                      // 有可能是multiLineString
                      if( typeof coordinates[0][0] == 'object' ) {
                        coordinates.forEach( function( value ) {
                          // 如果是multiLineString的话，那么子元素都还是数组，孙子元素也是数组但是代表的是一个坐标
                          // value代表一条线。包含线上所有的拐点和端点
                          first = value[ 0 ];
                          while( p = getNextBreak( first, delta, value ) ) {
                            a.push( p );
                            first = p;
                          }
                          // 获取当前的缩放等级
                          // var zoom = map.getView().getZoom();
                        } )
                      } else {
                        first = coordinates[ 0 ];
                        while( p = getNextBreak( first, delta, coordinates ) ) {
                          a.push( p );
                          first = p;
                        }
                      }

                      // 求出每两点之间的中垂线
                      debugger
                      var b = [];//MultiLineString
                      for(var i=0;i<a.length-1;i++){
                        var middlePts = calMiddlePoints(a[i],a[i+1]);//中垂线的两端点-LineString
                        // console.log(middlePts);
                        b.push(middlePts);
                      }
                      return new ol.geom.MultiLineString(b);
                    }
                  }),
                ];
                // 注记配置面板参数变化随之更新
                styles_cross[0].getText().setFont(`${param.fontStyle} ${param.fontSize}px ${param.font},${param.fontFamily}`);//更新字体字号
                if(param.isText){
                  styles_cross[0].getText().getFill().setColor(param.fontFill);//更新字体颜色
                  if(param.fontStrokeWidth==0){
                    styles_cross[0].getText().getStroke().setWidth(param.fontStrokeWidth);//更新字体边线
                  }
                  else{
                    styles_cross[0].getText().getStroke().setWidth(param.fontStrokeWidth);//更新字体边线
                  }
                  styles_cross[0].getText().setOffsetX(param.offsetX);//更新x方向偏移
                  styles_cross[0].getText().setOffsetY(param.offsetY);//更新y方向偏移
                  styles_cross[0].getText().setTextBaseline(param.textBaseline);//更新注记放置位置
                  // styles_cross[0].getText().setMaxAngle(param.maxAngle);//更新注记间隔
                }
                return function(feature) {
                  if(feature.get(param.textField) != " "){  
                    styles_cross[0].getText().setText(feature.get(param.textField));
                  }
                  else{
                    styles_cross[0].getText().setText('');
                  }
                  return styles_cross;
                }
                break;
              default:
            }
          } else {
            // return new ol.style.Style({
            //   stroke: new ol.style.Stroke( param )
            // })
            //测试使用
            style.setStroke(new ol.style.Stroke(param));
            // 注记配置面板参数变化随之更新
            style.getText().setFont(`${param.fontStyle} ${param.fontSize}px ${param.font},${param.fontFamily}`);//更新字体字号
            if(param.isText){
              style.getText().getFill().setColor(param.fontFill);//更新字体颜色
              if(param.fontStrokeWidth==0){
                style.getText().getStroke().setWidth(param.fontStrokeWidth);//更新字体边线
              }
              else{
                style.getText().getStroke().setWidth(param.fontStrokeWidth);//更新字体边线
              }
              style.getText().setOffsetX(param.offsetX);//更新x方向偏移
              style.getText().setOffsetY(param.offsetY);//更新y方向偏移
              style.getText().setTextBaseline(param.textBaseline);//更新注记放置位置
              // style.getText().setMaxAngle(param.maxAngle);//更新注记间隔
            }
            return function(feature) {
              if(feature.get(param.textField)!=" "){
                style.getText().setText(feature.get(param.textField));
              }
              else{
                style.getText().setText('');
              }
              // style.getText().setText(feature.get(param.textField));
              return style;
            }
          }
        }

        return function() {
          this.setStyle( styleGenerator() );
          // 图层是否可见
          param.visible? this.setVisible( true ) : this.setVisible( false );
        }
      }()

      // 将制图参数和图层对象绑定(制图参数改变，图层随之更新)
      this.param.__myob__.dep.addSub( this._olLayer );

      // 将当前图层添加到ol.Map中
      this.$nextTick(t => this.$parent.$emit("addtile", this._olLayer));

    },
  }
</script>
