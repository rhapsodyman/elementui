<template>
  <el-card v-show="filtersToShow.length != 0" class="box-card">
    <div slot="header" class="clearfix">
      <span>{{sectionLabel}}</span>
    </div>
    <app-filter
      v-for="filter in filtersToShow"
      :filter="filter"
      :key="filter.bindName"
      :index="index"
    ></app-filter>
  </el-card>
</template>

<script>
import Filter from "./Filter.vue";
export default {
  props: ["sectionLabel", "filters", "index"],
  components: {
    "app-filter": Filter
  },
  data() {
    return {};
  },

  computed: {
    filtersToShow() {
      var toShow = [];

      if (this.index == undefined) {
        toShow = this.filters;
        return toShow;
      }

      var selected_cat = this.$store.getters.getSelectedSecType(this.index);

      for (let index = 0; index < this.filters.length; index++) {
        const filter = this.filters[index];

        var visible = true;
        if (
          filter.supportedFor != undefined &&
          filter.supportedFor.indexOf(selected_cat) == -1
        )
          visible = false;
        if (visible) toShow.push(filter);
      }
      return toShow;
    }
  }
};
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
