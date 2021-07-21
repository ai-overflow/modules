<template>
  <div
    class="flex items-center justify-center text-center dashed-border ma-5"
    id="app"
  >
    <v-container
      class="indigo lighten-5"
      @dragover="dragover"
      @dragleave="dragleave"
      @drop="drop"
    >
      <input
        type="file"
        name="fields[assetsFieldHandle][]"
        id="assetsFieldHandle"
        @change="onChange"
        ref="file"
        class="hidden-element"
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <div v-if="loading">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
      <label
        for="assetsFieldHandle"
        class="block cursor-pointer"
        v-if="filelist.length <= 0"
      >
        <div class="pa-12">
          Please drop your files here or
          <span class="text-underline">click here</span> to upload your files
        </div>
      </label>
      
      <ul class="mt-4 no-bullet" v-if="filelist.length > 0">
        <li
          class="text-sm pa-1"
          v-for="[index, file] of filelist.entries()"
          :key="index"
        >
          {{ file.name }}
          <v-btn
            icon
            plain
            elevation="0"
            @click="remove(filelist.indexOf(file))"
            title="Remove file"
          >
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </li>
      </ul>
    </v-container>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      filelist: [], // Store our uploaded files
    };
  },
  props: {
    loading: Boolean,
    label: String,
  },
  methods: {
    onChange() {
      this.filelist = [...this.$refs.file.files];
      if(this.filelist.length > 0) {
        this.$emit("input", this.filelist[0]);
        this.$emit("change", this.filelist[0]);
      }
    },
    remove(i) {
      this.filelist.splice(i, 1);
    },
    dragover(event) {
      event.preventDefault();
      // Add some visual fluff to show the user can drop its files
      if (!event.currentTarget.classList.contains("darken-1")) {
        event.currentTarget.classList.remove("lighten-5");
        event.currentTarget.classList.add("darken-1", "white--text");
      }
    },
    dragleave(event) {
      // Clean up
      event.currentTarget.classList.add("lighten-5");
      event.currentTarget.classList.remove("darken-1", "white--text");
    },
    drop(event) {
      event.preventDefault();
      this.$refs.file.files = event.dataTransfer.files;
      this.onChange(); // Trigger the onChange event manually
      // Clean up
      event.currentTarget.classList.add("lighten-5");
      event.currentTarget.classList.remove("darken-1", "white--text");
    },
  },
};
</script>

<style>
.hidden-element {
  display: none;
}
.text-underline {
  text-decoration: underline;
  cursor: pointer;
}
.text-underline:hover {
  text-decoration: none;
}
.dashed-border {
  border: 3px dashed rgb(92, 92, 92);
}
.no-bullet {
  list-style-type: none;
}
</style>