<template>
  <div>
    <div v-if="['list'].includes(output.type)">
      <div v-if="output.format">
        <div
          v-for="value in parseListLabel"
          :key="value[0]"
          class="ma-2"
          @mouseenter="() => setElementActive(value[0])"
          @mouseleave="() => removeElementActive(value[0])"
        >
          <v-row>
            <v-col class="pb-0"> {{ value[0] }} </v-col>
            <v-col
              class="text-right pb-0"
              v-if="output.format.representation !== 'text'"
            >
              {{
                output.format.representation === "percentageBar"
                  ? Math.round(value[1] * 100) / 100
                  : value[1]
              }}
              {{ output.format.representation === "percentageBar" ? "%" : "" }}
            </v-col>
          </v-row>
          <v-row v-if="output.format.representation === 'percentageBar'">
            <v-col>
              <v-progress-linear
                :value="value[1]"
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
          <iframe :src="value" :title="value" frameborder="0" />
        </div>
      </div>
    </div>
    <div v-if="['image'].includes(output.type)">
      <div v-for="value in parseListLabel" :key="value[0]" class="ma-2">
        <!--<v-row>
          <v-col class="pb-0"> {{ value[0] }} </v-col>
          <v-col class="text-right pb-0">
            <v-img max-height="150" max-width="250" :src="value[1]"></v-img>
          </v-col>
        </v-row>-->
        <v-row>
          <v-col>
            <v-carousel hide-delimiters :show-arrows="parseListLabel.length > 1">
              <v-carousel-item v-for="value in parseListLabel" :key="value[0]" :src="value[1]">
                <v-container class="carousel-top-bar pa-1">{{ value[0] }}</v-container>
              </v-carousel-item>
            </v-carousel>
          </v-col>
        </v-row>
      </div>
    </div>
    <div v-if="['polygon'].includes(output.type)">
      <div class="ma-2">
        <PolygonMap
          :overlay="getSrcForOrigin"
          :data="parsePolygonLabel"
          :representation="this.output.format.representation"
          :highlight="highlight"
          :showLabels="this.output.format.showLabels"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { paramParser, parseOrigin } from "@shared/helper/paramParser";
import { zip } from "@shared/helper/utility";
import PolygonMap from "@shared/components/helper/PolygonMap";

export default {
  props: {
    output: Object,
    inputVars: Object,
    outputVars: Object,
    highlight: {
      type: Object,
      required: false,
    },
    value: {},
  },
  data() {
    return {
      outputData: {},
    };
  },
  components: { PolygonMap },
  methods: {
    parseArrays(value) {
      let val = paramParser.parseParams(value);

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
    setElementActive(el) {
      this.$set(this.outputData, el, true);
    },
    removeElementActive(el) {
      this.$delete(this.outputData, el);
    },
  },
  watch: {
    outputData: function () {
      this.$emit("input", this.outputData);
    },
  },
  computed: {
    parseListLabel: function () {
      if (this.output.format.representation === "text") {
        return zip([this.parseArrays(this.output.format.labelName)]);
      } else {
        return zip([
          this.parseArrays(this.output.format.labelName),
          this.parseArrays(this.output.format.labelValue),
        ]);
      }
    },
    parsePolygonLabel: function () {
      return zip([
        this.parseArrays(this.output.format.labelValue),
        this.parseArrays(this.output.format.labelName),
        this.parseArrays(this.output.format.labelColor),
        this.parseArrays(this.output.format.labelLineWidth),
      ]).map((e) => {
        return { value: e[0], name: e[1], color: e[2], lineWidth: e[3] };
      });
    },
    parseHTMLType: function () {
      return this.parseArrays(this.output.format.labelValue);
    },
    getSrcForOrigin: function () {
      return parseOrigin(
        this.output.format.overlay,
        this.inputVars,
        this.outputVars
      );
    },
  },
};
</script>

<style>
.carousel-top-bar {
  text-align: center;
  font-size: 20pt;
  background: rgba(0, 0, 0, 0.3);
}
</style>