<template>
  <div ref="el" :style="{ backgroundImage: 'url(' + overlay + ')' }"></div>
</template>

<script>
import Two from "two.js";

export default {
  data() {
    return {
      two: new Two({
        autostart: true,
      }),
    };
  },
  props: {
    data: Array,
    representation: String,
    overlay: String
  },
  methods: {
    createPolygons() {
      this.two.appendTo(this.$el);

      for (let poly of this.data) {
        if (!Array.isArray(poly.value)) continue;

        let anchors = poly.value.map((e) => new Two.Anchor(e.x, e.y));
        let path = this.two.makePath(anchors, false);
        path.fill = poly.color || "rgba(0, 255, 0, 0.5)";
      }
      this.two.update();
    },
  },
  mounted() {
    console.log("called");
    this.createPolygons();
  },
};
</script>