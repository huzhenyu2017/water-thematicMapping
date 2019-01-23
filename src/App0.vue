<template>
  <div id="app">

    <div class="layout">
      <layout :style="{height: '100vh'}">
          <Header>
              <Menu class="menu" ref="mapmenu" mode="horizontal"  active-name="activeName" theme="dark">
                <div style="{display:flex;justify-content:center}">
                  <MenuItem  class="menuitem" name="home">
                      <!-- <router-link tag="span" to="/" > -->
                      <div @click="togohome">
                        <Icon type="images" class="icon" size=18></Icon>
                        <span class="menuname">模板</span>
                      </div>
                      <!-- </router-link> -->
                  </MenuItem>
                <Icon type="chevron-right" color="#fff"></Icon>
              </div>
              <div style="{display:flex;justify-content:center}">
                <MenuItem class="menuitem" name="data" >
                  <div  @click="togodata">
                    <Icon type="stats-bars" class="icon" size=18 ></Icon>
                    <span class="menuname">数据</span>
                  </div>
                </MenuItem>
                <Icon type="chevron-right" color="#fff"></Icon>
              </div>
                <MenuItem  class="menuitem" name="map" >
                  <div @click="togomap">
                    <Icon type="map" class="icon" size=18 ></Icon>
                    <span class="menuname" >地图</span>
                  </div>
                </MenuItem>
              </Menu>
          </Header>
          <transition name="slide-fade" mode="out-in">
            <router-view/>
          </transition>

      </layout>
    </div>

  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
        activeName: 'home'
    }
  },
  created () {
    // 页面初始化时默认的active menuitem，根据路由决定
    this.activeName = this.$route.path.slice(1);

  },
  watch: {
    '$route' () {
      //标题栏选中效果
      this.$refs.mapmenu.currentActiveName = this.$route.path.slice(1) || 'home';
    }
  },
  methods: {
    togodata () {
      switch(this.$route.path.slice(1)) {
        case '':
        console.log(this.$refs.mapmenu.currentActiveName);
        this.$refs.mapmenu.currentActiveName = 'home';
        // console.log(this.$refs.mapmenu.currentActiveName);
        alert("请选择制图模板");
        // console.log(this.$refs.mapmenu.currentActiveName);
        break;
        case 'map':
        this.$router.go(-1);
        break;
      }
    },
    togomap () {
      switch(this.$route.path.slice(1)) {
        case '':
        this.$refs.mapmenu.currentActiveName = 'home';
        alert("请选择制图模板");
        break;
        case 'data':
        if (this.__global__.mappingData.length > 0) {
          this.$router.push({path: '/map'});
        }else {
          this.$refs.mapmenu.currentActiveName = 'home';
          alert("请选择制图数据");
        }
        break;
      }
    },
    togohome () {
      this.__global__.mappingData = [];
      this.$router.push({path: '/'});
    },
  }
}
</script>

<style>
.q {
  float: right;
}

  ul.ivu-menu > li > span {
    /* display: inline-block; */
    /* height: inherit; */
  }

  #app{padding: 0px;}
  .layout{
      background: #f5f7f9;
      position: relative;
      overflow: hidden;
  }

  /* 可以设置不同的进入和离开动画 */
  /* 设置持续时间和动画函数 */
  .slide-fade-enter-active {
    transition: all .8s ease;
  }
  .slide-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to
 {
    transform: translateX(10px);
    opacity: 0;
  }

  .ivu-layout-header {
    box-shadow: 0 1px 1px rgba(0,0,0,.08);
    z-index: 10000;
  }

  .icon {
    margin-right: 5px;

  }
  .ivu-steps {
    width: 30%;
  }

  .ivu-select-dropdown.ivu-transfer-no-max-height{
    margin: 5px 0px 0px -182px;
  }

  .ivu-spin-fullscreen { z-index: 10001 }

  /* .ivu-tabs-bar {
    display: none;
  } */

.ivu-tabs {
  height: 100%;
}
.ivu-tabs-content.ivu-tabs-content-animated{
  height: 100%;
}
  .layercardbox {
    background: #fff;
    margin-bottom: 10px;
  }
  .scale-enter-active, .scale-leave-active {
    transition: transform .5s;
    /* transform-origin: top left; */
  }
  .scale-enter, .scale-leave-to /* .fade-leave-active below version 2.1.8 */ {
    transform: scale(0);
  }

  .menuname {
    font-size: 18px;
  }
  .menu {
    display: flex;
    flex: 1;
    flex-direction: row;
    margin-top: 4px;
  }
  .menuitem {
    display: flex;

    flex-direction: row;

  }
  .ivu-card-head {
    cursor: move;
  }
  .ivu-card {
    /* box-shadow: 0 1px 6px rgba(0,0,0,.2); */
    background-color: #fff;
    /* background-color: #e9e9e9; */
    border-color: #e9e9e9;
    /* border-color: #e9e9e9; */
  }
</style>
