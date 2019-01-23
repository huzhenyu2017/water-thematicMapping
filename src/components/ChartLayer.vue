<template lang="html">
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'chartlayer',
  props: ['params'],
  data() {
    return {
      _olLayer: null, // 用来在内部保存layer的引用
    }
  },
  created() {

    /**
     * openlayers图层对象
     */
    var iconFeature = new ol.Feature({
      geometry: new ol.geom.Point([120, 29.4]),
      name: 'Null Island',
      population: 4000,
      rainfall: 500
    });

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'https://openlayers.org/en/v4.6.4/examples/data/icon.png'
      }))
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
      features: [iconFeature]
    });

    this._olLayer = new ol.layer.Vector({
      source: vectorSource
    });


    var params = this.params;

    // 图层对象都要定义一个update函数，用于实时更新制图参数
    this._olLayer.update = function() {
      console.log( params );
    }

    // 将制图参数和图层对象绑定
    this.params.__myob__.dep.addSub( this._olLayer );

    // 将当前图层添加到ol.Map中
    this.$nextTick(t => this.$parent.$emit("addtile", this._olLayer));

  },
  mounted() {

  }
}
</script>

<style lang="css">
</style>
