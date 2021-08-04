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
              v-on:mouseover="() => focusPolygon(index)"
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
    canvas: {
      type: Array,
      required: false,
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
      let anchors;
      switch (this.representation) {
        case "line":
          anchors = poly.value.map((e) => {
            return this.createAnchor({ value: [e.from, e.to] });
          });
          break;
        default:
          anchors = this.createAnchor(poly);
      }

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
            let circle = this.two.makeCircle(
              anchor.x,
              anchor.y,
              poly.lineWidth || 5
            );
            circle.fill = poly.color || "rgba(0, 255, 0, 0.5)";
            path.push(circle);
          }
          break;
        case "line":
          path = [];
          for (let anchor of anchors) {
            let line = this.two.makeLine(
              anchor[0].x,
              anchor[0].y,
              anchor[1].x,
              anchor[1].y
            );
            line.stroke = poly.color || "rgba(0, 255, 0, 0.5)";
            line.linewidth = poly.lineWidth || 5;
            path.push(line);
          }
          break;
      }
      return path;
    },
    createPolygonList() {
      if (!this.two) return;

      if (this.canvas) {
        let el = (Array.isArray(this.canvas) ? this.canvas[0]  : this.canvas);
        console.log(el);
        this.two.appendTo(el);
      } else {
        this.two.appendTo(this.$refs.polygonRef);
      }

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
    focusPolygon(index) {
      if (Array.isArray(this.elements[index])) {
        this.elements[index].forEach((element) => {
          this._focusPolygon(element);
        });
      } else {
        this._focusPolygon(this.elements[index]);
      }
    },
    _focusPolygon(element) {
      if (element?.fill) {
        element.originalFill = element.fill;
        element.fill = Color(element.fill).negate().alpha(0.3).rgb().string();
      }
      if (element?.stroke) {
        element.originalStroke = element.stroke;
        element.stroke = Color(element.stroke).negate().rgb().string();
      }
    },
    unfocusPolygon(index) {
      if (Array.isArray(this.elements[index])) {
        this.elements[index].forEach((element) => {
          this._unfocusPolygon(element);
        });
      } else {
        this._unfocusPolygon(this.elements[index]);
      }
    },
    _unfocusPolygon(element) {
      if (element?.originalFill) {
        element.fill = element?.originalFill;
      }
      if (element?.originalStroke) {
        element.stroke = element?.originalStroke;
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
    canvas: function() {
      this.createPolygonList();
    }
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