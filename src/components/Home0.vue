<template>
  <div class="cont">
    <Tabs>
      <Tab-pane label="新建专题图"  style="font-size:60px;">
        <div class="cont-info">
          <b class="info1">选择地图模板开始制图！</b>
          <p class="info2">在线制图系统能够基于制图模板实现快速制图，提供三种默认专题图模板：自然类、工程类、管理类，分别包含不同的制图数据和制图参数，以实现三种主题的地图表达。</p>
        </div>
        <div class="cont2-template">
          <router-link :to="{ path: 'data', query: { type: '1' }}" >
            <mapTemplate
              class="maptemplate"
              pic="/static/pic/zrsx.png"
              name="自然类"
              discription="自然类模板表达自然水系的分布情况，包括河流、湖泊数据。"
              right="公开"
              temtype="default"
              />
            </router-link>
            <router-link :to="{ path: 'data', query: { type: '2' }}" >
          <mapTemplate
            class="maptemplate"
            pic="/static/pic/zrsx.png"
            name="工程类"
            discription="自然类模板表达自然水系的分布情况，包括河流、湖泊数据。"
            right="公开"
            temtype="default"
            />
          </router-link>
          <router-link :to="{ path: 'data', query: { type: '3' }}" >
          <mapTemplate
            class="maptemplate"
            pic="/static/pic/zrsx.png"
            name="管理类"
            discription="自然类模板表达自然水系的分布情况，包括河流、湖泊数据。"
            right="公开"
            temtype="default"
            />
          </router-link>
        </div>
      </Tab-pane>
      <mymap/>
      <Tab-pane label="我的模板">
        <!-- <div class="cont-filtasearch">
          <div class="filter">
            <Dropdown class="filterItem" trigger="click" style="margin-left: 20px" @on-click="rightFilter">
                <a href="javascript:void(0)" class="filterName" @click="rightClick">
                    {{rightItem}}
                    <Icon type="arrow-down-b" v-if="rightDownShow"></Icon>
                    <Icon type="arrow-up-b" v-if="rightUpShow"></Icon>
                </a>
                <Dropdown-menu slot="list" >
                    <Dropdown-item class="filterItem" name="全部权限">全部权限</Dropdown-item>
                    <Dropdown-item class="filterItem" name="公开">公开</Dropdown-item>
                    <Dropdown-item class="filterItem" name="个人">个人</Dropdown-item>
                </Dropdown-menu>
            </Dropdown>
            <Dropdown class="filterItem" trigger="click" style="margin-left: 20px"  @on-click="categoryFilter">
                <a href="javascript:void(0)" class="filterName" @click="categoryClick">
                    {{categoryItem}}
                    <Icon type="arrow-down-b" v-if="categoryDownShow"></Icon>
                    <Icon type="arrow-up-b" v-if="categoryUpShow"></Icon>
                </a>
                <Dropdown-menu slot="list">
                    <Dropdown-item class="filterItem" name="全部类别">全部类别</Dropdown-item>
                    <Dropdown-item class="filterItem" name="自然类">自然类</Dropdown-item>
                    <Dropdown-item class="filterItem" name="工程类">工程类</Dropdown-item>
                    <Dropdown-item class="filterItem" name="管理类">管理类</Dropdown-item>
                </Dropdown-menu>
            </Dropdown>
            <sort ref="sort" :list="tempSelfList" :allist="allSelfList"  @sortResult="sortResult"/>
          </div>
          <search :allist="allSelfList" @searchResult="searchResult"> </search>
        </div>
        <div class="cont2-template">
          <mapTemplate class="maptemplate"  v-for='(item, index) in tempSelfList' :key="index" v-if='item.visible===true'
          :pic='item.pic' :name='item.name' :discription='item.discription'
          :category='item.category' :author='item.author' :time='item.time'
          :right='item.right' :temtype='item.temtype' :visible='item.visible'/>
        </div> -->
      </Tab-pane>
      <Tab-pane label="地图广场">
      </Tab-pane>
    </Tabs>
  </div>
</template>
<script>
import mapTemplate from './MapTemplate';
// import search from './Search';
// import sort from './Sort';
import mymap from './MyMap';

