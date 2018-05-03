<template>
  <modal name="scanner-config"
         classes="v--modal container"
         height="auto">
    <div class="content">
      <div class="header">{{scanner.name}}</div>
      <div class="grid-middle">
        <div class="col-4">
          <span>Resolution</span>
        </div>
        <div class="col-8">
          <v-select v-model="selectedResolution"
                    :options="scanner.capabilities.resolutions"
                    :close-on-select="true"
                    :allow-empty="false"
                    @select="onResolutionSelect"
                    :searchable="false"
                    select-label=""
                    deselect-label=""
                    selected-label=""
                    :custom-label="getResolutionLabel"></v-select>
        </div>

        <div class="col-4">
          <span>Color Mode</span>
        </div>
        <div class="col-8">
          <v-select v-model="selectedColorMode"
                    :options="scanner.capabilities.colorModes"
                    :close-on-select="true"
                    :allow-empty="false"
                    @select="onColorModeSelect"
                    :searchable="false"
                    select-label=""
                    deselect-label=""
                    selected-label=""
                    :custom-label="getColorModeLabel"></v-select>
        </div>
      </div>
    </div>

    <div @click="$modal.hide('scanner-config')" class="close-button">
      Close
    </div>
  </modal>
</template>

<script>

  import {mapActions, mapGetters} from 'vuex'

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
      ...mapActions({
        saveConfig: 'scanners/updateScannerConfig'
      }),

      onResolutionSelect: function (selectedOption) {
        this.saveConfig({
          scannerId: this.scannerId,
          newConfig: {
            resolution: selectedOption
          }
        })
      },

      onColorModeSelect: function (selectedOption) {
        this.saveConfig({
          scannerId: this.scannerId,
          newConfig: {
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
    box-shadow: 0 0 10px 0 rgba(27, 33, 58, 0.4);
    color: $overlay-txt-color;
    border-radius: $border-radius;
    overflow: visible;
    background-color: $overlay-bg-color;
    border: 1px solid $overlay-border-color;

    .content {
      padding: 20px;

      .header {
        text-transform: uppercase;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        border-bottom: 1px solid $overlay-border-color;
        padding: 5px 5px 15px 5px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .multiselect {
        .multiselect__tags {
          border-radius: $border-radius;
          border-color: $overlay-border-color;
          padding-top: 10px;
        }

        .multiselect__content-wrapper {
          border-radius: $border-radius;
          border-color: $overlay-border-color;
        }

        .multiselect__option {
          transition: all 0.3s;

          &.multiselect__option--highlight {
            background-color: lighten($accent-color, 20);
            color: inherit;
          }

          &.multiselect__option--selected {
            background-color: lighten($accent-color, 10);
          }
        }
      }
    }

    .close-button {
      padding: 15px;
      text-align: center;
      border-top: 1px solid $overlay-border-color;
      transition: all 0.3s;

      &:hover {
        background-color: $overlay-bg-active-color;
      }
    }
  }

  .v--modal-overlay {
    background-color: rgba(0, 0, 0, 0.3);
  }

</style>
