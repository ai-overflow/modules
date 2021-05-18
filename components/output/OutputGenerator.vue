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
    <div v-if="['iframe'].includes(output.type)">
      <div v-if="output.format">
        <div v-for="value in parseHTMLType" :key="value" class="ma-2">
          <iframe :src="value" :title="value" />
        </div>
      </div>
    </div>
    <div v-if="['image'].includes(output.type)">
      <div v-for="value in parseListLabel" :key="value[1]" class="ma-2">
        <v-row>
          <v-col class="pb-0"> {{ value[1] }} </v-col>
          <v-col class="text-right pb-0">
            <v-img max-height="150" max-width="250" :src="value[0]"></v-img>
          </v-col>
        </v-row>
      </div>
    </div>
    <div v-if="['polygon'].includes(output.type)">
      <div class="ma-2">
        <PolygonMap
          :overlay="getSrcForOrigin"
          :data="parsePolygonLabel"
          :representation="this.output.format.represenation"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { parseParams, parseOrigin } from "@shared/helper/paramParser";
import { zip } from "@shared/helper/utility";
import PolygonMap from "@shared/components/helper/PolygonMap";

export default {
  props: {
    connectionData: Object,
    output: Object,
    inputVars: Object,
  },
  data() {
    return {};
  },
  components: { PolygonMap },
  methods: {
    parseArrays(value) {
      let val = parseParams(value, this.inputVars, this.connectionData);

      return Array.isArray(val) ? val : [val];
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        if (!file) reject("");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
  },
  watch: {},
  computed: {
    parseListLabel: function () {
      return zip([
        this.parseArrays(this.output.format.labelValue),
        this.parseArrays(this.output.format.labelName),
      ]);
    },
    parsePolygonLabel: function () {
      return zip([
        this.parseArrays(this.output.format.labelValue),
        this.parseArrays(this.output.format.labelName),
        this.parseArrays(this.output.format.labelColor),
      ]).map((e) => {
        return { value: e[0], name: e[1], color: e[2] };
      });
    },
    parseHTMLType: function () {
      return this.parseArrays(this.output.format.labelValue);
    },
    getSrcForOrigin: function () {
      return parseOrigin(this.output.format.overlay, this.inputVars);
    },
  },
};
</script>

<style>
</style>