export default {
  components: {mapTemplate,mymap},
  name: 'Home',
  data () {
    return {
      // //筛选下拉符号
      // rightDownShow: true,
      // rightUpShow: false,
      // categoryDownShow: true,
      // categoryUpShow: false,
      //
      // rightItem: '全部权限',
      // categoryItem: '全部类别',
      //全部专题图
     //  allSelfList: [{
     //     'pic': '/static/pic/zrsx.png',
     //     'name': '水',
     //     'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
     //     'category': '自然类',
     //     'author': 'user1',
     //     'time': '2018-5-21-19:01',
     //     'right': '公开',
     //     'temtype': 'custom',
     //     'visible': true
     //   },
     //   {
     //     'pic': '/static/pic/zrsx.png',
     //    'name': '河',
     //    'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
     //    'category': '自然类',
     //    'author': 'user1',
     //    'time': '2018-5-21-19:02',
     //    'right': '公开',
     //    'temtype': 'custom',
     //    'visible': true
     //  },
     //     {
     //       'pic': '/static/pic/zrsx.png',
     //      'name': '水河',
     //      'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
     //      'category': '工程类',
     //      'author': 'user1',
     //      'time': '2018-5-20-19:02',
     //      'right': '个人',
     //      'temtype': 'custom',
     //      'visible': true
     //    },
     //    {
     //      'pic': '/static/pic/zrsx.png',
     //     'name': 'g水利',
     //     'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
     //     'category': '工程类',
     //     'author': 'user1',
     //     'time': '2018-5-20-20:01',
     //     'right': '个人',
     //     'temtype': 'custom',
     //     'visible': true
     //   }
     // ],
    //  //模板页显示专题图实际列表
    // tempSelfList: [],
    // //搜索结果
    // searchResultList: [],
    // //筛选结果
    // filterResultList: [],
    // //筛选临时存储
    // filterTemp: []
    }
  },
  // mounted () {
  //   //初始显示、筛选结果、搜索结果均为全部专题图,
  //   this.tempSelfList = this.allSelfList;
  //   this.filterResultList = this.allSelfList;
  //   this.searchResultList = this.allSelfList;
  // },
  created () {
    this.__global__.mappingData = [];

  },

  // methods: {
    // //权限筛选
    // rightFilter (key) {
    //   this.rightClick();
    //   this.rightItem = key;
    //   if (key === '全部权限') {
    //     this.allSelfList.forEach(item => {
    //         item.visible = true;
    //     });
    //   }else{
    //     this.allSelfList.forEach(item => {
    //       if(item.right !== key) {
    //         item.visible = false;
    //       }else {
    //         item.visible = true;
    //         this.filterTemp.push(item);
    //       }
    //     });
    //     this.filterResultList = this.filterTemp;
    //     this.filterTemp = [];
    //     this.showTemplate(this.filterResultList, this.searchResultList);
    //   }
    // },
    // //类别筛选
    // categoryFilter (key) {
    //   this.categoryItem = key;
    //   this.categoryClick();
    //
    //   if (key === '全部类别') {
    //     this.allSelfList.forEach(item => {
    //         item.visible = true;
    //         this.filterTemp = this.allSelfList;
    //     });
    //   }else{
    //     this.allSelfList.forEach(item => {
    //       if(item.category !== key) {
    //         item.visible = false;
    //       }else {
    //         item.visible = true;
    //         this.filterTemp.push(item);
    //       }
    //     });
    //   }
    //   this.filterResultList = this.filterTemp;
    //   this.filterTemp = [];
    //   this.showTemplate(this.filterResultList, this.searchResultList);
    // },
    //
    // //搜索结果
    // searchResult (result) {
    //   this.searchResultList = result;
    //   this.showTemplate(this.filterResultList, this.searchResultList);
    // },
    // //排序结果
    // sortResult (result) {
    //   this.tempSelfList = result;
    // },
    // showTemplate (filter, search) {
    //   var filter = new Set(filter);
    //   var search = new Set(search);
    //   this.tempSelfList = Array.from(new Set([...filter].filter(item => search.has(item))));
    // },
    // categoryClick () {
    //   this.categoryUpShow = !this.categoryUpShow;
    //   this.categoryDownShow = !this.categoryDownShow;
    // },
    // rightClick () {
    //   this.rightUpShow = !this.rightUpShow;
    //   this.rightDownShow = !this.rightDownShow;
    // }
  // }
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
    justify-content: flex-start;
    margin-top: 10px;
     flex-wrap:  wrap;

  }
  .filter {
    width: 100%;
    height: 5%;
    display: flex;
    flex: 1;
    align-items: center;
  }
  .filterName {
    color: #5e5e5e;
    font-size: 16px;

  }
  .filterItem {
    size: 22px;
    width: 100px;

  }
  /* .searchTemIpt {
    border-radius: 10px;
    width: 200px;
  } */
  .searchbtn {
    border-radius: 5px;
    width: 70px;
    height: 30px;
    background-color: #fff;
    font-size: 16px;
    vertical-align: middle;
  }
  .hrule {
    size: 30;
  }
  .maptemplate {
    width: 400px;
    margin: 50px;

  }
/*
  .searchTem {
    margin-right: 10px;
  } */
  .cont-filtasearch {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #f2f2f2;
    height: 8%;

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
  .ivu-tabs-nav-container {
    font-size: 18px !important;
  }
  .ivu-dropdown-item {
    font-size: 15px !important;

  }
  .ivu-tabs-bar {
    margin-bottom: 6px !important;
  }
</style>
