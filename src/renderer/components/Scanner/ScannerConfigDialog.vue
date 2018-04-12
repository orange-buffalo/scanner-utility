<template>
  <modal name="scanner-config" classes="v--modal container" height="auto">
    <div class="header">{{scanner.name}}</div>
    <div class="grid">
      <div class="col-6">
        <span>Resolution</span>
      </div>
      <div class="col-6">
        <v-select v-model="selectedResolution"
                  :options="scanner.capabilities.resolutions"
                  :close-on-select="true"
                  :allowEmpty="false"
                  @select="onResolutionSelect"
                  :customLabel="getResolutionLabel"></v-select>
      </div>

      <div class="col-6">
        <span>Color Mode</span>
      </div>
      <div class="col-6">
        <v-select v-model="selectedColorMode"
                  :options="scanner.capabilities.colorModes"
                  :close-on-select="true"
                  :allowEmpty="false"
                  @select="onColorModeSelect"
                  :customLabel="getColorModeLabel"></v-select>
      </div>
    </div>

    <div @click="$modal.hide('scanner-config')">
      Close
    </div>
  </modal>
</template>

<script>

  import {SET_SCANNER_CONFIG} from '../../scanners/scanners-mutations'
  import {mapGetters} from 'vuex'

  export default {
    name: 'scanner-config-dialog',
    props: ['scannerId'],

    data: function () {
      return {
        selectedResolution: null,
        selectedColorMode: null
      }
    },

    created: function () {
      this.selectedResolution = this.scanner.config.resolution
      this.selectedColorMode = this.scanner.config.colorMode
    },

    methods: {
      onResolutionSelect: function (selectedOption) {
        this.$store.commit(`scanners/${SET_SCANNER_CONFIG}`, {
          scannerId: this.scannerId,
          config: {
            ...this.scanner.config,
            resolution: selectedOption
          }
        })
      },

      onColorModeSelect: function (selectedOption) {
        this.$store.commit(`scanners/${SET_SCANNER_CONFIG}`, {
          scannerId: this.scannerId,
          config: {
            ...this.scanner.config,
            colorMode: selectedOption
          }
        })
      },

      getResolutionLabel: function (resolution) {
        return `${resolution.value}dpi` + (resolution.isDefault ? ' (default)' : '')
      },

      getColorModeLabel: function (colorMode) {
        return `${colorMode.name}` + (colorMode.isDefault ? ' (default)' : '')
      }
    },

    computed: {
      ...mapGetters({
        getScannerById: 'scanners/getScannerById'
      }),

      scanner: function () {
        return this.getScannerById(this.scannerId)
      }
    }
  }
</script>

<style lang="scss">
  @import "../../styles/var";

  .v--modal.container {
    padding: 10px;
    box-shadow: 0 5px 40px -2px rgba(27, 33, 58, 0.4);

    .header {
      text-transform: uppercase;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid rgba(26, 30, 30, 0.1);
      padding: 5px;
      font-weight: bold;
    }
  }

</style>
