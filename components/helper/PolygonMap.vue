<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <div
          ref="polygonRef"
          :style="{
            width: imgSize.width + 'px',
            height: imgSize.height + 'px',
            backgroundImage: 'url(' + base64Str + ')',
          }"
          class="polygonView"
        ></div>
      </v-col>
      <v-col v-if="showLabels">
        <v-virtual-scroll
          :items="data"
          :item-height="50"
          :height="imgSize.height + 'px'"
        >
          <template v-slot="{ item, index }">
            <div
              class="polygon"
              v-on:mouseover="() => focusPolygon(item, index)"
              v-on:mouseleave="() => unfocusPolygon(index)"
            >
              {{ item.name }}
            </div>
          </template>
        </v-virtual-scroll>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Two from "two.js";
import Color from "color";
import { toBase64, readSize, scaleToSize } from "@shared/helper/utility";

export default {
  data() {
    return {
      maxImageSize: 500,
      two: this.generateTwo(),
      base64Str: "ERROR",
      imgSize: {},
      elements: [],
    };
  },
  props: {
    data: Array,
    representation: String,
    overlay: File,
    highlight: {
      type: Object,
      required: false,
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    createAnchor(poly) {
      return poly.value.map(
        (e) =>
          new Two.Anchor(
            e.x * this.imgSize.scaleFactor,
            e.y * this.imgSize.scaleFactor
          )
      );
    },
    createPolygon(poly) {
      let anchors = this.createAnchor(poly);

      let path;
      switch (this.representation) {
        case "filled":
          path = this.two.makePath(anchors, false);
          path.fill = poly.color || "rgba(0, 255, 0, 0.5)";

          if (
            this.highlight &&
            Object.keys(this.highlight).includes(poly.name)
          ) {
            path.fill = "rgba(0, 255, 0, 0.5)";
          }

          break;
        case "polygon":
          path = this.two.makePath(anchors, false);
          path.stroke = poly.color || "rgba(0, 255, 0, 0.5)";
          path.fill = "transparent";
          path.linewidth = poly.lineWidth || 5;

          if (
            this.highlight &&
            Object.keys(this.highlight).includes(poly.name)
          ) {
            path.fill = "rgba(0, 255, 0, 0.5)";
          }

          break;
        case "dots":
          path = [];
          for (let anchor of anchors) {
            let circle = this.two.makeCircle(anchor.x, anchor.y, 5);
            circle.fill = poly.color || "rgba(0, 255, 0, 0.5)";
            path.push(circle);
          }
          break;
      }
      return path;
    },
    createPolygonList() {
      if (!this.two) return;
      this.two.appendTo(this.$refs.polygonRef);
      this.two.clear();
      this.elements = [];

      for (let poly of this.data) {
        if (!Array.isArray(poly.value)) continue;

        this.elements.push(this.createPolygon(poly));
      }
      this.two.update();
    },
    generateTwo() {
      if (!this.imgSize || !this.imgSize.width || !this.imgSize.height) {
        return null;
      }

      return new Two({
        autostart: true,
        width: this.imgSize.width,
        height: this.imgSize.height,
      });
    },
    handleOverlay() {
      if (this.overlay) {
        toBase64(this.overlay)
          .then((e) => {
            this.base64Str = e;
            return readSize(e);
          })
          .then((e) => {
            this.imgSize = scaleToSize(e, this.maxImageSize);
            if (!this.two) this.two = this.generateTwo();
            this.createPolygonList();
          })
          .catch((e) => console.log("ERROR;", e));
      }
    },
    focusPolygon(item, index) {
      if (this.elements[index]?.fill) {
        this.elements[index].originalFill = this.elements[index].fill;
        this.elements[index].fill = Color(this.elements[index].fill)
          .negate()
          .alpha(0.3)
          .rgb()
          .string();
      }
      if (this.elements[index]?.stroke) {
        this.elements[index].originalStroke = this.elements[index].stroke;
        this.elements[index].stroke = Color(this.elements[index].stroke)
          .negate()
          .rgb()
          .string();
      }
    },
    unfocusPolygon(index) {
      if (this.elements[index]?.originalFill) {
        this.elements[index].fill = this.elements[index]?.originalFill;
      }
      if (this.elements[index]?.originalStroke) {
        this.elements[index].stroke = this.elements[index]?.originalStroke;
      }
    },
  },
  watch: {
    overlay: function () {
      this.handleOverlay();
    },
    data: function () {
      this.createPolygonList();
    },
    highlight: function () {
      this.createPolygonList();
    },
  },
  mounted() {
    this.handleOverlay();
  },
};
</script>
<style>
.polygonView {
  background-size: cover;
}
.polygon {
  cursor: pointer;
}
.polygon:hover {
  font-weight: bold;
}
</style>