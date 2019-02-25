<template>
  <div>
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      background-color="#409EFF"
      text-color="#fff"
      active-text-color="black"
    >
      <el-menu-item index="1" @click.native.stop="openImportDialog">Import</el-menu-item>
      <el-menu-item index="2" @click.native.stop="openExportDialog">Export</el-menu-item>
    </el-menu>

    <el-dialog title="Exported Filters" :visible.sync="saveDialog" width="30%">
      <textarea rows="10" ref="exportedFilters" v-model="exportedFilters"></textarea>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click.native.stop="copyToClipboard">Copy</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Import Filters" :visible.sync="importDialog" width="30%">
      <el-alert
        v-for="(alert, index) in filterAlerts"
        :title="alert"
        :key="index"
        type="error"
        show-icon
      ></el-alert>

      <textarea rows="10" ref="pastedFilters" placeholder="Paste filters here"></textarea>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click.native.stop="importFilters">Import</el-button>
      </span>
    </el-dialog>

    <filter-group
      v-for="group in allFilters.legs"
      :groupLabel="group.name"
      :sections="group.sections"
      :key="group.name"
      :index="group.index"
    ></filter-group>

    <filter-group
      v-for="group in allFilters.commonParams"
      :groupLabel="group.name"
      :sections="group.sections"
      :key="group.name"
      :index="group.index"
    ></filter-group>

    <div id="bottomPanel">
      <el-col>
        <el-card>
          <el-row type="flex" justify="space-around">
            <el-button type="primary" @click.native="getResults">Search</el-button>
            <el-button type="primary" @click.native="tabsVisibility = !tabsVisibility">Toggle</el-button>
            <el-button type="primary" @click.native="clearAllFilters">Reset Filters</el-button>
            <el-button type="primary" @click.native="addNewLeg">Add leg</el-button>
          </el-row>

          <div v-show="tabsVisibility == true">
            <el-table :data="apiResults" v-loading="callingAPI" style="width: 100%">
              <el-table-column prop="symbol" label="Symbol"></el-table-column>
              <el-table-column prop="description" label="Description"></el-table-column>
              <el-table-column prop="price" label="Price"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "../data/config";
import impFilters from "../data/filters";
import FilterGroup from "./components/FilterGroup.vue";
import filters from "../data/filters";

