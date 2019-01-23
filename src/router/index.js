import Vue from 'vue'
import Router from 'vue-router'
import Mapping from '../components/Mapping'
import Print from '../components/Print'
import Home from '@/components/Home'  //'@': resolve('src'),相当于给你的src目录起了一个别名叫'@'
import Data from '../components/Data'

// 通过全局方法 Vue.use() 使用插件
Vue.use(Router)

// 重定向：redirect: '/b' (当用户访问 /a时，URL将会被替换成 /b，然后匹配路由为 /b)
// 别名：alias: '/b' (当用户访问/b 时，URL会保持为/b，但是路由匹配则为/a，就像用户访问/a 一样)
// *Router中的routes定义了多个router-view视图组件，可以用于渲染同一页面(通过多视图提高网页组件化)
export default new Router({
  mode: 'history', //使用history模式需要后台支持
  // base:'/watermappingzj', //在进行build时,按照Tomcat的项目名称配置base路径，以及config/index.js中的build部分的 assetsPublicPath: '/zj-water-thematicMapping/',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/data',
      name: 'Data',
      component: Data
    },
    {
      path: '/map',
      name: 'Mapping',
      component: Mapping
    },
    {
      path: '/print',
      name: 'Print',
      component: Print,
    }
  ]
})
