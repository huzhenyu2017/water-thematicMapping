<template>
  <Sider hide-trigger :class="{ hidden: isCollapsed ,'map-menu':true}" :style="{ position: 'fixed', top:'64px',bottom:0, left: 0, background: '#fff', zIndex: '2000'}" >
    <!-- :style="{ zIndex: '9999'}" 注意，这里z-index要设置成小于Spin的2010的一个值 -->
    <Tabs size="small" v-model="activeLabel">
        <TabPane label="color" name='color'>
          <ColorPick v-if="activeParam" :param='activeParam' :topMenu='self' :options='options'/>
        </TabPane>
        <TabPane label="layers" name='layers'>
          <draggable v-model="reverseParams">
            <template v-for="(param,index) in reverseParams">
                <component v-bind:is='param.panel' :param = 'param' :topMenu='self' :key="index"></component>
            </template>
          </draggable>
        </TabPane>
        <TabPane  label="style" name='style'>
          <StylePick v-if="activeParam" :param='activeParam' :topMenu='self' :options='options'/>
        </TabPane>
    </Tabs>
    <div class="doorhandle" @click="changeSiderState">
      <Icon :type="isCollapsed?'arrow-right-b':'arrow-left-b'" size="30" style="color:rgb(101, 128, 208)"></Icon>
    </div>
  </Sider>
</template>

<script>
import LinePanel from "./LinePanel.vue";
import PointPanel from "./PointPanel.vue";
import PolygonPanel from "./PolygonPanel.vue";
import ColorPick from "./ColorPick.vue";
import StylePick from "./StylePick.vue";
import draggable from "vuedraggable";

// 制图菜单组件

export default {
  name: "MapMenu",
  props: ["params"],
  data() {
    return {
      activeParam: null,
      activeLabel: "layers",
      self: null,
      paramsLocal: null,
      options: {},
      isCollapsed: false
    };
  },
  computed: {
    reverseParams: {
      get: function() {
        return this.paramsLocal;
      },
      set: function(a) {
        // 确保已经保存了地图对象并且已经有图层在里面
        if (!this.__global__.olMap && !this.__global__.olMap.getLayers())
          return;
        // 图层洗牌，但是不包括底图，所以仅保存底图图层

        // ol.layer.Group
        var layerGroup = this.__global__.olMap.getLayerGroup();
        // ol.Collection
        var layers = layerGroup.getLayers();
        // Array
        var layerArray = layers.getArray().slice(0, 1);
        /*
        params中，图层顺序与数组元素相同
        ol的map中，图层顺序与数组元素相反，即最下面的图层在数组的第一个元素
         */
        for (var i = a.length; i > 0; i--) {
          layerArray.push(a[i - 1].__myob__.dep.subs[0]);
        }
        layers.array_ = layerArray;
        layerGroup.setLayers(layers);
        // 重新设置图层
        this.__global__.olMap.setLayerGroup(layerGroup);
        // 下一帧重绘
        this.__global__.olMap.render();
        this.paramsLocal = a;
      }
    }
  },
  components: {
    LinePanel,
    PointPanel,
    PolygonPanel,
    ColorPick,
    StylePick,
    draggable
  },
  created() {
    this.self = this;
    // this.params.reverse();
    // 拷贝一份props
    this.paramsLocal = this.params.slice(0);
    // 保证图层顺序与面板顺序一致，最上面的图层，面板也在最上面
    this.paramsLocal.reverse();
  },
  methods: {
    /**
     * 跳转到指定的标签页，并且标记发起跳转的制图参数
     * @param  {[type]} name         [description]
     * @param  {[type]} currentParam [description]
     * @param  { Object } options 包含很多选项
     * @return {[type]}              [description]
     */
    toPage(name, currentParam, options) {
      this.activeLabel = name;
      this.activeParam = currentParam;
      this.options = options;
    },

    /**
     * 改变侧边栏状态
     * @return {[type]} [description]
     */
    changeSiderState() {
      this.isCollapsed = !this.isCollapsed;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ivu-layout-sider:after {
  content: "";
  display: block;
  width: 1px;
  height: 100%;
  background: #dddee1;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
}

.ivu-layout-sider {
  width: 20% !important;
  min-width: 20% !important;
  max-width: 20% !important;
}

/* .ivu-layout-sider .map-menu {
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  background: #fff;
  z-index: 9999;
} */

.ivu-tabs .ivu-tabs-tabpane {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.doorhandle {
  position: absolute;
  top: 50%;
  right: -32px;
  width: 33px;
  height: 83px;
  background-color: #fff;
  transform: translateY(-50%);
  z-index: 2;
  border-radius: 0 7px 7px 0;
  border-right: 1px solid #dddee1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden {
  transform: translateX(-100%);
}
/* .ivu-tabs-bar {
    display: none;
  }
  .ivu-tabs-nav-container{
    display: none;
  } */
</style>
