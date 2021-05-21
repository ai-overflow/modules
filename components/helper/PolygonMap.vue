<template>
    <div
      ref="el"
      :style="{
        width: imgSize.width + 'px',
        height: imgSize.height + 'px',
        backgroundImage: 'url(' + base64Str + ')',
      }"
      class="polygonView"
    ></div>
</template>

<script>
import Two from "two.js";
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
  },
  methods: {
    createPolygons() {
      if (!this.two) return;
      this.two.appendTo(this.$el);
      this.two.clear();
      this.elements = [];

      for (let poly of this.data) {
        if (!Array.isArray(poly.value)) continue;

        let anchors = poly.value.map(
          (e) =>
            new Two.Anchor(
              e.x * this.imgSize.scaleFactor,
              e.y * this.imgSize.scaleFactor
            )
        );
        let path;
        switch (this.representation) {
          case "filled":
            path = this.two.makePath(anchors, false);
            path.fill = poly.color || "rgba(0, 255, 0, 0.5)";
            console.log(path._renderer);
            break;
          case "polygon":
            path = this.two.makePath(anchors, false);
            path.stroke = poly.color || "rgba(0, 255, 0, 0.5)";
            path.fill = "transparent";
            path.linewidth = 5;
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
        this.elements.push(path);
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
  },
  watch: {
    overlay: function () {
      if (this.overlay) {
        toBase64(this.overlay)
          .then((e) => {
            this.base64Str = e;
            return readSize(e);
          })
          .then((e) => {
            this.imgSize = scaleToSize(e, this.maxImageSize);
            if (!this.two) this.two = this.generateTwo();
            this.createPolygons();
          })
          .catch((e) => console.log("ERROR;", e));
      }
    },
    data: function () {
      this.createPolygons();
    },
  },
  mounted() {
    this.createPolygons();
  },
};
</script>
<style>
.polygonView {
  background-size: cover;
}
</style>