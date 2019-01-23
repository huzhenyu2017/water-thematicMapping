<template lang="html">
  <div class="maplegend">
    <div v-for="param in paramsLocal" class="layeritem">
      <!-- {{param.layer}} -->
      <div v-if="param.stylePic.indexOf( 'png' ) !== -1" class="styleicon" :style="{ background: `url( ${param.stylePic} ) no-repeat center center`,'background-size': 'cover' }"></div>
      <div v-else class="styleicon" :style="{ background: `${param.stylePic}`, borderRadius: '8px' }"></div>
      <span class="legendtext">{{param.name}}</span>
      <i-switch v-model="param.visible" style="margin: auto 0">
         <span type="android-done" slot="open"></span>
         <span type="android-close" slot="close"></span>
       </i-switch>
    </div>
  </div>
</template>

<script>
export default {
  name: 'maplegend',
  props: ['params'],
  computed: {
    paramsLocal() {
      return  this.params.reverse();
      // 保证图层顺序与图例顺序一致，最上面的图层，图例也在最上面
    }
  }
}
</script>

<style lang="css">
  .maplegend {
    position: absolute;
    right: 15px;
    bottom: 15px;
    width: 18%;
    background-color: rgba( 50, 49, 49, 0.43 );
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    border-radius: 10px;
  }
  .layeritem {
    overflow: hidden;
    width: 100%;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
  }
  .styleicon {
    width: 40px;
    height: 40px;
    float: left;
    /* transform: scale( 0.5 ); */

  }
  .legendtext {
    font-size: 17px;
    color: #fff;
    margin: auto;
  }
</style>
