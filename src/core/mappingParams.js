/**
 *
 * vue源码 src\core\observer\index.js defineReactive
 *
 * vue.$watch:
 * a:被观察的对象实例(这里是制图参数mappingParams)
 * observe( a ) -->  创建a的observer对象 --> a的每个成员属性都执行一次 defineReactive（如果属性成员b是对象，就再执行一次observe(b)）
 * a的成员属性，在执行了defineReactive之后，就都获得了新的setget函数。
 * 在a的observer对象中，还有一个Dep类型的实例，维护了依赖a的所有观察者。
 * 在a的属性变化的时候，也就是调用了a成员属性的新的set函数，新的set函数会执行dep.notify，提醒观察者们数据变动
 *
 * 参考这个方式，实现openlayers图层随制图参数改变而自动更新
 */

function PolylineParam(type) {

  PublicProp.call( this, 'LinePanel', 'LineLayer' );

  /**
   *
   * @type {ol.Color|ol.ColorLike}
   */
  this.color = 'rgba(139, 0, 0, 1)';

  /**
   *
   * @type {string|undefined}
   */
  this.lineCap = 'round';

  /**
   *
   * @type {Array.<number>}
   */
  this.lineDash = null;

  /**
   *
   * @type {number|undefined}
   */
  this.lineDashOffset = null;

  /**
   *
   * @type {string|undefined}
   */
  this.lineJoin = 'round';

  /**
   *
   * @type {number|undefined}
   */
  this.miterLimit = null;

  /**
   *
   * @type {number|undefined}
   */
  this.width = 0.2;

  /**
   *
   * @type {string|undefined}
   */
  this.checksum = undefined;

  /**
   * 标识自定义的线型
   * @type {[type]}
   */
  this.custom = null;

  this.interval = 1;

  this.manual_width = false;//是否手动调整线宽
  this.manual_interval = false;//是否手动调整样式间隔

  /**
   * 用于图例遍历样式
   * @type {String}
   */
  this.stylePic = './static/LineLayer/template1/实线.png';

  // 保存注记字体样式
  this.fontStyle = "normal";
  this.fontSize = 14;
  this.font = "宋体";
  this.fontFamily = "sans-serif";
  this.fontFill = "#003366";
  this.fontStrokeColor = "#ffffff";
  this.fontStrokeWidth = 3;
  this.offsetX = 0;
  this.offsetY = 0;
  this.textBaseline = "middle";
  this.maxAngle = Math.PI / 4,
  this.text = {
    // font: '13px 微软雅黑,sans-serif',
    // scale: 1,//注记展示大小比例
    // placement:'line',
    // rotateWithView:true,
    // maxAngle:Math.PI / 2,
    // // overflow:true,//是否全部展示注记
    // fill: new ol.style.Fill({
    //   color: '#000'
    // }),
    // stroke: new ol.style.Stroke({
    //   color: '#fff',
    //   width: 3
    // })
  };

};

