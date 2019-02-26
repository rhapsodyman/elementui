<template>
<div id="filter-group">
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>{{groupLabel}}</span>
    </div>
    <el-row type="flex" justify="space-around">
      <el-col :span="11">
        <app-filter-section
          v-for="section in leftSections"
          :sectionLabel="section.categoryName"
          :filters="section.filters"
          :key="section.categoryName"
          :index="index"
        ></app-filter-section>
      </el-col>

      <el-col :span="11">
        <app-filter-section
          v-for="section in rightSections"
          :sectionLabel="section.categoryName"
          :filters="section.filters"
          :key="section.categoryName"
          :index="index"
        ></app-filter-section>
      </el-col>
    </el-row>
  </el-card>
</div>
</template>

<script>
import FilterSection from "./FilterSection.vue";
// import filters from '../../data/filters';
export default {
  props: ["groupLabel", "sections", "index"],
  components: {
    "app-filter-section": FilterSection
  },
  data() {
    return {
      leftSections: [],
      rightSections: []
    };
  },

  mounted() {
    // console.log('inside filter group index ' + this.index)

    var left = [];
    var right = [];

    for (var i = 0; i < this.sections.length; i++) {
      if (i % 2 == 0) left.push(this.sections[i]);
      else right.push(this.sections[i]);
    }

    this.leftSections = left;
    this.rightSections = right;
  }

  //  computed: {

  //      filtersToShow () {

  //        var toShow = []
  //        var selected_cat = this.$store.getters.getSelectedSecType
  //        // console.log('Selected cat is ' + selected_cat)

  //        for (let index = 0; index < this.filters.length; index++) {
  //          const filter = this.filters[index];
  //          //console.log(filter.supportedFor)

  //           var visible = true

  //           if (filter.supportedFor != undefined){
  //                visible = (filter.supportedFor.indexOf(selected_cat) != -1) ? true : false
  //           }
  //           if (visible) toShow.push(filter)
  //         }
  //         return toShow
  //       }
  // }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
