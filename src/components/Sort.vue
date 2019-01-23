<template>
  <div>
    <Dropdown class="filterItem" trigger="click" style="margin-left: 20px" @on-click="sortFilter">
        <a href="javascript:void(0)" class="filterName" @click="sortClick">
            {{sortItem}}
            <Icon type="arrow-down-b" v-if="downShow"></Icon>
            <Icon type="arrow-up-b" v-if="upShow"></Icon>
        </a>
        <Dropdown-menu slot="list">
            <Dropdown-item class="filterItem" name="时间倒序">时间倒序</Dropdown-item>
            <Dropdown-item class="filterItem" name="时间顺序">时间顺序</Dropdown-item>
            <Dropdown-item class="filterItem" name="图名">图名</Dropdown-item>
        </Dropdown-menu>
    </Dropdown>
  </div>

</template>

<script>
export default {
  props: ['list','allist'],
  data() {
    return {
      sortItem: '时间倒序',
      downShow: true,
      upShow: false
    }
  },
  methods: {
    sortFilter (key) {
      this.sortItem = key;
      this.sortClick ()
      switch (key) {
        case "图名":
          this.list.sort(this.compare("NAME"));
          break;
        case "时间顺序":
          this.list.sort(this.compare("DATE"));
          break;
        case "时间倒序":
          this.list.sort(this.compare("DATE")).reverse();
          break;
      }
      this.$emit("sortResult",this.list);
    },
    compare (propertyName) {
      return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 < value1) {
          return 1;
        } else if (value2 > value1) {
          return -1;
        } else {
          return 0;
        }
      }
    },
    sortClick () {
      this.downShow = !this.downShow;
      this.upShow = !this.upShow;
    }

  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.filterName {
  color: #5e5e5e;
  font-size: 16px;

}
.filterItem {
  size: 22px;
  width: 100px;

}
</style>