function PointParam( type ) {

  PublicProp.call( this, 'PointPanel', 'PointLayer' );

  this.color = '#576C84';
  this.crossOrigin = 'anonymous';
  // this.src = 'https://openlayers.org/en/v4.6.4/examples/data/dot.png';
  this.src = this.stylePic = './static/2.png';
  this.opacity = 1;
  // 点符号默认初始尺寸
  this.scale = 0.3;

  // 是否是分级设色------------分级相关参数
  this.isGrade = false;
  // 分级设色分级数
  this.gradeCount = 3;
  // 分级字段
  this.gradeField = null;
  // 分段方法
  this.gradeMethod = '等间距分段';
  // 终止颜色
  this.stopColor = '#99490f';
  // 起始颜色
  this.startColor = '#fee9da';


  // 是否是统计图表-----------------统计相关参数
  this.isChart = false;
  // 默认图表id
  this.chartID = '010101';
  // 统计图表的制图字段
  this.statFields = [];
  // 字段对应颜色的默认值
  this.colors = [ '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d' ];

  // 是否是聚类统计--------------聚类相关参数
  this.isCluster = false;
  // 集群间距
  // 集群之间的最小距离（像素）。默认是20。
  this.distance = 30;
  // 聚类符号的背景颜色
  this.clusterColor = '#3399CC';

  // 分级设色分级数
  this.gradeCount = 3;
  // 分级字段
  this.gradeField = null;
  // 分段方法
  this.gradeMethod = '等间距分段';

  // 保存注记字体样式
  this.fontStyle = "normal";
  this.fontSize = 10;
  this.font = "宋体";
  this.fontFamily = "sans-serif";
  this.fontFill = "#003366";
  this.fontStrokeColor = "#ffffff";
  this.fontStrokeWidth = 3;
  this.textManual = false;//点图层独有的属性
  // 保存注记字体样式
  this.text = {
    // font: '14px 微软雅黑,sans-serif',
    // scale: 1,//注记展示大小比例
    // // overflow:true,//是否全部展示注记
    // fill: new ol.style.Fill({
    //   color: '#000'
    // }),
    // stroke: new ol.style.Stroke({
    //   color: '#fff',
    //   width: 3
    // })
  };

  // 测试按属性
  this.zoomArray = null;
  this.showField = null;
  this.showFieldValue = null;

}

function PolygonParam( type ) {
  /* 函数调用方法：function.call() || function.apply() */
  // 相同点：在特定的作用域中调用函数，等于动态设置函数体内this对象的值，以扩充函数赖以运行的作用域
  // 不同点：接收参数的方式不同
  // 1.apply方法：接收两个参数，一个是函数运行的作用域（this），另一个是参数数组[agruments]
  // 2.call()方法：第一个参数和apply()方法的一样，但是传递给函数的参数必须列举出来
  PublicProp.call( this, 'PolygonPanel', 'PolygonLayer' );
  this.color = '#4b5cc4';
  // 是否是分级设色
  this.isGrade = false;
  // 分级设色分级数
  this.gradeCount = 3;
  // 分级字段
  this.gradeField = null;
  // 分段方法
  this.gradeMethod = '等间距分段';
  // 终止颜色
  this.stopColor = '#99490f';
  // 起始颜色
  this.startColor = '#fee9da';

  this.stylePic = this.color;

  // 保存注记字体样式
  this.fontStyle = "normal";
  this.fontSize = 14;
  this.font = "宋体";
  this.fontFamily = "sans-serif";
  this.fontFill = "#003366";
  this.fontStrokeColor = "#ffffff";
  this.fontStrokeWidth = 3;
  this.offsetX = 0;
  this.offsetY = 0;
  this.textAlign = "center";
  this.text = {
    // font: '14px 微软雅黑,sans-serif',
    // fill: new ol.style.Fill({
    //   color: '#000080'
    // }),
    // stroke: new ol.style.Stroke({
    //   color: '#ffffff',
    //   width: 3
    // }),
    // scale: 1,//注记展示大小比例
    // placement:'point',
    // overflow: true,//是否全部展示注记

    //标签的边框
    // backgroundStroke:new ol.style.Stroke({
    //     color:'#003366',
    //     width:1
    // }),
    // //标签的背景填充
    // backgroundFill:new ol.style.Fill({
    //     color:'#003366'
    // })
  };
  // 测试按属性
  this.zoomArray = null;
  this.showField = null;
  this.showFieldValue = null;
}

/**
 * 公共的属性
 * @param       {[type]} panel [description]
 * @param       {[type]} layer [description]
 * @constructor
 */
function PublicProp( panel, layer ) {
  // 是否可见
  this.visible = true;
  // 是否显示注记信息
  this.showLabels = false;
  // // 数据源
  // this.url = null;
  // 对应的图层类型
  this.layer = layer;
  // 对应的面板类型
  this.panel = panel;
  // 保存样式图片的地址
  this.stylePic = null;
  // 注记字段
  this.textField = null;
  // 注记面板是否初始显示
  this.isText = false;
  // 当前的缩放级别
  this.zoom = null;
  // 当前的中心点
  this.center = null;
}



export {
  PolylineParam,
  PointParam,
  PolygonParam,
}
