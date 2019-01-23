<template>
  <div id="app">
    <div class="layout">
      <layout :style="{height: '100vh'}">
        <div class="cont1-title">
          <div class="cont-titlepic">
            <img class="titlepic" src="../static/pic/title.png" />
            <p class="homeTitle">水利行业在线专题制图系统</p>
          </div>
          <HR class="hrule" color= #0473C2 ></HR>
        </div>
        <!-- transition封装组件，可以给任何元素和组件添加进入/离开过渡 -->
        <transition name="slide-fade" mode="out-in">
          <!-- 这里的router-view针对index.js配置的页面路由，为路由预留元素('/' => Home.vue) -->
          <router-view/> 
        </transition>
      </layout>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      activeName: "home"
    };
  },
  created() {
    // 页面初始化时默认的active menuitem，根据路由决定
    this.activeName = this.$route.path.slice(1);
    // 进行浏览器适配
    var UserAgent = navigator.userAgent.toLowerCase();
    var browser = null;
    var browserArray = {
      IE: window.ActiveXObject || "ActiveXObject" in window, // IE
      Chrome: UserAgent.indexOf("chrome") > -1 && UserAgent.indexOf("safari") > -1, // Chrome浏览器
      Firefox: UserAgent.indexOf("firefox") > -1, // 火狐浏览器
      Opera: UserAgent.indexOf("opera") > -1, // Opera浏览器
      Safari: UserAgent.indexOf("safari") > -1 && UserAgent.indexOf("chrome") == -1, // safari浏览器
      Edge: UserAgent.indexOf("edge") > -1, // Edge浏览器
      QQBrowser: /qqbrowser/.test(UserAgent), // qq浏览器
      WeixinBrowser: /MicroMessenger/i.test(UserAgent) // 微信浏览器
    };
    for (var i in browserArray) {
      if (browserArray[i]) {
        browser = i;
      }
    }
    this.__global__.browserType = browser;
    // console.log(browser);

    //保存首页地址
    if (this.__global__.href == null) {
      this.__global__.href = window.location.href;
    }
    // console.log(this.__global__.href);

    // 通过session获取平台单点登录的用户信息
    // this.__global__.templateUser = sessionStorage.getItem("username");//英文名(部署时使用)
    // this.__global__.userName = sessionStorage.getItem("fullname");//中文名sessionStorage.getItem("fullname")
    this.__global__.templateUser = "slpt1";//测试时使用

    if(this.__global__.templateUser != null){
      // 获取该用户可用服务，重新赋值this.__global__.allData
      let obj = {
        username: this.__global__.templateUser
      };
      var options = {
        method: 'POST',
        headers: {
          "Content-type": "application/json"
        },
        body:JSON.stringify(obj)
      };
      fetch('http://118.178.119.202:8080/waterServer/service/queryAccessServer',options)
      .then(response=>response.json())
        .then(json=>{
          if(json.pageData.length > 0){
            // 遍历获取当前用户可获取的服务列表
            var filterData = new Set();//使用集合，防止数据源重复
            this.__global__.allData.map( function( data, i ) {
              json.pageData.forEach(( value, index ) =>{
                // console.log(value.title);
                if(value.title == data.name || data.name.indexOf(value.title)>-1){
                  filterData.add(data);
                }
              })
            });
            this.__global__.allData = [...filterData];
          }else{
            alert("当前用户暂无可用制图服务！");
            this.__global__.allData = [];
          }
      });
    }else{
      alert("请先登录！");
      this.__global__.allData = [];
    }
    
  },
  watch: {
    $route() {
      //标题栏选中效果
      // this.$refs.mapmenu.currentActiveName = this.$route.path.slice(1) || 'home';
    }
  },
  methods: {
    // togodata () {
    //   switch(this.$route.path.slice(1)) {
    //     case '':
    //     console.log(this.$refs.mapmenu.currentActiveName);
    //     this.$refs.mapmenu.currentActiveName = 'home';
    //     // console.log(this.$refs.mapmenu.currentActiveName);
    //     alert("请选择制图模板");
    //     // console.log(this.$refs.mapmenu.currentActiveName);
    //     break;
    //     case 'map':
    //     this.$router.go(-1);
    //     break;
    //   }
    // },
    // togomap () {
    //   switch(this.$route.path.slice(1)) {
    //     case '':
    //     this.$refs.mapmenu.currentActiveName = 'home';
    //     alert("请选择制图模板");
    //     break;
    //     case 'data':
    //     if (this.__global__.mappingData.length > 0) {
    //       this.$router.push({path: '/map'});
    //     }else {
    //       this.$refs.mapmenu.currentActiveName = 'home';
    //       alert("请选择制图数据");
    //     }
    //     break;
    //   }
    // },
    // togohome () {
    //   this.__global__.mappingData = [];
    //   this.$router.push({path: '/'});
    // },
  }
};
</script>


<style >
/* app.vue是唯一保存全局样式的地方 */
.q {
  float: right;
}

#app {
  padding: 0px;
}
.layout {
  background: #f5f7f9;
  position: relative;
  /* 0723修改,为了适配firefox */
  overflow-y: hidden;
}

/* 可以设置不同的进入和离开动画 */
/* 设置持续时间和动画函数 */
.slide-fade-enter-active {
  transition: all 0.8s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.ivu-layout-header {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
  z-index: 10000;
}

.icon {
  margin-right: 5px;
}
.ivu-steps {
  width: 30%;
}

.ivu-select-dropdown.ivu-transfer-no-max-height {
  margin: 5px 0px 0px -182px;
}

.ivu-spin-fullscreen {
  z-index: 10001;
}

/* .ivu-tabs-bar {
    display: none;
  } */

/* 针对mapping页面的ivu-tab-bar隐藏样式; 
     .class1.class2=>匹配的是同时拥有class1和class2的元素
     .class1 .class2=>匹配的是父节点是class1类，子节点是class2类的元素。 
  */
.map-menu .ivu-tabs-bar {
  display: none;
}

.cont .ivu-tabs-bar {
  margin-bottom: 6px;
}

.ivu-tabs {
  height: 100%;
}
.ivu-tabs-content.ivu-tabs-content-animated {
  height: 100%;
}
.layercardbox {
  background: #fff;
  margin-bottom: 10px;
}
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.5s;
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
.cont-titlepic {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 64px;
}
.titlepic {
  width: 64px;
  height: 64px;
}
.homeTitle {
  font-size: 30px;
  padding: 2px;
  margin-left: 20px;

  color: rgb(23, 30, 58);

  font-weight: bold;
  z-index: 1000;
}
.ivu-tabs-nav-container {
  font-size: 18px;
}
.cont .ivu-tabs-nav-container {
  font-size: 18px;
}
.ivu-dropdown-item {
  font-size: 15px !important;
}
.ivu-tabs-bar {
  margin-bottom: 6px;
}
/* .ivu-tabs {
    overflow-y:  auto !important;
  } */
.ivu-select-dropdown {
  position: absolute !important;
}
</style>
