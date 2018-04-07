<template>
  <slide-y-down-transition>
    <div class="wrapper">
      <div class="header grid-noGutter-noBottom">
        <div class="col-6">
          <scanner-info :scannerId="scanner.id"
                        @configChangeRequested="showConfigDialog"></scanner-info>

          <scanner-config-dialog :scannerId="scanner.id"></scanner-config-dialog>
        </div>
      </div>

      <div class="page-preview"
           :class="pagePreviewClassObject"
           @click="back">

        page

      </div>

      <div class="carousel"
           :class="carouselClassObject">dsf
      </div>
    </div>

  </slide-y-down-transition>
</template>

<script>
  import scanner from "../services/scanner"
  import events from "../services/event-bus"
  import ScannerButton from "./ScannerSelection/ScannerButton"
  import ScannerInfo from "./Scanner/ScannerInfo"
  import ScannerConfigDialog from "./Scanner/ScannerConfigDialog"
  import {SlideYDownTransition} from 'vue2-transitions'
  import {NEW_SCANNER, SET_SCANNER_CONFIG} from '../store/mutations'

  export default {
    name: 'scanner',
    components: {ScannerButton, SlideYDownTransition, ScannerInfo, ScannerConfigDialog},
    data: function () {
      return {
        carouselVisible: false,
        // scanner: {}
      }
    },
    methods: {
      back: function () {
        // this.$router.push("/")
        this.carouselVisible = !this.carouselVisible

      },

      showConfigDialog: function () {
        console.log('dialog shown')
        this.$modal.show('scanner-config')
      }
    },
    created: function () {
      this.$store.commit(NEW_SCANNER, {
        name: 'Cannon TS9000 Series',
        capabilities: {
          colorModes: [
            {
              name: "RGB24",
              isDefault: true
            },
            {
              name: "Greyscale",
              isDefault: false
            }
          ],
          resolutions: [
            {
              value: "75",
              isDefault: false
            },
            {
              value: "100",
              isDefault: false
            },
            {
              value: "300",
              isDefault: true
            },
            {
              value: "600",
              isDefault: false
            }
          ]
        }
      })

      let scanner = this.$store.state.scanners[0]
      this.$store.commit(SET_SCANNER_CONFIG, {
        scannerId: scanner.id,
        config: {
          resolution: scanner.capabilities.resolutions.find((r) => {
            return r.isDefault
          }),
          colorMode: scanner.capabilities.colorModes.find((cm) => {
            return cm.isDefault
          })
        }
      })
    },
    computed: {
      scanner: function () {
        return this.$store.state.scanners[0]
      },
      pagePreviewClassObject: function () {
        return {
          "with-carousel": this.carouselVisible
        }

      },

      carouselClassObject: function () {
        return {
          "visible": this.carouselVisible
        }

      }
    }

  }
</script>

<style lang="scss" scoped>
  $carousel-height: 200px;

  .wrapper {
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    height: 70px;
    right: 0;
  }

  .page-preview {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #F5F7F7;
    transition: all 0.3s;

    &.with-carousel {
      bottom: $carousel-height;
    }
  }

  .carousel {
    position: absolute;
    bottom: -$carousel-height;
    left: 0;
    right: 0;
    height: $carousel-height;

    transition: all 0.3s;

    &.visible {
      bottom: 0;
    }
  }


</style>