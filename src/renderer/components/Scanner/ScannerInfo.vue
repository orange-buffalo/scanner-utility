<template>
  <div class="container grid-middle-noGutter-noBottom">
    <div class="col">
      <span class="scanner-name">{{scanner.name}}</span>
      <br/>
      <span class="scanner-config"
            @click.stop="configChangeRequested">
        {{scanner.config.resolution.value}}dpi / {{this.scanner.config.colorMode.name}}
      </span>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'scanner-info',
    props: ['scannerId'],

    methods: {
      configChangeRequested: function () {
        this.$emit('configChangeRequested')
      }
    },

    computed: {
      scanner: function () {
          return this.$store.getters.getScannerById(this.scannerId)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../styles/var";

  .container {
    padding-left: 10px;
    line-height: 1;
    height: 100%;
  }

  span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100%;
    display: inline-block;
    line-height: 1.1;
  }

  .scanner-name {
    font-weight: 800;
  }

  .scanner-config {
    font-size: 70%;
    transition: all 0.3s;

    &:hover {
      color: lighten($txt-color, 10);
    }
  }

</style>
