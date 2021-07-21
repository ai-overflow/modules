<template>
  <div>
    <!--<v-file-input
      truncate-length="15"
      v-if="['image'].includes(typeInfo.type)"
      :label="typeInfo.label"
      v-model="inputData"
    ></v-file-input>-->
    <DragNDropUpload v-model="inputData" :label="typeInfo.label" v-if="['image'].includes(typeInfo.type)" @change="e => $emit('change', e)" />
    <v-container v-if="['checkbox'].includes(typeInfo.type)">
      {{ typeInfo.label }}
      <v-checkbox
        v-for="el in typeInfo.values"
        :key="el"
        :label="el"
        color="primary"
        hide-details
        v-model="inputData"
        :value="el"
        @change="e => $emit('change', $event.target.checked)"
      ></v-checkbox>
    </v-container>
    <v-radio-group v-if="['radio'].includes(typeInfo.type)" v-model="inputData">
      <v-radio
        v-for="el in typeInfo.values"
        :key="el"
        :label="el"
        :value="el"
        @change="e => $emit('change', $event.target.checked)"
      ></v-radio>
    </v-radio-group>
    <v-text-field
      v-if="['input'].includes(typeInfo.type)"
      :label="typeInfo.label"
      :rules="generateRules(typeInfo.values)"
      v-model="inputData"
      @change="e => $emit('change', $event.target.value)"
    />
    <v-textarea
      v-if="['textarea'].includes(typeInfo.type)"
      :label="typeInfo.label"
      v-model="inputData"
      @change="e => $emit('change', $event.target.value)"
    />
    <v-select
      v-if="['select', 'multiselect'].includes(typeInfo.type)"
      :items="typeInfo.values"
      item-text="state"
      item-value="abbr"
      label="Select"
      persistent-hint
      return-object
      single-line
      :multiple="typeInfo.type === 'multiselect'"
      v-model="inputData"
      @change="e => $emit('change', $event.target.value)"
    ></v-select>
    <v-slider
      v-if="['slider'].includes(typeInfo.type)"
      :min="typeInfo.values.min"
      :max="typeInfo.values.max"
      :step="typeInfo.values.stepSize"
      v-model="inputData"
      @change="e => $emit('change', $event.target.value)"
    />
  </div>
</template>

<script>
import { toBase64 } from "@shared/helper/utility";
import DragNDropUpload from "@shared/components/helper/DragNDropUpload.vue";

export default {
  props: {
    typeInfo: Object,
    value: {},
  },
  data() {
    return {
      inputData: {},
    };
  },
  components: { DragNDropUpload },
  created() {
    if (this.typeInfo.type === "checkbox") {
      this.inputData = [];
    }
    if (this.typeInfo.type === "slider") {
      this.inputData = parseFloat(this.inputData);
    }
    if (["textarea", "input"].includes(this.typeInfo.type)) {
      this.inputData = "";
    }
  },
  methods: {
    generateRules(rules) {
      let ruleSet = [];
      if (rules.regex) {
        ruleSet.push(
          (v) => !!new RegExp(rules.regex).test(v) || `Ungültige Eingabe`
        );
      }
      if (rules.length) {
        ruleSet.push(
          (v) =>
            (v || "").length >= rules.length.min ||
            `Minimale Länge: ${rules.length.min} Zeichen`
        );
        ruleSet.push(
          (v) =>
            (v || "").length <= rules.length.max ||
            `Maximale Länge: ${rules.length.max} Zeichen`
        );
      }

      return ruleSet;
    },
  },
  watch: {
    inputData: function () {
      if (this.typeInfo.type === "image") {
        if (this.typeInfo.values.type === "base64") {
          toBase64(this.inputData).then((e) => {
            this.$emit("input", e);
          });
        }
      }
      this.$emit("input", this.inputData);
    },
  },
};
</script>

<style>
</style>