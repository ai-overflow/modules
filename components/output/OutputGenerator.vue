<template>
  <div>
    <div v-if="['list'].includes(output.type)">
      <div v-if="output.format">
        <div v-for="value in parseListLabel" :key="value[1]" class="ma-2">
          <v-row>
            <v-col class="pb-0"> {{ value[1] }} </v-col>
            <v-col class="text-right pb-0">
              {{ Math.round(value[0] * 100) / 100 }}%
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-progress-linear
                :value="value[0]"
                color="primary"
              ></v-progress-linear>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
    <div v-if="['html'].includes(output.type)">
      <div v-if="output.format">
        <div v-for="value in parseHTMLType" :key="value" class="ma-2">
          <div v-html="value"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseParams } from "@shared/helper/paramParser";
import { zip } from "@shared/helper/utility";

export default {
  props: {
    connectionData: Object,
    output: Object,
    inputVars: Object,
  },
  data() {
    return {};
  },
  created() {
    //if(this.output)
    //  console.log(parseParams(this.output.format.labelValue, this.inputVars, this.connectionData));
  },
  methods: {
    parseArrays(value) {
      let val = parseParams(value, this.inputVars, this.connectionData);

      return Array.isArray(val) ? val : [val];
    },
  },
  computed: {
    parseListLabel: function () {
      return zip([
        this.parseArrays(this.output.format.labelValue),
        this.parseArrays(this.output.format.labelName),
      ]);
    },
    parseHTMLType: function () {
      return this.parseArrays(this.output.format.labelValue);
    },
  },
};
</script>

<style>
</style>