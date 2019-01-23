/**
 * vue中是在被观察的对象上定义‘__ob__’属性，自己定义的ob就添加到‘__myob__’属性
 * 观察者模式：(本质上是一种对象行为模式)
      定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知
   发布/订阅模式：(本质上是一种架构模式，强调组件的作用) 
 */

import Dep from './dep'

/**
 * 将被观察的制图参数与Observer组合
 * @param  {Object} value 被观察的制图参数对象
 * @param  {Dep} dep 子属性的订阅者和父对象应该相同，这个dep就是父对象的dep
 * @return {[type]}       [description]
 */
export default function observe( value, dep ) {
  // typeof null 返回的是object
  // 如果不是对象实例
  if ( !(value !== null && typeof value === 'object') ) {
    return
  }
  let ob;
  if ( value.hasOwnProperty( '__myob__' ) && value.__myob__ instanceof Observer) {
    ob = value.__myob__
  }
  else {
    ob = new Observer( value, dep );
  }

  return ob
}

/**
 * 观察者对象，与制图参数对象组合，将参数对象的属性全部转换成setget
 * 当数据对象的属性改变时，观察者对象通知所有订阅该参数的openlayers图层对象更新制图参数
 * @type {[type]}
 */

class Observer {
  value = null;
  dep = null; // 用于管理参数对象的订阅图层

  /**
   * @param {Object} value 制图参数对象
   * @param  {Dep} dep 子属性的订阅者和父对象应该相同，这个dep就是父对象的dep
   */
  constructor ( value, dep ) {
    this.value = value;
    this.dep = dep || new Dep();
    // 将Observer对象作为属性添加到被观察的数据对象上 ( 给"被观察者对象(制图参数)"添加_myob_属性,即当前的Observer对象 )
    Object.defineProperty(value, '__myob__', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    })
    if (Array.isArray(value)) {
      // this.observeArray(value)
    } else {
      this.walk(value, this.dep)
    }
  }

  /**
   * 只有被观察的数据是对象的时候调用
   * 遍历对象的属性，并把属性转化成setget函数
   */
  walk ( obj, dep ) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]], dep)
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray ( items ) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

/**
 * 对象属性转化为setget
 * @param  {Object} obj [description]
 * @param  {String} key 属性名
 * @param  {Any} val 源属性值
 * @param  {Dep} dep 订阅者维护对象
 * @return {[type]}     [description]
 */
function defineReactive ( obj, key, val, dep ) {

  // const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // 保存对象原有的访问器属性
  const getter = property && property.get;
  const setter = property && property.set;

  // 暂时不需要监视子属性
  // let childOb = observe(val, dep); // 如果子属性也是对象，也为其添加Observer
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      const value = getter ? getter.call(obj) : val;
      return value;
    },
    set: function (newVal) {
      // debugger
      const value = getter ? getter.call(obj) : val;

      if ( newVal === value ) {
        return
      }

      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      // childOb = observe(newVal, dep);// 如果子属性也是对象
      // 提醒订阅者数据更新
      dep.notify();
    }
  })
}
