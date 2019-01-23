<template>
    <div class="searchTem">
      <Tag v-if="tagShow" closable @on-close="handleClose">{{searchTag}}</Tag>

      <i-input class="searchTemIpt" placeholder="输入图名" v-model="searchName" @on-enter="search"></i-input>
      <Button class="searchbtn" @click="search">搜索</Button>
      <!-- <Button class="allbtn" @click="search">返回全部</Button> -->

    </div>
</template>

<script>
export default {
  //allist为全部专题图
  props: ['allist'],

  data () {
    return {
      searchName: '',
      //搜索结果
      searchResult: [],
      // inList: [],
      tagShow: false,
      searchTag: ''
    }
  },
  methods: {
    search () {
      this.searchTag = this.searchName;
      this.tagShow = true;
      this.allist.forEach(item => {
        if(item.NAME.search(this.searchName)!== -1) {
          this.searchResult.push(item);
        }
      });
      console.log(this.searchResult);
      this.$emit("searchResult",this.searchResult);
      this.searchResult = [];
    },
    handleClose () {
      this.tagShow = false;
      this.searchName = '';
      this.$emit("searchResult",this.allist);

    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.searchTemIpt {
  border-radius: 10px;
  width: 200px;
}

  .searchTem {
    margin-right: 10px;
    display: flex;
    flex-direction: row;
  }

</style>
