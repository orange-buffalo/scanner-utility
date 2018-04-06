<template>
  <div class="container grid-middle-noGutter-noBottom">
    <div class="col">
      <span class="scanner-name">{{scanner.name}}</span>
      <br/>
      <span class="scanner-config"
            @click.stop="configChangeRequested">{{scannerConfigAsString}}</span>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'scanner-info',
    props: ['scanner'],

    methods: {
      configChangeRequested: function () {
        this.$emit('configChangeRequested')
      }
    },

    computed: {
      scannerConfigAsString: function () {
        return `${this.scanner.config.resolution}dpi / ${this.scanner.config.colorMode}`
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
