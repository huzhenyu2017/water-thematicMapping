<template>

  <div>
    <Button id="t" class="upload-but" shape="circle" type="primary" @click="showSwitch">
      <Icon class="icon" type="upload" size=20></Icon>
      上传数据
    </Button>
    <!-- <Button @click="showSwitch">upload</Button> -->

    头大...
  <Modal class="modal" v-model="show" title="上传数据" width="70%" height="100%"
  :scrollable="true" >
    <Steps :current='current' size="small">
       <Step title="选择数据" ></Step>
       <Step title="选择字段" ></Step>
    </Steps>
    <div class="stepCont step1" v-show="showStep1">
      <upload @uploadata="addata" @getJSON="getJSON"/>
      <Button class="next" @click="nextStep" >下一步</Button>
    </div>
    <div class="stepCont step2" v-show="showStep2">
      <div class="selectItem">
        <span>名    称：</span>
        <Select class="selector" v-model="selected_attr" @on-change="selectChange_attr">
          <Option class="selectOption" v-for="field in thead" :value="field"></Option>
        </Select>
      </div>
      <div class="selectItem" >
        <span>X坐标：</span>
        <Select class="selector" v-model="selected_X" @on-change="selectChange_X">
          <Option class="selectOption" v-for="field in thead" :value="field"></Option>
        </Select>
      </div>
      <div class="selectItem">
        <span>Y坐标：</span>
        <Select class="selector" v-model="selected_Y" @on-change="selectChange_Y">
          <Option class="selectOption" v-for="field in thead" :value="field"></Option>
        </Select>
      </div>

      <Button @click="reurnData">上一步</Button>
      <Button @click="clean">清空</Button>

      <Button @click="finish">确定</Button>

    </div>
    <div class="previewCont">
      <table class="tPreview">
        <thead>
          <tr>
            <th>#</th>
            <th v-for="i in thead">
              {{i}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(i,index) in tbody">
            <th scope="row">{{index}}</th>
            <td v-for="j in thead">{{i[j]}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div slot="footer"></div>
  </Modal>
</div>
</template>

<script>
import upload from './Upload';

export default {
  components: {upload},

  data () {
    return {
        show: false,
        current: 0,
        showStep1: true,
        showStep2: false,
        thead: [],
        tbody: [],
        selected_attr: '',
        selected_X: '',
        selected_Y: ''
    }
  },
  watch:{
    current: function(cut){
      switch(cut) {
        case 0 :
        this.showStep1 = true;
        this.showStep2 = false;
        break;
        case 1:
        this.showStep1 = false;
        this.showStep2 = true;
        break;

      }
    }
  },

  methods: {
    addata (data) {
      // this.datalist.push(data);
      // console.log(this.datalist);
    },

    showSwitch () {
      this.show = !this.show;
    },
    nextStep () {
      this.current = this.current===1? 1 :this.current+1;
    },
    reurnData () {
      this.current = this.current===0? 0 :this.current-1;
    },
    finish () {

    },
    clean () {
      this.selected_attr = '';
      this.selected_X = '';
      this.selected_Y = '';
    },
    selectChange_attr (val) {
      return val;
    },
    selectChange_X (val) {
      return val;
    },
    selectChange_Y (val) {
      return val;
    },

    getJSON (json) {
      if(json && json.length>0) {
        var tableHead = [];
        for (let item in json[0]) {
          tableHead.push(item);
        }
        this.thead = tableHead;
        this.tbody = json;
        // console.log(this.thead);
        // console.log(this.tbody);

      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .stepCont {
    height: 30%
  }
  .previewCont {
    height: 70;
    background-color: #ccc
  }
  .step1 {
    display: flex;
    flex-direction: row;

  }
  .next {
    margin-left: 50%;
    /* float:right; */
  }
  .tPreview{
    /* overflow: auto; */

  }
  .selector {
    width: 20%;
  }
  .modal {

  }
</style>
