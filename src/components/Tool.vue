<template lang="html">
  <div class="toolbar" v-if="isShowTool">
    <div id="search-box"><cascader :data="areaData" filterable trigger="hover" size="large" @on-visible-change="showAreaList" @on-change="handleAreaChange" placeholder="请选择行政区划"></cascader></div> 
    <!-- <div v-if="editable === 'feature'" :class = "{ 'using': draw === 'arrow' }" @click="drawChangeTo('arrow')"><Icon :size='iconsize' type="arrow-graph-up-right" title="地图标绘"></Icon></div> -->
    <Tooltip content="返回系统首页" placement="bottom">
      <div class="icon-tool" @click="backToIndex()"><Icon :size='iconsize' type="arrow-left-a"></Icon></div>
    </Tooltip>
    <Tooltip content="点注记拖动" placement="bottom">
      <div class="icon-tool" :class = "{ 'current': editable === 'label' }" @click="editMapElements('label')"><Icon :size='iconsize' type="android-textsms"></Icon></div>
    </Tooltip>
    <Tooltip content="地图整饰拖动" placement="bottom">
      <div class="icon-tool" :class = "{ 'current': editable === 'map' }" @click="editMapElements('map')"><Icon :size='iconsize' type="map"></Icon></div>
    </Tooltip>
    <Tooltip content="地图基础操作" placement="bottom">
      <div class="icon-tool" :class = "{ 'current': editable === 'feature' }" @click="editMapElements('feature')"><Icon :size='iconsize' type="earth"></Icon></div>
    </Tooltip>
    <Tooltip content="打印输出地图" placement="bottom">
      <div class="icon-tool" @click="showPrintModle()" ><Icon :size='iconsize' type="printer"></Icon></div>
    </Tooltip>
    <Tooltip content="保存制图模板" placement="bottom-end">
      <div class="icon-tool" @click="saveTemplate()"><Icon :size='iconsize' type="upload"></Icon></div>
    </Tooltip>
    <!-- <div class="icon-tool" @click="showAreaList()"><Icon :size='iconsize' type="location" title="制图区域定位"></Icon></div> -->
    <!-- <div class="icon-tool" @click="showPrintModle()" ><Icon :size='iconsize' type="printer" title="打印地图"></Icon></div>
    <div class="icon-tool" @click="saveTemplate()"><Icon :size='iconsize' type="upload" title="上传模板"></Icon></div> -->
    <!-- button "save" -->
  </div>
  <div v-else-if="isShowUpload" class="formDiv">
     <Form :model="formItem" :label-width="80" class="formClass">
     	<p class="formTitle">制图模板保存</p>
        <FormItem label="模板名称" style="font-size: 16px;">
            <Input v-model="formItem.input" placeholder="请输入模板名称..." style="padding-right: 20px;"></Input>
        </FormItem>
        <FormItem label="模板权限">
            <RadioGroup v-model="formItem.radio">
                <Radio label="公开">公开</Radio>
                <Radio label="个人">个人</Radio>
            </RadioGroup>
        </FormItem>
        <FormItem label="模板描述">
            <Input v-model="formItem.textarea" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入对制图模板的描述..." style="padding-right: 20px;"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" style="margin-left: 34px" @click="upload()">上传</Button>
            <Button type="ghost" style="margin-left: 60px" @click="quitSave()">取消</Button>
        </FormItem>
    </Form>
  </div>

  <div v-else class="printDiv">
     <Form :model="formItem" :label-width="80" class="formClass">
     	<p class="formTitle">地图打印设置</p>
        <FormItem label="地图名称" style="font-size: 16px;">
            <Input v-model="mapName" placeholder="请输入地图名称..." style="padding-right: 20px;"></Input>
        </FormItem>
        <FormItem label="纸张选择">
          <Select v-model="format">
              <Option v-for="(item,index) in formats" :value="item" :key="index">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="纸张方向">
          <Select v-model="direction">
            <Option v-for="(item,index) in directions" :value="item" :key="index">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="输出精度">
          <Select v-model="resolution">
            <Option v-for="(item,index) in resolutions" :value="item" :key="index">{{ item + 'dpi' }}</Option>
          </Select>
        </FormItem>
        <FormItem>
            <Button id="export-pdf" type="primary" style="margin-left: 34px" @click="printMap()">打印</Button>
            <Button type="ghost" style="margin-left: 60px" @click="quitPrint()">取消</Button>
        </FormItem>
    </Form>
  </div>
