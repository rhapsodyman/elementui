<template>
  <el-card shadow="always" lass="box-card">
    <el-row>
      <el-col :xs="11" :sm="11">
        <el-checkbox v-model="checkBoxValue">{{filter.filterLabel}}</el-checkbox>
      </el-col>

      <el-col :xs="11" :sm="11">
        <el-select
          v-if="filter.type == 'MultiSelect'"
          v-model="selected"
          multiple
          placeholder="Select"
          size="mini"
        >
          <el-option v-for="item in filter.options" :key="item" :label="item" :value="item"></el-option>
        </el-select>

        <el-select
          v-if="filter.type == 'Select'"
          v-model="selected"
          placeholder="Select"
          size="mini"
        >
          <el-option v-for="item in filter.options" :key="item" :label="item" :value="item"></el-option>
        </el-select>

        <el-switch
          v-if="filter.type == 'Switch'"
          v-model="selected"
          :active-text="`${stateOfSwitch.toString()}`"
        ></el-switch>

        <el-input
          v-if="filter.type == 'Input'"
          size="mini"
          placeholder="Please input"
          v-model="selected"
        ></el-input>


        <el-input
          v-if="filter.type == 'Numeric'"
          size="mini"
          placeholder="Please input number"
          v-model="selected"
        ></el-input>
        <!-- <el-input-number
          v-if="filter.type == 'Numeric'"
          size="mini"
          v-model="selected"
        ></el-input-number> -->

        <el-date-picker
          v-if="filter.type == 'Date'"
          v-model="selected"
          size="mini"
          type="date"
          placeholder="Pick a day"
          value-format="yyyy/MM/dd"
          format="yyyy/MM/dd"
        ></el-date-picker>
      </el-col>

      <el-col :xs="1" :sm="1">
      <el-tooltip class="item" effect="dark" :content=filter.filterLabel placement="top-start">
        <i class="el-icon-info"></i>
      </el-tooltip>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  props: ["filter", "index"], // index - legId
  data() {
    return { menu: false };
  },

  computed: {
    stateOfSwitch() {
      var f = this.filter.isLegFilter
        ? this.$store.getters.getLegFilterByLabel(
            this.filter.bindName,
            this.index
          )
        : this.$store.getters.getCommonFilterByLabel(this.filter.bindName);
      return f == undefined ? false : f.value == "TRUE";
    },

    checkBoxValue: {
      get() {
        // console.log('inside checkBox GET ' + this.filter.bindName)
        var f = this.filter.isLegFilter
          ? this.$store.getters.getLegFilterByLabel(
              this.filter.bindName,
              this.index
            )
          : this.$store.getters.getCommonFilterByLabel(this.filter.bindName);
        if (f != undefined && f.enabled == true) {
          return true;
        } else return false;
      },

      set(value) {
        console.log("inside checkBox set");
        var f = this.filter.isLegFilter
          ? this.$store.getters.getLegFilterByLabel(
              this.filter.bindName,
              this.index
            )
          : this.$store.getters.getLegFilterByLabel(
              this.filter.bindName,
              this.index
            );
        if (value == false) {
          this.filter.isLegFilter
            ? this.$store.dispatch("setLegFilterEnabled", {
                filterLabel: this.filter.bindName,
                enabled: false,
                legId: this.index
              })
            : this.$store.dispatch("setCommonFilterEnabled", {
                filterLabel: this.filter.bindName,
                enabled: false
              });
        } else if (value == true) {
          if (f != undefined) {
            // need to enabled previously disabled filer
            this.filter.isLegFilter
              ? this.$store.dispatch("setLegFilterEnabled", {
                  filterLabel: this.filter.bindName,
                  enabled: true,
                  legId: this.index
                })
              : this.$store.dispatch("setCommonFilterEnabled", {
                  filterLabel: this.filter.bindName,
                  enabled: true
                });
          } else {
            var filter = {
              label: this.filter.bindName,
              enabled: true
            };

            switch (this.filter.type) {
              case "MultiSelect":
              case "Select":
                filter.value = [];
                break;
              case "Switch":
                filter.value = "FALSE";
                break;
              default: {
                filter.value = "";
              }
            }
            this.filter.isLegFilter
              ? this.$store.dispatch("setLegFilter", {
                  filter: filter,
                  legId: this.index
                })
              : this.$store.dispatch("setCommonFilter", filter);
          }
        }
      }
    },

    selected: {
      get() {
        console.log("inside get " + this.filter.bindName);
        var f = this.filter.isLegFilter
          ? this.$store.getters.getLegFilterByLabel(
              this.filter.bindName,
              this.index
            )
          : this.$store.getters.getCommonFilterByLabel(this.filter.bindName);

        switch (this.filter.type) {
          case "MultiSelect":
            if (f == undefined) return [];
          case "Select":
            if (f == undefined) return undefined;
            else return f.value;
          case "Switch":
            return f == undefined ? false : f.value == "TRUE";
          default:
            return f == undefined ? "" : f.value + ""; // can also set a default value here (replace '' with a value)
        }
      },

      set(value) {
        var filter = {
          label: this.filter.bindName,
          enabled: true
        };

        console.log("inside set - value is [" + value + "]");
        // here needs to be logic for calling store if specific value is selected

        if (this.filter.bindName === "SECURITY_TYPE" && !Array.isArray(value)) {
          console.log("Setting type to value " + value);
          this.$store.dispatch("setSelectedSecType", {
            type: value,
            legId: this.index
          });
        }

        switch (this.filter.type) {
          case "MultiSelect":
            filter.value = value;
            break;
          case "Switch":
            filter.value = value.toString().toUpperCase();
            break;
          default:
            filter.value = value;
        }

          console.log("will be value " + value);
          this.filter.isLegFilter
            ? this.$store.dispatch("setLegFilter", {
                filter: filter,
                legId: this.index
              })
            : this.$store.dispatch("setCommonFilter", { filter: filter });
        }
      }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-checkbox {
  margin-right: 5px;
}

.el-card__body {
  padding-top: 1px;
  padding-bottom: 3px;

}

.el-card {
  margin-top: 5px;
  margin-bottom: 5px;
  box-shadow: 5px 2px 5px rgba(0,0,0,0.17), 6px 6px 6px rgba(0,0,0,0.21)   !important; 
  border: 2px solid rgba(0,0,0,0.09)
}

.el-card__header {
  font-weight: 600;
  padding-top: 1px;
  padding-bottom: 1px;
}

.el-checkbox__label {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-line;
}

.el-tooltip {
  margin-left: 10px;
}

 #filter-group {
  margin-left: 5vw;
  margin-right: 5vw;
  margin-bottom: 30px;
  margin-top: 20px;
  
} 

</style>