export default {
  components: {
    "filter-group": FilterGroup
  },

  data() {
    return {
      sections: [],
      allFilters: {},
      saveDialog: false,
      importDialog: false,
      exportedFilters: "",
      tabsVisibility: false,
      displayFilterWarning: false,
      warningMessage: "",
      filterAlerts: [],
      callingAPI: false,
      apiResults: []
    };
  },

  methods: {
    getDefaultLegParams() {
      return {
        filters: [
          {
            label: "SECURITY_TYPE",
            value: "STOCK",
            enabled: true
          }
        ],
        selectedSecType: "STOCK"
      };
    },

    openExportDialog() {
      this.showMultileg = false;
      this.calculateAndShowExportFiltersNew();
    },

    // calculateExportFilters(number) {
    //   var finalString = "";
    //   var filters = this.$store.getters.getCommonFilters;
    //   for (var i = 0; i < filters.length; i++) {
    //     if (filters[i].enabled) {
    //       var value = this.getFilterValue(filters[i].value, number);
    //       finalString += filters[i].label + "=" + value + "\n";
    //     }
    //   }
    //   return finalString;
    // },

    calculateExportFiltersNew() {
      var finalString = "";

      // calculate leg filters
      var legs = this.$store.getters.getAllLegFilters;
      var firstLeg = legs[0];

      for (var i = 0; i < firstLeg.filters.length; i++) {
        // each filter from the first leg
        var currentFilter = firstLeg.filters[i];
        var currentFilterStr = "";
        if (currentFilter.enabled) {
          currentFilterStr += currentFilter.label + "=" + currentFilter.value;

          for (var j = 1; j < legs.length; j++) {
            // each other leg
            for (var k = 0; k < legs[j].filters.length; k++) {
              // each filter
              var otherFilter = legs[j].filters[k];
              if (
                otherFilter.label == currentFilter.label &&
                otherFilter.enabled
              ) {
                currentFilterStr += "|" + otherFilter.value;
              }
            }
          }
          currentFilterStr += "\n";
          console.log("Current = " + currentFilterStr);
        }
        finalString += currentFilterStr;
      }

      // calculate common filters
      var commonFilters = this.$store.getters.getCommonFilters;

      for (var i = 0; i < commonFilters.length; i++) {
        var filter = commonFilters[i];
        if (filter.enabled) {
          switch (filter.label) {
            case "SPECIAL_CASE":
              finalString +=
                filter.label +
                "=" +
                this.replicateValue(filter.value, this.allFilters.legs.length);
              break;
            default:
              finalString += filter.label + "=" + filter.value + "\n";
          }
        }
      }

      return finalString;
    },

    calculateAndShowExportFiltersNew() {
      this.exportedFilters = this.calculateExportFiltersNew();
      this.saveDialog = true;
    },

    replicateValue(value, times) {
      var arr = [];
      for (var i = 0; i < times; i++) {
        arr.push(value);
      }
      return arr.join("|");
    },

    openImportDialog() {
      this.importDialog = true;
      this.displayFilterWarning = false;
      this.filterAlerts = [];
    },

    importFilters() {
      this.displayFilterWarning = false;
      this.filterAlerts = [];
      var source = this.$refs.pastedFilters.value.trim();
      var legs = [];
      var commonFilters = [];
      var noWarnings = true;
      var filtersMap = this.getFiltersAsMap();
      console.log(filtersMap)

      var lines = source.split(/\r?\n/);

      // first get the number of legs
      var nLegs = 1;
      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].trim().split("=");
        var values = parts[1].split("|");
        if (values.length > 1) nLegs = values.length;
      }

      for (let i = 0; i < nLegs; i++) {
        legs.push({ filters: [] });
      }

      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].trim().split("=");
        var label = parts[0];
        var value = parts[1];

        var foundFilter = filtersMap[label];

        if (foundFilter != undefined) {
          if (foundFilter.isLegFilter) {
            var values = value.split("|"); // try to split the value

            for (let i = 0; i < values.length; i++) {
              value = values[i];
              if (value == "n/a") continue;
              var newFilter = { label: label, enabled: true };

              if (label == "SECURITY_TYPE") legs[i].selectedSecType = value;

              if (foundFilter.type == "MultiSelect") value = value.split(",");
              var warnings = this.getFilterWarnings(foundFilter, value);
              if (warnings.length > 0) {
                Array.prototype.push.apply(this.filterAlerts, warnings);
              } else {
                newFilter.value = value;
                legs[i].filters.push(newFilter);
              }
            }
          } else {
            // common filter
            var newFilter = { label: label, enabled: true };
            if (foundFilter.type == "MultiSelect") value = value.split(",");
            var warnings = this.getFilterWarnings(foundFilter, value);
            if (warnings.length > 0) {
              Array.prototype.push.apply(this.filterAlerts, warnings);
            } else {
              newFilter.value = value;
              commonFilters.push(newFilter);
            }
          }
        } else {
          this.filterAlerts.push("Unknown filter " + label);
        }
      }

      if (this.filterAlerts.length == 0) {
        // add to store
        this.$store.dispatch("setLegs", legs);
        this.$store.dispatch("setCommonFilters", commonFilters);
        
        var newUILegs = []
          for (let i = 0; i < nLegs; i++) {
            var newLeg = {
              name: "Leg " + (i + 1),
              index: i,
              sections: this.allFilters.legs[0].sections
            };
            newUILegs.push(newLeg);
        }
        this.allFilters.legs = newUILegs // replace UI legs

        this.importDialog = false;
      } else {
        this.displayFilterWarning = true;
      }
    },

    getFilterWarnings(filter, passedValue) {
      var warnings = [];
      if (filter.type == "MultiSelect") {
        for (var i = 0; i < passedValue.length; i++) {
          if (filter.options.indexOf(passedValue[i]) === -1) {
            warnings.push("Option " + passedValue[i] + " is not valid");
          }
        }
      } else if (filter.type == "Select") {
        if (filter.options.indexOf(passedValue) === -1) {
          warnings.push("Option " + passedValue + " is not valid");
        }
      } else if (filter.type == "Switch") {
        if (!(passedValue === "TRUE" || passedValue === "FALSE"))
          warnings.push(
            "Option " + passedValue + " is not valid. Should be TRUE/FALSE"
          );
      }
      return warnings;
    },

    clearAllFilters() {
      var first = this.allFilters.legs[0];
      this.allFilters.legs = [];
      this.allFilters.legs.push(first);
      this.$store.dispatch("setLegs", [this.getDefaultLegParams()]);
      this.$store.dispatch("setCommonFilters", []);
    },

    addNewLeg() {
      var nLeg = {
        name: "Leg " + (this.allFilters.legs.length + 1),
        index: this.allFilters.legs.length,
        sections: this.allFilters.legs[0].sections
      };

      this.$store.dispatch("addNewLeg", this.getDefaultLegParams());
      this.allFilters.legs.push(nLeg);
    },

    getFilterByName(nameToFind) {
      var sections = this.allFilters.legs[0].sections;

      for (var secInd = 0; secInd < sections.length; secInd++) {
        var section = sections[secInd];
        for (var fInd = 0; fInd < section.filters.length; fInd++) {
          if (section.filters[fInd].bindName === nameToFind) {
            return section.filters[fInd];
          }
        }
      }
      return undefined;
    },

    getFiltersAsMap() {
      var filtersMap = {};

      var sections = []
      Array.prototype.push.apply(sections, this.allFilters.legs[0].sections)
      Array.prototype.push.apply(sections, this.allFilters.commonParams[0].sections)

      for (var secInd = 0; secInd < sections.length; secInd++) {
        var section = sections[secInd];
        for (var fInd = 0; fInd < section.filters.length; fInd++) {
          filtersMap[section.filters[fInd].bindName] = section.filters[fInd];
        }
      }
      return filtersMap;
    },

    getResults() {
      var filtersToShow = this.calculateExportFiltersNew();

      this.apiResults = [];
      this.tabsVisibility = true;
      this.callingAPI = true;

      axios
        .get(config.resultsUrl) // or window.filtersUrl
        .then(response => {
          this.callingAPI = false;
          this.apiResults = response.data;
        })
        .catch(error => {
          console.log("Error fetching and parsing data", error);
          this.callingAPI = false;
        });
    },

    copyToClipboard() {
      var input = this.$refs.exportedFilters;
      input.select();
      document.execCommand("copy");
    }
  },

  computed: {},

  mounted() {
    // axios.get(config.filtersUrl) // or window.filtersUrl
    //   .then(response => {
    //       console.info(response.data)
    //       this.sections = response.data
    //   })
    // .catch(error => {
    //   console.log('Error fetching and parsing data', error);
    // });

    // this.$store.commit('setLegs')
    this.$store.dispatch("setLegs", [this.getDefaultLegParams()]);
    // this.sections = impFilters  // leave it for now
    this.allFilters = impFilters;
  }
};
</script>

<style>
textarea {
  width: 100%;
}

#sentFilters {
  margin: 10px auto;
  text-align: center;
  white-space: pre-line;
}

#bottomPanel {
  z-index: 9999;
  width: 90%;
  left: 50%;
  transform: translateX(-50%);
  padding-left: 16px;
  padding-right: 16px;
  position: fixed;
  bottom: 10px;
}
</style>