</template>

<script>
export default {
  name: 'Tool',
  props: ['editable', 'draw' ,'params'],
  data() {
    return {
      iconsize:30,
      isShowTool: true,
      isShowUpload :false,
      isShowPrint:false,
      formItem: {
        input: '',  
        radio: '公开',
        textarea: ''
      },
      formats: ["a5","a4", "a3", "a2", "a1", "a0"], //纸张大小
      resolutions: ["96","120","150","200","300"], //输出dpi
      format: "a4",
      resolution: "96",
      dims: {
        a0: [1189, 841],
        a1: [841, 594],
        a2: [594, 420],
        a3: [420, 297],
        a4: [297, 210],
        a5: [210, 148]
      },
      size: [594, 420],
      direction: "横向",
      directions: ["横向", "纵向"],
      loading: 0,
      loaded: 0,
      mapName: null,
      features:[],
      vectorSource:null,
      areaList: [
        ['杭州市','杭州市市辖区','桐庐县','淳安县','萧山区','建德市','富阳市','余杭区','临安市'],
        ['宁波市','宁波市市辖区','象山县','宁海县','鄞县','余姚市','慈溪市','奉化市'],
        ['温州市','温州市市辖区','瓯海区','洞头县','永嘉县','平阳县','苍南县','文成县','泰顺县','瑞安市','乐清市'],
        ['嘉兴市','嘉兴市市辖区','嘉善县','海盐县','海宁市','平湖市','桐乡市'],
        ['湖州市','湖州市市辖区','德清县','长兴县','安吉县'],
        ['绍兴市','绍兴市市辖区','绍兴县','新昌县','诸暨市','上虞市','嵊州市'],
        ['金华市','金华市市辖区','金华县','武义县','浦江县','磐安县','兰溪市','义乌市','东阳市','永康市'],
        ['衢州市','衢州市市辖区','衢县','常山县','开化县','龙游县','江山市'],
        ['舟山市','舟山市市辖区','岱山县','嵊泗县'],
        ['台州市','台州市市辖区','椒江区','玉环县','三门县','台州市','天台县','仙居县','温岭市','临海市'],
        ['丽水市','丽水市市辖区','龙泉市','青田县','云和县','庆元县','缙云县','遂昌县','松阳县','景宁畲族自治县']
      ],
      // selectArea:""
    }
  },
  // 针对原始行政区划数据进行格式化处理
  computed: {
    areaData() {
      var areaData = [];
      for(let item of this.areaList){  
        let obj = new Object(); 
        obj.value = item[0]; 
        obj.label = item[0];  
        let ab = new Array();
        for(let city of item){
          let childObj = new Object();
          childObj.value = city;
          childObj.label = city;
          ab.push(childObj);
        }
        obj.children = ab; 
        areaData.push(obj);
      }
      return areaData;
    }
  },
  watch: {
    /*
    监听纸张方向，更新打印用地图
     */
    direction: function(newValue) {
      // 更新地图宽高比
      var obj = this.dims;
      Object.keys(obj).forEach(function(key) {
        obj[key].reverse(); //颠倒纸张长宽
      });
    }
  },
  mounted(){
    if(this.__global__.templateId!=null){
      this.formItem.input = this.__global__.templateName;
      this.formItem.radio = this.__global__.templateRight;
      this.formItem.textarea = this.__global__.templateDiscription;
    }
  },
  methods: {
    /* 回退到首页面 */
    backToIndex(){
      // this.$router.push({path: '/'});
      window.location.href = this.__global__.href;
    },
    /**
     * 地图输出打印
     * @return {[type]} [description]
     */
    exportMap() {
      this.$router.push({path: '/print'});
    },
    /**
     * 切换至编辑图面元素
     * @param [string] type 要转换的模式字符串
     * @return {[type]} [description]
     */
    editMapElements( type ) {
      this.$emit( 'switch', type );   //切换到打印页(目前不用)
      // this.isShowTool = false;
      // this.isShowUpload = false;
      // this.isShowPrint = false;
    },
    /**
     * 选择涂鸦的类型
     * @param  {string} type 选择的涂鸦类型
     * @return {[type]}      [description]
     */
    drawChangeTo( type ) {
      this.$emit( 'draw', type );
    },

    // 选择不同区域时
    handleAreaChange(value, selectedData){
      // console.log(value[1]);
      // 清除所有行政区划要素
      this.vectorSource.clear();
      if(value.length > 0){
        this.flyTo(value[1]);
      }
    },

    // 定位到所选制图区域
    flyTo(areaName){
      // debugger
      // 按照用户选取的行政区域，动态添加数据
      var rgnCode,zoomTarget,centerX,centerY;
      for(let item of this.features){
        if(item.values_.NAME99===areaName){
          debugger
          this.vectorSource.addFeature(item);  //清除所有要素vectorSource.clear()
          rgnCode = item.values_.RGN_CLASS;
          centerX = item.values_.CENTROID_X;
          centerY = item.values_.CENTROID_Y;
          break;
        }
      }
      if(rgnCode===0){
        zoomTarget = 9;
      }else{
        zoomTarget = 10;
      }
      // 测试飞行定位
      var location = [centerX,centerY];  //中心点坐标[x,y]
      var duration = 2500;
      var zoom = this.__global__.olMap.getView().getZoom();  //当前缩放级别
      if(zoom > 9){
        zoom = 9;
      }
      // var zoomTarget = 9;   //目标缩放级别(地市级-9，区县级-10)
      var parts = 2;
      var called = false;
      function callback(complete) {
        --parts;
        if (called) {
          return;
        }
        if (parts === 0 || !complete) {
          called = true;
          // done(complete);
        }
      }
      debugger;
      this.__global__.olMap.getView().animate({
        center: location,
        duration: duration
      }, callback);
      this.__global__.olMap.getView().animate({
        zoom: zoom - 1,
        duration: duration / 2
      }, {
        zoom: zoomTarget,
        duration: duration / 2
      }, callback);
    },
    
    // 区域定位功能
    showAreaList(isOpen){
      // console.log(isOpen);
      if(!isOpen) return;
      const esrijsonFormat = new ol.format.EsriJSON();
      // 如果还没有加载行政区划数据,请求数据一次性加载全部行政区划
      var that = this;
      if(this.features.length === 0){
        // var url = "./static/AreaJson/地市行政区面.json";
        var url = "./static/AreaJson/浙江行政区划面.json";
        this.vectorSource = new ol.source.Vector({
          loader: function(extent, resolution, projection) {
            $.ajax({url: url, dataType: 'json', success: function(response) {
                debugger
                if (response.error) {
                  alert(response.error.message + '\n' +
                      response.error.details.join('\n'));
                } else {
                  // dataProjection will be read from document
                  that.features = esrijsonFormat.readFeatures(response, {
                    featureProjection: projection
                  });
                }
              }
            });
          }
        });
        var initialStyle = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color : 'rgba(138,43,226,0.7)',
            lineDash:[20,5,10,5],
            lineDashOffset:0,
            width : 4
          }),
          fill: new ol.style.Fill({
            color: 'rgba(222,184,135,0.02)',
          })
        });
        var areaLayer = new ol.layer.Vector({
          source: this.vectorSource,
          style: initialStyle
        });
        this.__global__.olMap.addLayer(areaLayer);
        // 插入行政区划图层在底层
        // var layersArray = this.__global__.olMap.getLayers();
        // layersArray.insertAt(1,areaLayer);
      }
    },

    /* 0804修改 */
    // 弹出打印模态框
    showPrintModle(){
      this.isShowTool = false;
      this.isShowUpload = false;
    },
    // 取消打印按钮(隐藏表单)
    quitPrint(){
      this.isShowTool = true;
      this.isShowUpload = false;
    },

    printMap(){
      var exportButton = document.getElementById("export-pdf");
      exportButton.disabled = true;
      document.body.style.cursor = "progress";
      debugger;
      var coordinateToPixelTransform = this.__global__.olMap.frameState_.coordinateToPixelTransform;
      console.log( coordinateToPixelTransform);

      /* 获取打印参数 */
      var format = this.format; //纸张名称"ax"
      var resolution = this.resolution; //输出dpi
      var direction = this.direction == "横向" ? "landscape" : "portrait"; //纸张方向
      var dim = this.dims[format]; //纸张尺寸

      /* 计算打印地图的尺寸 */
      var width = Math.round(dim[0] * resolution / 25.4); //打印尺寸-宽
      var height = Math.round(dim[1] * resolution / 25.4); //打印尺寸-高
      // console.log(width + "," + height); //1754,1240(landscape,A4,150dpi)

      /* 备份打印前的地图View参数，方便复位 */
      var size = /** @type {module:ol/size~Size} */ (this.__global__.olMap.getSize()); //打印前的初始地图尺寸(map的dom尺寸)
      // console.log(size[0]+','+size[1]);

      var extent = this.__global__.olMap.getView().calculateExtent(size); //打印前的初始地图范围
      // 从map获取到tileLayer的source
      var source = this.__global__.olMap.getLayers().getArray()[0].getSource();
      var timer;
      var keys = [];

      var that = this;
      var loading = that.loading;
      var loaded = that.loaded;

      var tileLoadStart = function() {
        ++that.loading;
      };

      /* 在打印地图时绘制:背景,地图整饰等 */
      function canvasToImage(backgroundColor,canvas,context) {
        // debugger;
        //cache height and width
        var w = canvas.width;
        var h = canvas.height;
        var data;
        // 绘制背景为对应颜色(这里是白色)
        if (backgroundColor) {
          data = context.getImageData(0, 0, w, h); // 保存地图数据
          /*  绘制点要素注记  */
          debugger;
          var frameState = that.__global__.olMap.frameState_;
          var transform = getTransform(frameState);
          // 解决打印时点注记位置偏移的问题(重新计算地理坐标<-->屏幕坐标的转换矩阵)
          function getTransform(frameState) {
            debugger;
            var transform = new Array();
            var viewState = frameState.viewState;
            var dx1 = canvas.width / 2;
            var dy1 = canvas.height / 2;
            var sx = frameState.pixelRatio / viewState.resolution;
            var sy = -sx;
            var angle = -viewState.rotation;
            var dx2 = -viewState.center[0];
            var dy2 = -viewState.center[1];
            
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            transform[0] = sx * cos;
            transform[1] = sy * sin;
            transform[2] = -sx * sin;
            transform[3] = sy * cos;
            transform[4] = dx2 * sx * cos - dy2 * sx * sin + dx1;
            transform[5] = dx2 * sy * sin + dy2 * sy * cos + dy1;
            return transform;
          };
          var psize = [w,h];
          that.$parent.$children[2].canvasResize(psize);
          that.$parent.$children[2].renderLabels(transform);//(问题：将label的canvas进行大小适配，绘制出现明显偏移)
          // 通过drawImage将一个canvas叠加到另一个canvas上
          context.drawImage(that.$parent.$children[2].$refs.label,0,0); 
          var dataWithLabel = context.getImageData(0, 0, w, h);

          // 清空当前画布
          context.clearRect(0, 0, w, h);
          // 保存当前canvas设置
          var compositeOperation = context.globalCompositeOperation;

          /* 绘制地图(按照图廓裁切) */
          context.putImageData(dataWithLabel,0,0,30,30,(w-60),(h-60));

          /* 绘制填充地图背景色 */
          context.globalCompositeOperation = "destination-over";//绘制在地图下方
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, w, h);//draw background / rect on entire canvas

          /* 绘制图廓 */
          context.globalCompositeOperation = compositeOperation;//绘制在地图上方
          context.lineWidth = 5;//图廓宽度
          context.strokeRect(30,30,(w-60),(h-60));//绘制空心矩形图廓

          /* 绘制图名 */
          var fontSize = Math.round(h/21) + 'px';
          context.font = `normal bold ${fontSize} 微软雅黑,sans-serif`;
          // var dx = 50;
          var txtWidth = context.measureText(that.mapName).width;
          var dx = (w - txtWidth)/2;
          var dy = Math.round(h/24) + 45;
          // 绘制图名边线
          context.strokeStyle = "#ffffff";
          context.strokeText(that.mapName,dx,dy,txtWidth*1.5);// "..."展开运算符,用于array和object上把内容展开
          // 绘制图名内容
          context.fillStyle= "#000060";
          context.fillText(that.mapName,dx,dy,txtWidth*1.5);  //context.fillText(text,x,y,maxWidth);
         

          /* 绘制指北针(最好按照输出纸张适配) */
          var width = Math.round(h/12);
          var height = Math.round(h/12);
          // var x = w - 30 - width;
          var x = 40;
          var y = 40;
          context.drawImage( that.__global__.compassImage, x, y ,width,height);

          /* 绘制比例尺(最好按照输出纸张适配) */
          // debugger;
          let scale = that.__global__.olMap.getView().getResolution() / 2.3794610058302803e-9;
          let s = calcScale( scale );// 取整后的比例尺[分子， 分母]
          // 为了好看，把数值和长度都×5。 单位之前统一为厘米
          var a = [ 50, h-90, 300, 50 ]; // [x,y,width,height]
          let c = Math.round(h/250);//5
          let x1 = a[0] + 3;
          let x2 = a[0] + 3 + s[0] * that.__global__.cm2px * c;
          let y1 = a[1] + a[3] * 0.75 - 15;
          let y2 = a[1] + a[3] * 0.75;

          // 更新图例区域宽度，后面多加一点保证都能包含进去
          a[ 2 ] = x2 - x1 + 10;
          // 绘制文字
          var scaleSize = Math.round(h/50) + 'px';
          context.font=`bold ${scaleSize} Arial`;
          context.fillStyle="#058";
          context.fillText( s[1] * c / 100 + "m", a[0] + 15, a[1] + a[3] / 3 );
          // 绘制比例尺线条
          context.beginPath();
          context.moveTo( x1, y1 );
          context.lineTo( x1, y2 );
          context.lineTo( x2, y2 );
          context.lineTo( x2, y1 );
          // 设置线宽，颜色
          context.lineWidth = 7;
          context.strokeStyle = "black";
          context.stroke();

          // 计算分母取整后的比例尺
          function calcScale( scale ) {
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
          }

          /* 绘制图例 */
          var upfitterContext = that.$parent.$children[3].$refs.upfitter.getContext( "2d" );// 图例canvas绘制环境
          var legendData = upfitterContext.getImageData(...that.__global__.legendArray);
          // console.log(legendData);
          context.putImageData( legendData, w-that.__global__.legendArray[2]-45,h-that.__global__.legendArray[3]-45);

          
          /* 通过重新在canvas上绘制注记(测试的方案，目前没有采取这个方式) */
          // renderLabels(canvas,context);
        }

        //get the image data from the canvas
        var imageData = canvas.toDataURL("image/jpeg");//如果想保持图例的透明度，需要在这选择输出格式为png(速度变慢，文件大小太大)  

        if (backgroundColor) {
          //clear the canvas
          context.clearRect(0, 0, w, h);

          //restore it with original / cached ImageData
          context.putImageData(data, 0, 0);

          //reset the globalCompositeOperation to what it was
          context.globalCompositeOperation = compositeOperation;
        }

        //return the Base64 encoded data url string
        return imageData;
      }

      function tileLoadEndFactory(canvas,context) {
        return function() {
          // debugger
          ++that.loaded;
          loaded = that.loaded;
          // ++ loading;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          if (loading === loaded) {
            setTimeout(() => {
              debugger;
              that.loading = 0;
              that.loaded = 0;
              // var data = canvas.toDataURL("image/jpeg");
              var backgroundColor = "#ffffff";
              var data = canvasToImage(backgroundColor,canvas,context);
              var pdf = new jsPDF(direction, undefined, format); //direction = "portrait" |  "landscape"
              pdf.addImage(data, "JPEG", 0, 0, dim[0], dim[1]);
              pdf.save(`${that.mapName}.pdf`);
              keys.forEach(ol.Observable.unByKey);
              keys = [];
              // 回复打印前的地图视窗范围
              that.__global__.olMap.setSize(size);
              that.__global__.olMap.getView().fit(extent, { size: size });
              that.__global__.olMap.renderSync();
              // 恢复图例canvas尺寸
              // that.$parent.$children[2].canvasResize(size);
              // that.$parent.$children[3].canvasResize(size);
              // that.$parent.$children[3].$refs.upfitter.width = size[ 0 ];
              // that.$parent.$children[3].$refs.upfitter.height = size[ 1 ];
              // that.$parent.$children[2].$refs.label.width = size[ 0 ];
              // that.$parent.$children[2].$refs.label.height = size[ 1 ];
              exportButton.disabled = false;
              document.body.style.cursor = "auto";
              alert("地图输出成功!");
            }, 500);
          }
        };
      }

      this.__global__.olMap.once("postcompose", function(event) {
        //   debugger
        var canvas = event.context.canvas;
        var context = event.context;
        var tileLoadEnd = tileLoadEndFactory(canvas,context);
        keys = [
          source.on("tileloadstart", tileLoadStart),
          source.on("tileloadend", tileLoadEnd),
          source.on("tileloaderror", tileLoadEnd)
        ];
        tileLoadEnd();
      });

      debugger
      /* 设置用于打印的地图范围 */
      var printSize = [width, height];//1754,1240(landscape,A4,150dpi)
      this.__global__.olMap.setSize(printSize); //The size in pixels of the map in the DOM.
      this.__global__.olMap.getView().fit(extent, { size: printSize });
    
      this.loaded = -1;
      that = this;

      // 确保打印出的地图的缩放级别与当前选择一致( 缩放级别+1 )
      this.__global__.olMap.getView().setZoom(this.__global__.olMap.getView().getZoom() + 1);
      this.__global__.olMap.renderSync();
      
      // console.log( this.__global__.olMap.frameState_.coordinateToPixelTransform);
       /* 设置其他canvas的打印范围 */
      // this.$parent.$children[3]为图例组件，this.$parent.$children[2]为label组件
      // this.$parent.$children[2].$refs.label.width = printSize[0];
      // this.$parent.$children[2].$refs.label.height = printSize[1];
      // this.$parent.$children[2].canvassize[0] = printSize[0];
      // this.$parent.$children[2].canvassize[1] = printSize[1];
      // this.$parent.$children[2].renderLabels();
    },

    //点击保存模板按钮(弹出表单)
    saveTemplate(){
      this.isShowTool = false;
      this.isShowUpload = true;
    },

    //取消保存按钮(隐藏表单)
    quitSave(){
      this.isShowTool = true;
      this.isShowUpload = false;
    },

    upload(){
      // 在保存模板时，获取当前地图的中心点与缩放级别，以便复位
      var zoomLevel = this.__global__.olMap.getView().getZoom();
      var centerPt = this.__global__.olMap.getView().getCenter();
      console.log(zoomLevel);
      console.log(centerPt);
      this.params.forEach(param => {
        param.zoom = zoomLevel;
        param.center = centerPt;
      });

      if(this.__global__.templateId!=null){
        //update模板
        let obj = {
          name:this.formItem.input,
          discription:this.formItem.textarea,
          template:JSON.stringify(this.params),
          right:this.formItem.radio,
          templateId:this.__global__.templateId
        };
        var options = {
            method: 'POST',
            headers: {
                // "Content-type": "application/json"
            },
            body:JSON.stringify(obj)
        };
        fetch(`http://47.96.162.249:3008/updateTemplate`,options)
        .then(response=>response.json())
          .then(json=>{
            if(json.message === "success"){
              this.isShowTool = true;
              this.isShowUpload = false;
              alert("更新模板成功!");
            }else{
              alert(json);
            }
        });

      }else{
        //insert模板
        //jsonStr.name,jsonStr.user,jsonStr.discription,jsonStr.template,date,jsonStr.right,jsonStr.category,jsonStr.temtype,jsonStr.visible,jsonStr.pic
        var categoryTemp;
        switch(this.__global__.type){
          case "template1": categoryTemp = "自然类"
            break;
          case "template2": categoryTemp = "工程类"
            break;
          case "template3": categoryTemp = "管理类"
            break;
          default:
            break;
        }  
        
        let obj = {
          name:this.formItem.input,
          user:this.__global__.templateUser,
          discription:this.formItem.textarea,
          template:JSON.stringify(this.params),
          right:this.formItem.radio,
          category: categoryTemp,
          temtype:"custom",
          visible:true,
          // pic:"http://47.96.162.249:3009/static/pic/zrsx.png"
          pic:"./static/pic/zrsx.png"
        };
        var options = {
            method: 'POST',
            headers: {
                // "Content-type": "application/json"
            },
            body:JSON.stringify(obj)
        };
        fetch(`http://47.96.162.249:3008/saveTemplate`,options)
        .then(response=>response.json())
          .then(json=>{
            if(json.message === "success"){
              this.isShowTool = true;
              this.isShowUpload = false;
              alert("创建模板成功!");
            }else{
              alert(json);
            }
        });
      }
     
    }

  }

}
</script>

