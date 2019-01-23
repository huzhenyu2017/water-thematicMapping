<template>
  <div class="backgd">
    <div  class="cont1-title">
      <div style="display:flex; align-items:center;margin-left:15px;">
        <Icon type="connection-bars" size=28></Icon>
        <p class="template-title" >选择数据</p>
      </div>
      <HR width="100%" color=#f2f2f2 margin-left=20px></HR>
    </div>
    <div class="cont1">
      <div class="cont2-default">
            <Card class="data-card" >
              <div style="display:flex;flex-direction:row;align-items:center;align-items:center">
                <div class="num"><span>1</span></div>
                <p class="title">默认数据</p>
              </div>
              <CheckboxGroup class="data-list" v-model="checkgp" @on-change="checking" v-for="(item, index) in datalist" :key="index"  >
                <Card class="dataitem-card">
                  <Checkbox class="data-item" :label="item.name" size="large" >
                    <span class="dataname">{{item.name}}</span>
                  </Checkbox>
                </Card>
              </CheckboxGroup>
            </Card>
      </div>
     <div class="cont-addata">
       <Card class="data-card">
         <div style="display:flex;flex-direction:row;align-items:center;align-items:center">
           <div style="display:flex;flex-direction:row;align-items:center;align-items:center">
             <div class="num"><span>2</span></div>
             <p class="title">其他数据</p>
           </div>
       </div>
         <CheckboxGroup  class="data-list" v-model="checkgp" @on-change="checking" v-for="(item, index) in lastdatalist" :key="index"  >
           <Card class="dataitem-card">
             <Checkbox class="data-item" :label="item.name" size="large" >
               <span class="dataname">{{item.name}}</span>
             </Checkbox>
           </Card>
         </CheckboxGroup>
         </Card>
     </div>
     <div class="but-cont">
         <Button  type="primary" @click="tomapping" class="mapping-but" >
           去制图
         </Button>
         <Button  type="primary" @click="returnTemplate" class="return-but">
           返回制图模板
         </Button>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data () {
    return {
      lastdatalist: [],//其他数据列表(按照模板类别划分)
      datalist: [], //默认数据列表(按照模板类别划分)
      //选中的数据
      checkgp: [],
      //上一步选中数据
      lastcheck: [],
      //默认模板名称
      templatename: '',
      //修改字段弹框显示控制
      isShow: false,
      //设置默认模板数
      defaultNum: 3,
      selectedThead: [],
      selectedTbody: [],

      selectedFields: {x: null, y: null, attr: null},
      dataname: '',
      namelist: []
    }
  },
  created () {
    switch (this.$route.query.type){
      case '1':
        this.__global__.type = 'template1';
        this.templatename = '自然类';
        this.__global__.allData.forEach(item => {
          if(item.template.indexOf("template1") != -1){
            this.datalist.push(item);
            // debugger
            this.namelist.push({'name':item.name,'num':1});
          }else {
            this.lastdatalist.push(item);
          }
        });
        //将模板默认数据加入mappingData(先确认是否包含默认数据)
        if(this.datalist.findIndex(item => item.name === "河流") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "河流")]);
        }
        if(this.datalist.findIndex(item => item.name === "湖泊") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "湖泊")]);
        }
        break;
      case '2':
        this.__global__.type = 'template2';
        this.templatename = '水利工程模板';
        this.__global__.allData.forEach(item => {
          if(item.template.indexOf("template2") != -1){
            this.datalist.push(item);
            this.namelist.push({'name':item.name, 'num':1});
          }else {
            this.lastdatalist.push(item);
          }
        });
        //将模板默认数据加入mappingData(先确认是否包含默认数据)
        if(this.datalist.findIndex(item => item.name === "水库") > -1){
           this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "水库")]);
        }

        if(this.datalist.findIndex(item => item.name === "泵站") > -1){
           this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "泵站")]);
        }

        if(this.datalist.findIndex(item => item.name === "水闸") > -1){
           this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "水闸")]);
        }
        break;
      case '3':
        this.__global__.type = 'template3';
        this.templatename = '防汛工程模板';
        //模板默认选中的数据
        // this.checkgp.push("堤防工程");
        // this.checkgp.push("水文测站");
        // this.checkgp.push("围垦");
        this.__global__.allData.forEach(item => {
          if(item.template.indexOf("template3") != -1){
            this.datalist.push(item);
            this.namelist.push({'name':item.name, 'num':1});
          }else {
            this.lastdatalist.push(item);
          }
        });
        //将模板默认数据加入mappingData(先确认是否包含默认数据)
        if(this.datalist.findIndex(item => item.name === "堤防工程") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "堤防工程")]); 
        }

        if(this.datalist.findIndex(item => item.name === "测站") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "测站")]); 
        }

        if(this.datalist.findIndex(item => item.name === "泵站") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "泵站")]); 
        }

        if(this.datalist.findIndex(item => item.name === "山塘") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "山塘")]); 
        }

        if(this.datalist.findIndex(item => item.name === "防汛物资仓库") > -1){
          this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === "防汛物资仓库")]);
        }
        break;
     }
  },

  beforeMount () {
      var _this = this;
      this.__global__.mappingData.forEach(
        item => {
          _this.checkgp.push(item.name);
        });
        this.lastcheck = this.checkgp;
  },
  methods: {
    checking (list){
      debugger;
      if (list.length > 5) {
        alert("最多选5个数据！");
        list.pop();
      }else {
        let last = new Set(this.lastcheck);
        let now = new Set(list);
        //选中数据
        if (this.lastcheck.length < list.length) {
          //新选中的数据
          let diff = new Set([...now].filter(x => !last.has(x)));
          let addchk = Array.from(diff);
          if(this.__global__.mappingData.findIndex(item => item.name === addchk[0]) === -1) {
            if(this.datalist.findIndex(item => item.name === addchk[0]) != -1){
              //选择默认数据
              this.__global__.mappingData.push(this.datalist[this.datalist.findIndex(item => item.name === addchk[0])]);
            }else{
              //选择了其他数据
              this.__global__.mappingData.push(this.lastdatalist[this.lastdatalist.findIndex(item => item.name === addchk[0])]);
            }
          // console.log(this.__global__.mappingData);
          // console.log(list);
          }
        }
        //取消选中数据
        else {
          let diff = new Set([...last].filter(x => !now.has(x)));
          let unchk = Array.from(diff);
          this.__global__.mappingData.splice(this.__global__.mappingData.findIndex(item => item.name === unchk[0]), 1);
        }
        this.lastcheck = list;
      }
    },
    addata (val) {
      var updata = val;
      var nameIndex = this.namelist.findIndex(item => item.name === val.name);
      if(nameIndex === -1){
        this.namelist.push({'name':val.name,'num':1});

      }
      if(nameIndex>0) {
        //debugger
        updata.name = updata.name+'('+this.namelist[nameIndex].num.toString()+')';
        this.namelist[nameIndex].num++;

      }
      this.datalist.push(updata);
      this.__global__.allData.push(updata);

    },

    tomapping () {
      if (this.__global__.mappingData.length > 0) {
        //进入新建模板=>this.__global__.templateId = null不变
        // this.__global__.templateUser = 'admin';//这里要动态获取 this.__global__.templateUser = this.__global__.userName;
        this.$router.push({path: '/map'}); 

      }else {
        alert("请选择制图数据！");
      }
    },
    returnTemplate () {
      // router.push方法可以导航到不同的URL(会向 history 栈添加一个新的记录),等价于HTML中的<router-link :to="...">
      // router.replace方法类似push,只是不会向history栈添加新纪录,而是直接替换当前
      // router.go(n)方法意思是在 history 记录中向前或者后退多少步
      this.$router.push({path: '/'});
    }


  }
}
</script>
<style >
  .backgd {
    flex: 1;
    background-color: #fff;

    overflow-y: auto;
  }
  .cont1 {
    display: flex;
    flex: 1;

    flex-direction: row;
    justify-content: center;
  }
  .cont1-title {
    /* background-color: #ecf2f9; */
  }



  .template-title {
    font-size: 26px;
    padding: 2px;
    margin-left: 20px;
    /* margin-left: 20px;
    margin-bottom: 20px; */
    color: rgb(23,30,58);
    font-weight: bold;
  }
  /* .data-list-cont {
    width: 100%;
     height: 400px;
  } */

  .data-list {
    display: flex;
    flex-direction: column;

  }
  .data-item {
    padding: 6px;
    /* background-color: #f2f2f2; */
  }
  .but-cont .mapping-but {
    height: 64px;
    width: 280px;
    margin: 10px;
    font-size: 15px;
    background-color: #0473C2;
    box-shadow:2px 2px 3px #aaaaaa;
  }
  .but-cont .return-but {
    background-color: #fff;
    color: #0473C2;
    box-shadow:2px 2px 3px #aaaaaa;
    height: 64px;
    width: 280px;
    margin: 10px;
    font-size: 15px;
  }
  .but-cont {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
  }
  .title {
    font-size: 23px;
    color: #584F62;

    /* color: rgb(35,53,77); */
    font-weight: bold;
    /* background-color: #ffebcc; */
  }
  .listbut-cont {
    display: flex;
    flex-direction: row;
  }

  .datapic {
    width: 20px;
    margin-left: 8px;
    float: right;
  }


 .icon {
   margin-right: 5px;
 }
 .datatype {
   font-size: 10px;
   margin-left: 5px;

   color: #ccc;
 }
 .dataname {
   margin-left: 5px;
   font-size: 16px;
   color: #000;
 }

 #t:hover {
   background-color: #004080;
 }
 #info {
   z-index: 10;
 }
 .dataitem-card {
   margin-bottom: 10px;
   box-shadow:2px 2px 3px #aaaaaa;

 }
.cont2-default .data-card {
  background-color: #e4e4e4;
  /* box-shadow:2px 2px 3px #aaaaaa; */
}

.cont-addata .data-card {
  background-color: #e4e4e4;
  /* box-shadow:2px 2px 3px #aaaaaa; */
}

.cont2-default, .cont-addata {
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 100%;
}


.cont2-default {
  /* align-items: center; */
  justify-content: center;

}
.cont2-default {
  margin-right: 50px;
  /* align-items: center; */
}
.cont-addata {
  margin-left: 50px;
}

.num {
  border-radius: 50%;
  height: 25px;
  width: 25px;
  background-color: #0473C2;
  color: #fff;
  line-height: 25px;
  text-align: center;
  margin-right: 8px;
  font-size: 20px;
}
</style>
