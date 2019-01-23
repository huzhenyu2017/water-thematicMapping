<script>
/**
 * 用于存放项目的全局变量，如制图参数，制图类型等
 * @type {[type]}
 */
  export default
  {
    // 制图数据
    mappingData:[],
    // 制图类型
    type: null,
    /*
    geotype 用于保存当前数据是点线面中的哪一种
    type保存的是当前数据类型 default是服务数据， custom是用户上传数据
    template保存了可以用于哪种制图模板
     */
    allData: [
      // {"name":"水库","geotype":"esriGeometryPolygon","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuiku/MapServer"},
      // {"name":"泵站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6079/arcgis/rest/services/zjsl/bengzhan/MapServer"},
      // {"name":"堤防工程","geotype":"esriGeometryPolyline","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/difanggongcheng/MapServer"},
      // {"name":"灌区工程","geotype":"esriGeometryPolygon","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/guanqugongcheng/MapServer"},
      // {"name":"海塘","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/haitang/MapServer"},
      // {"name":"河流","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":" http://114.215.249.116:6080/arcgis/rest/services/zjsl/heliu/MapServer"},
      // {"name":"湖泊","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/hupo/MapServer"},
      // {"name":"农村供水工程","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://114.215.249.116:6079/arcgis/rest/services/zjsl/nongcungongshuigongcheng/MapServer"},
      // {"name":"山塘","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shantang/MapServer"},
      // {"name":"水电站","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuidianzhan/MapServer"},
      // {"name":"水文测站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuiwencezhan/MapServer"},
      // {"name":"水闸","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuizha/MapServer"},
      // {"name":"围垦","geotype":"esriGeometryPolygon","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/weiken/MapServer"},
      // {"name":"引调水","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/yindiaoshui/MapServer"},
      //  {"name":"水库","geotype":"esriGeometryPolygon","type":"default","template":["template2"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/shuiku/MapServer","text":"RSNM","gradeField":"RSSZ","rules":{"visible":true,"showLabels":false,"stylePic":"#0071be","color":"#0071be","text":{"fontStyle":"italic", "fontSize":14, "font":"微软雅黑", "fontFamily":"sans-serif","initSize":14,"fill":{"color_":"#000080"},"stroke":{"color_":"#ffffff","lineDash_":null,"width_":3},"scale":1,"placement":"point","overflow":true,"offsetX":0,"offsetY":0,"textAlign":"center"}} },
       {"name":"水库","geotype":"esriGeometryPolygon","type":"default","template":["template2"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/shuiku3/MapServer","text":"RSNM","gradeField":"RSSZ","showNodes":{"showField":"SHAPE_Area","zoomArray":[0.001,0.0007,0.0004,0.0001,0]},"rules":{"visible":true,"showLabels":false,"stylePic":"#0071be","color":"#0071be","text":{"fontStyle":"italic", "fontSize":13, "font":"微软雅黑", "fontFamily":"sans-serif","initSize":13,"fill":{"color_":"#000080"},"stroke":{"color_":"#ffffff","lineDash_":null,"width_":3},"scale":1,"placement":"point","overflow":true,"offsetX":0,"offsetY":0,"textAlign":"center"}} },
       {"name":"河流","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/rivers/MapServer","text":"RVNM","gradeField":"GRADE","rules":{"visible":true,"showLabels":false,"stylePic":"#0071be","color":"#0071be","text":{"fontStyle":"italic", "fontSize":14, "font":"微软雅黑", "fontFamily":"sans-serif","initSize":14,"fill":{"color_":"#000080"},"stroke":{"color_":"#ffffff","lineDash_":null,"width_":3},"scale":1,"placement":"point","overflow":true,"offsetX":0,"offsetY":0,"textAlign":"center"}}},
      //  {"name":"湖泊","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/lake/MapServer","text":"LKNM","gradeField":"LKAREA","rules":{"visible":true,"showLabels":false,"stylePic":"#00afee","color":"#00afee","text":{"fontStyle":"italic", "fontSize":14, "font":"微软雅黑", "fontFamily":"sans-serif","initSize":14,"fill":{"color_":"#000080"},"stroke":{"color_":"#ffffff","lineDash_":null,"width_":3},"scale":1,"placement":"point","overflow":true,"offsetX":0,"offsetY":0,"textAlign":"center"}}},
       {"name":"湖泊","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/lake3/MapServer","text":"LKNM","gradeField":"LKAREA","showNodes":{"showField":"SHAPE_Area","zoomArray":[0.0003,0.000204, 0.000114,0.0001,0]},"rules":{"visible":true,"showLabels":false,"stylePic":"#00afee","color":"#00afee","text":{"fontStyle":"italic", "fontSize":13, "font":"微软雅黑", "fontFamily":"sans-serif","initSize":13,"fill":{"color_":"#000080"},"stroke":{"color_":"#ffffff","lineDash_":null,"width_":3},"scale":1,"placement":"point","overflow":true,"offsetX":0,"offsetY":0,"textAlign":"center"}}},
       {"name":"堤防工程","geotype":"esriGeometryPolyline","type":"default","template":["template2","template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/difang/MapServer","text":"DKNM","gradeField":"DKSZ","rules":{"visible":true,"showLabels":false,"stylePic":"./static/LineLayer/template3/圆点.png","color":"#8B0000","custom":"dot","width":1,"text":{"maxAngle":Math.PI/4,"initWidth":0.04,"fontStyle":"normal", "fontSize":5, "font":"微软雅黑", "fontFamily":"sans-serif","initSize":5,"fill":{"color_":"#8B0000"},"stroke":{"color_":"#ffffff","lineDash_":null,"width_":3},"placement":"line","overflow":false,"offsetX":0,"offsetY":0,"textBaseline":"hanging"}}},
      //  {"name":"泵站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/pump/MapServer","text":"PPNM","gradeField":"PPSZ","rules":{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template2/消防水泵.png", "color":"#1e497b", "scale":0.2,"text":{"fontOffx":5,"scaleDelta":0.07,"fontDelta":2,"initScale":0.2,"fontStyle":"italic", "fontSize":13, "initSize":13,"font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}},
      //  {"name":"泵站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/pump_all/MapServer","text":"PPNM","gradeField":"PPSZ","showNodes":{"showField":"ISTCPT","zoomArray":[9, 8.5, 8.5, 7.5, 6, 5, 4, 3, 2, 0]},"rules":{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template2/消防水泵.png", "color":"#1e497b", "scale":0.16,"text":{"fontOffx":3.5,"scaleDelta":0.04,"fontDelta":1.4,"initScale":0.16,"fontStyle":"normal", "fontSize":10, "initSize":10,"font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}},
       {"name":"泵站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/pump_all/MapServer","text":"PPNM","gradeField":"PPSZ","showNodes":{"showField":"ISTCPT","zoomArray":[[9, 8.5, 8.5, 7.5, 6, 5, 4, 3, 2, 0],[9, 8.5, 8.5, 7, 4, 3, 1, 0]]},"rules":[{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template2/消防水泵.png", "color":"#1e497b", "scale":0.16,"text":{"fontOffx":2.5,"scaleDelta":0.04,"fontDelta":1.5,"initScale":0.16,"fontStyle":"normal", "fontSize":10, "initSize":10,"font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}},{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template2/消防水泵.png", "color":"#1e497b", "scale":0.135,"text":{"fontOffx":2.0,"scaleDelta":0.03,"fontDelta":1.5,"initScale":0.135,"fontStyle":"normal", "fontSize":8, "initSize":6,"font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}]},
       {"name":"水闸","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/gate/MapServer","text":"GTNM","gradeField":"GTSZ","rules":{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template2/分水闸.png", "color":"#1e497b", "scale":0.16,"text":{"fontOffx":2.5,"scaleDelta":0.035,"fontDelta":1.5,"initScale":0.16,"fontStyle":"normal", "fontSize":10, "initSize":10, "font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}},
       {"name":"山塘","geotype":"esriGeometryPoint","type":"default","template":["template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/shantang/MapServer","text":"PDNM","gradeField":"XHST","showNodes":{"showField":"XHST","zoomArray":[9.9, 9.9, 9.7, 9.6, 9.5, 9.1, 9, 6, 3,0]},"rules":{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template3/水位站1.png", "color":"#1e497b", "scale":0.15,"text":{"fontOffx":2.0,"scaleDelta":0.03,"fontDelta":1.5,"initScale":0.15,"fontStyle":"normal", "fontSize":8, "initSize":6, "font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}},
       {"name":"防汛物资仓库","geotype":"esriGeometryPoint","type":"default","template":["template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/fangxunwuzi/MapServer","text":"REPNM","gradeField":"REPAR","showNodes":{"showField":"BLTY","zoomArray":[2015, 2013, 2011, 2008, 2005, 2000,0]},"rules":{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template3/洪水预警.png", "color":"#1e497b", "scale":0.15,"text":{"fontOffx":2.0,"scaleDelta":0.03,"fontDelta":1.5,"initScale":0.15,"fontStyle":"normal", "fontSize":8, "initSize":6, "font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}},
       {"name":"测站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/zjwater/shuiwencezhan/MapServer","text":"HSSTNM","gradeField":"CODE","showNodes":{"showField":"RVCD","zoomArray":["0","0",""]},"rules":{"visible":true,"showLabels":false,"stylePic":"./static/PointLayer/template2/水文站.png", "color":"#1e497b", "scale":0.135,"text":{"fontOffx":2.0,"scaleDelta":0.03,"fontDelta":1.5,"initScale":0.135,"fontStyle":"normal", "fontSize":8, "initSize":6, "font":"微软雅黑", "fontFamily":"sans-serif","fill":"#000080","stroke":"#ffffff","strokeWidth":3}}},
      //  {"name":"围垦","geotype":"esriGeometryPolygon","type":"default","template":["template2","template3"],"address":"http://47.96.162.249:6080/arcgis/rest/services/weiken/MapServer","text":"INNM"},
      //  {"name":"引调水","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://47.96.162.249:6080/arcgis/rest/services/yindiaoshui/MapServer","text":"WDNM"},
      //  {"name":"水电站","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://47.96.162.249:6080/arcgis/rest/services/shuidianzhan/MapServer","text":"HDSTNM"},
    ],

    // 地图范围
    extent: [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634],

    olMap: null, // 用于保存地图对象

    mappingTemplate:null,//用于保存当前制图模板内容

    templateId:null, //用于保存当前制图模板id

    templateName:null,//用于保存当前制图模板名称

    templateDiscription:null,//用于保存当前制图模板描述

    templateRight:null,//用于保存当前制图模板权限

    templateUser:null,//用于保存当前制图模板用户英文名

    userName: null,//用于保存当前制图模板用户英文名

    browserType:null,//用户保存当前浏览器类型

    href:null, //首页地址

    compassImage:null,//指北针缓存图片

    cm2px:null,//比例尺单位转换参数

    legendArray:null,//图例位置数组[x,y,width,height]

  }
</script>