<style scoped>
  .toolbar {
    position: absolute;
    top: 75px;
    right: 5px;
    /* width: 300px;
    height: 100px; */
    /* background-color: #f90; */
    display: flex;
    justify-content: center;
  }
  .toolbar #search-box{
    width: 230px;
    margin: auto 10px;
    /* border:1px solid #BFBFBF; */
    box-shadow:3px 3px 4px #aaa;
  }
  .toolbar .icon-tool {
    border-radius: 50%;
    background-color: #56aee2;
    margin: 0 2px;
    width: 45px;
    height: 45px;
    display: flex;
    justify-content: center;
  }
  /* .toolbar > div {
    border-radius: 50%;
    background-color: #56aee2;
    margin: 0 4px;
    width: 55px;
    display: flex;
    justify-content: center;
  } */
  .toolbar .icon-tool.current {
    background-color: #f90;
  }
  /* .toolbar > div.current {
    background-color: #f90;
  } */
  .toolbar > div.using {
    background-color: #0f0;
  }
  .ivu-icon {
    /* margin: 10px auto; */
    margin: auto;
    cursor: pointer;
    color: #fff;
  }
  .formClass {
    background-color: #fff;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  .formDiv{
    position: absolute;
    top: calc(50vh - 180px);
    right: calc(50vw - 200px);
    width: 370px;
    height: 360px;
    display: flex;
    border:1px solid #BFBFBF;
    box-shadow:5px 5px 10px 5px #aaa;
  }
  .formTitle{
  	text-align: center;
  	margin-top: 30px;
  	margin-bottom: 30px;
  	font-size: 20px;
  	font-weight: bold;
  }

  .printDiv{
    position: absolute;
    top: calc(50vh - 180px);
    right: calc(50vw - 200px);
    width: 370px;
    height: 400px;
    display: flex;
    border:1px solid #BFBFBF;
    box-shadow:5px 5px 10px 5px #aaa;
  }

  .ivu-select{
    width: 240px;
  }

  .ivu-input-wrapper{
    width: 260px;
  }
   /*.fontsize.ivu-form-item

 .ivu-form-item-label{
    font-size: 20px;
   }            */
</style>
