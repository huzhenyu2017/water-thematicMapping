<template>
  <div class="cont">
    <Tabs>
      <!-- style="font-size:60px;" -->
      <Tab-pane label="新建专题图">
        <div class="cont-info">
          <b class="info1">选择地图模板开始制图！</b>
          <p class="info2">在线制图系统能够基于制图模板实现快速制图，提供三种默认专题图模板：自然类模板、水利工程模板、防汛管理类模板，分别包含不同的制图数据和制图参数，以实现三种主题的专题地图表达。</p>
        </div>
        <div class="cont2-template">
          <!-- <router-link :to="...">(声明式路由) 等价于 router.push(...) (编程式路由) -->
          <router-link :to="{ path: 'data', query: { type: '1' }}" >
            <mapTemplate
              class="maptemplate"
              pic="./static/pic/zrsx.png"
              name="自然类模板"
              discription="自然类模板表达全省自然水系的分布情况，包括主要的河流、湖泊等数据。"
              right="公开"
              temtype="default"
              />
          </router-link>
          <router-link :to="{ path: 'data', query: { type: '2' }}" >
            <mapTemplate
              class="maptemplate"
              pic="./static/pic/zrsx.png"
              name="工程类模板"
              discription="水利工程模板表达全省重大水利工程分布情况，包括各类水利工程设施数据。"
              right="公开"
              temtype="default"
            />
          </router-link>
          <router-link :to="{ path: 'data', query: { type: '3' }}" >
            <mapTemplate
              class="maptemplate"
              pic="./static/pic/zrsx.png"
              name="管理类模板"
              discription="防汛管理模板表达防汛工程专题的分布情况，包括测站、堤防、山塘等数据。"
              right="公开"
              temtype="default"
            />
          </router-link>
        </div>
      </Tab-pane>

      <Tab-pane label="我的模板" >
          <mymap/>
      </Tab-pane>
      <!-- <Tab-pane label="地图广场">
        <mapsquare/>
      </Tab-pane> -->
    </Tabs>
  </div>
</template>
<script>
import mapTemplate from './MapTemplate';
// import search from './Search';
// import sort from './Sort';
import mymap from './MyMap';
import mapsquare from './MapSquare';

export default {
  components: {mapTemplate,mymap,mapsquare},
  name: 'Home',
  data () {
    return {
    }
  },
  created () {
    this.__global__.mappingData = [];
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .cont {
    display: flex;
    flex: 1;
    background-color: #fff;
    flex-direction: column;
    overflow: auto;
  }
  .cont2-template {
    display: flex;
    flex-direction: row;
    /* justify-content: flex-start;  */
    justify-content: space-between; 
    margin-top: 10px;
    /* flex-wrap:  wrap; */
    flex-wrap: nowrap;

    margin-left:20px;
    margin-right:20px;
    /* overflow: auto; */
  }
  .cont2-template > div {
    width: 25%;
  }
  /* .tab-label .ivu-tabs-nav-container{
    font-size: 18px;
  } */

  .maptemplate {
    width: 80%;
    margin: 20px;  
    /* 20px 20px */
  }
  .cont-info {
    font-size: 18px;
    background-color: #f2f2f2;
    height: 15%;
    display: flex;
    flex-direction: column;
    align-items:flex-start;
    justify-content: center;
    /* padding-left: 9px; */
    padding: 10px;
  }
  .info1 {
    font-size: 22px;
    margin-bottom: 10px;
  }
  .ivu-tabs {
    overflow-y:  auto !important;
  }
  /* .ivu-tabs-nav-container {
    font-size: 18px !important;
  }
  .ivu-dropdown-item {
    font-size:35px !important;

  }
  .ivu-tabs-bar {
    margin-bottom: 6px !important;
  } */

</style>
