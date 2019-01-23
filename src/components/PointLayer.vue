<template>
  <div>
    <!-- 当组件渲染的时候，<slot>元素将会被替换为父组件输入的内容，可以包含任何模板代码，包括 HTML、其他组件 -->
    <slot></slot>
  </div>
</template>

<script>

  const extent =  [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634];
  const esrijsonFormat = new ol.format.EsriJSON();

  export default {
    name: 'Pointlayer',
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
      // 全局对象，其中包含图表服务地址、顶层Map对象等信息
      var global = this.__global__;
      // 要素的集合
      var featureArr = null;
      var scope = this;

      /**
       * 检查字符串是否是数字
       * @param  {[type]} theObj [description]
       * @return {[type]}        [description]
       */
      function checkNumber(theObj) {
        var reg = /^[0-9]+.?[0-9]*$/;
        if (reg.test(theObj)) {
          return true;
        }
        return false;
      }

      if( typeof param.url === "string" ) {
        var vectorSource = new ol.source.Vector({
        loader: function(extent, resolution, projection) {
          var url = param.url;
          $.ajax({url: url, dataType: 'jsonp', success: function(response) {
              if (response.error) {
                alert(response.error.message + '\n' +
                    response.error.details.join('\n'));
              } else {
                debugger;
                var alias = response.fieldAliases;  // 字段别名，在展示时需要用中文别名
                // dataProjection will be read from document
                var features = esrijsonFormat.readFeatures(response, {
                  featureProjection: projection
                });
                if (features.length > 0) {
                  vectorSource.addFeatures(features);
                  // 保存要素集合的引用
                  featureArr = features;
                  scope.$emit( 'feaure-loaded', scope.index, features, param.textField, param.showField );

                  // 保存可以用于分级符号的字段
                  param.fields = [];
                  for (var variable in features[0].values_) {
                    // debugger
                    if(variable === "FID" || variable === "OBJECTID" || variable === "UPDATETIME"){
                      continue;
                    }
                    // 如果字段的属性值是数字的话，就可以用来做分级符号
                    if (features[0].values_.hasOwnProperty(variable) && checkNumber( features[0].values_[ variable ] ) ) {
                      let max, min;
                      max = min = features[0].values_[ variable ];
                      features.forEach( function( feature, index ) {
                        if( +feature.values_[ variable ] > max ) {
                          max = +feature.values_[ variable ];
                        }
                        if( +feature.values_[ variable ] < min ) {
                          min = +feature.values_[ variable ];
                        }
                      } )

                      // 保存可以用来做分级设色的字段（值为数字）和该字段值的最大值和最小值
                      param.fields.push( {
                        field: variable,
                        max: max,
                        min: min,
                      } );
                    }
                  }
                }
                // 通知顶层数据已经添加到地图上了
                param.container.doneRequestParams++;
              }
            }});
          },
        });
      } else if( typeof param.url === "object" ) {
        var vectorSource = new ol.source.Vector({
          features: (new ol.format.GeoJSON()).readFeatures(param.url)
        });
        // 通知顶层数据已经添加到地图上了
        param.container.doneRequestParams++;
      }


    // this._olLayer = new ol.layer.Vector({
    //     source: vectorSource,
    //     style: function(feature) {
    //       style.getText().setText(feature.get('HSSTNM'));
    //       return style;
    //     }
    // });

     // 初始的样式
     var initialStyle = new ol.style.Style({
       image: new ol.style.Icon( this.param ),
       // 按属性展示测试
       geometry: function(feature) {
         if(param.showField === null){
           return feature.get("geometry");
         }else{
          if(feature.get(param.showField) >= param.showFieldValue){
           return feature.get("geometry");
          }
         }
       }
     });

     this._olLayer = new ol.layer.Vector({
       source: vectorSource,
       style: initialStyle
     });

      // 图层对象都要定义一个update函数，用于实时更新制图参数
      this._olLayer.update = function() {
        /**
         * 根据分段数、分级方法和分级字段生成分段区间
         * @return {[type]} [description]
         */
        function getNodeArray() {
          debugger
          // 分级数
          var count = param.gradeCount;
          // 获取当前分级字段，以及其最大值最小值
          if(param.fields.length ==0){
            alert('该要素图层暂无分级字段！')
            return 0;
          }
          var field = param.fields.find( function( element, index ){
            return element.field === param.gradeField;
          })
          /*
          field {
            field: variable,
            max: max,
            min: min,
          }
           */
          // 当前字段的最大值和最小值
          var max = field.max;
          var min = field.min;
          // 保存分级节点的数组，分级间距
          // 节点数组包含首尾
          var a = [], gap = 0;
          switch ( param.gradeMethod ) {
            case '等间距分段':
              gap = ( max - min ) / count;
              while ( min < max ) {
                a.push( min );
                min += gap;
              }
              a.push( max );
              return a;
            case '等比分段':
              gap = ( max - min ) / (count*(count+1));
              for(var i = 0; i<count-1; i++){
                a.push( min );
                min += (i+1) * (i + 2) * gap;
              }
              a.push( max );
              return a;
            default:
              break;
          }
        }

        /**
         * 将#ccc补全为#cccccc
         * @param  {[type]} color [description]
         * @return {[type]}       [description]
         */
        function fix16Color( color ){
          if( color.length < 7 ) {
            return '#' + color.slice(1).split( '' ).map( function( value ) { return value + value } ).join( '' );
          } else {
            return color;
          }
        }

        /**
         * 获取颜色数据   16进制 #ffffff
         * @returns {Array}
         */
        function getColorArray16(){
          var customNum = param.gradeCount;
          var colorLow = fix16Color( param.startColor );
          var colorHigh = fix16Color( param.stopColor );
          var rl = parseInt(colorLow.substr(1,2),16);
          var gl = parseInt(colorLow.substr(3,2),16);
          var bl = parseInt(colorLow.substr(5,2),16);
          var rh = parseInt(colorHigh.substr(1,2),16);
          var gh = parseInt(colorHigh.substr(3,2),16);
          var bh = parseInt(colorHigh.substr(5,2),16);
          var colors = [];
          if(customNum==1){
              colors.push(colorLow);
          }else if(customNum>1){
              for(var i=0;i<customNum;i++){
                  var r = parseInt(rl + (rh-rl)*i/(customNum<2?1:(customNum-1)));
                  var g = parseInt(gl + (gh-gl)*i/(customNum<2?1:(customNum-1)));
                  var b = parseInt(bl + (bh-bl)*i/(customNum<2?1:(customNum-1)));
                  colors.push("#"+(r.toString(16).length!=2?"0"+r.toString(16):r.toString(16))
                      +""+(g.toString(16).length!=2?"0"+g.toString(16):g.toString(16))
                      +""+(b.toString(16).length!=2?"0"+b.toString(16):b.toString(16)))
              }
          }
          return colors;
        }

        // 聚类的数据源对象
        var clusterSource = new ol.source.Cluster({
          distance: param.distance,
          source: vectorSource
        });

        return function() {
          // 如果点状图层目前的状态是聚类统计的话
          if( param.isCluster ){
            // 设置集群最小间距
            clusterSource.setDistance( param.distance );
            // 将数据源换乘聚类要素
            this.setSource( clusterSource );

            /*
            更改点状图层样式：
            使用圆圈加数字的样式。
             */
            this.setStyle(
              function(feature) {
                var size = feature.get('features').length;
                var style = new ol.style.Style({
                  image: new ol.style.Circle({
                    radius: 11,
                    stroke: new ol.style.Stroke({
                      color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                      color: param.clusterColor
                    })
                  }),
                  text: new ol.style.Text({
                    text: size.toString(),
                    fill: new ol.style.Fill({
                      color: '#fff'
                    })
                  })
                });
                return style;
            })
          }
          // 如果点状图层现在的状态是分级设色的话
          else if( param.isGrade ) {
            let styles = [];
            // 获取颜色数组
            let colors = getColorArray16();
            // 获取分级节点数组
            let nodes = getNodeArray();
            if(nodes == 0)  return;

            /*
            分级的属性值处于nodes[i]和nodes[i+1]之间（左开右闭）的面状要素
            将会被渲染成colors[i]
             */

            // 临时参数
            let tempParam = {};
            for (var variable in param) {
              if (param.hasOwnProperty(variable)) {
                tempParam[ variable ] = param[ variable ];
              }
            }

            for( let i = 0; i < param.gradeCount; i++ ) {
              tempParam.color = colors[ i ];
              styles.push(
                new ol.style.Style({
                  image: new ol.style.Icon( tempParam ),
                  geometry: function(feature) {
                    // 每次重绘都会调用（拖拽、缩放都包括）
                    // feature代表单个矢量要素
                    // feature.values_能读取到要素的字段信息

                    if( i === 0 && feature.values_[ param.gradeField ] === nodes[0] )
                      return feature.getGeometry();

                    if( nodes[ i ] < feature.values_[ param.gradeField ] && nodes[ i + 1 ] >= feature.values_[ param.gradeField ] )
                      return feature.getGeometry();
                  }
                })
              )
            }
            // 如果之前是聚类的话，数据源就会变成clusterSource，在这里换回来
            this.setSource( vectorSource );
            this.setStyle( styles );
          }
          else {
            // 如果之前是聚类的话，数据源就会变成clusterSource，在这里换回来
            this.setSource( vectorSource );
            this.setStyle( new ol.style.Style({
              image: new ol.style.Icon( param ),
              // 按属性展示测试 nodeArray = [9.8, 9.8, 9.5, 9.2, 9, 8, 7, 6, 5, 4, 0] (对应zoom = [ [7,],8,9,10,11,12,13,14,15(*15级以后全部显示)])
              geometry: function(feature) {
                if(param.showField === null){
                  return feature.get("geometry");
                }else{
                  if(feature.get(param.showField) >= param.showFieldValue){
                    return feature.get("geometry");
                  }
                }
              }
            }));
          }

          // 图层是否可见
          param.visible? this.setVisible( true ) : this.setVisible( false );
        }

      }()

      // 将制图参数和图层对象绑定
      this.param.__myob__.dep.addSub( this._olLayer );

      // 将当前图层添加到ol.Map中
      // $parent 属性可以用来从一个子组件访问父组件的实例
      // $nextTick 在数据变化之后立即执行函数,而非等待默认等待下一个tick更新
      // (Vue异步执行 DOM 更新只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变)
      this.$nextTick(t => this.$parent.$emit("addtile", this._olLayer));

    },
  }
</script>
