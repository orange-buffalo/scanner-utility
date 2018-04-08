<template>
  <slide-y-down-transition>
    <div class="wrapper">
      <div class="header grid-noGutter-noBottom-middle">
        <div class="col-6">
          <div class="back-button" @click="back">
            <icon name="chevron-left" scale="2"/>
          </div>

          <div class="scanner-info">
            <scanner-info :scannerId="scanner.id"
                          @configChangeRequested="showConfigDialog"></scanner-info>

            <scanner-config-dialog :scannerId="scanner.id"></scanner-config-dialog>
          </div>
        </div>

        <div class="col-6">
          <b-button class="scan-button" @click="startScanning"
                    :disabled="isScanning">
            <i>
              <icon name="inbox"></icon>
            </i>
            {{isScanning ? 'Scanning...' : 'Scan'}}
          </b-button>

          <b-dropdown text="...">
            <b-dropdown-item>First Action</b-dropdown-item>
            <b-dropdown-item>Second Action</b-dropdown-item>
            <b-dropdown-item>Third Action</b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item>Something else here...</b-dropdown-item>
            <b-dropdown-item disabled>Disabled action</b-dropdown-item>
          </b-dropdown>

        </div>
      </div>

      <div class="page-preview"
           :class="pagePreviewClassObject">
        <scanner-page :page="activePage">

        </scanner-page>
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
  import ScannerPage from "./Scanner/ScannerPage"
  import ScannerConfigDialog from "./Scanner/ScannerConfigDialog"
  import {SlideYDownTransition} from 'vue2-transitions'
  import {NEW_SCANNER, SET_SCANNER_CONFIG} from '../store/mutations'

  export default {
    name: 'scanner',

    components: {ScannerButton, SlideYDownTransition, ScannerInfo, ScannerConfigDialog, ScannerPage},

    props: ['scannerId'],

    data: function () {
      return {
        // carouselVisible: false,
        pages: [],
        activePage: null
        // scanner: {}
      }
    },

    methods: {
      back: function () {
        this.$router.push("/")
      },

      showConfigDialog: function () {
        console.log('dialog shown')
        this.$modal.show('scanner-config')
      },

      startScanning: function () {
        this.scanner.startScanning()

      }
    },

    created: function () {
      //todo move to service
      this.$store.commit(SET_SCANNER_CONFIG, {
        scannerId: this.scanner.id,
        config: {
          resolution: this.scanner.capabilities.resolutions.find((r) => {
            return r.isDefault
          }),
          colorMode: this.scanner.capabilities.colorModes.find((cm) => {
            return cm.isDefault
          })
        }
      })


      events.on("scan-progress", (event) => {
        this.activePage = {}
        this.$set(this.activePage, 'fileName', event.fileName)
        this.$set(this.activePage, 'width', this.scanner.capabilities.maxWidth)
        this.$set(this.activePage, 'height', this.scanner.capabilities.maxHeight)
        this.pages.push(this.activePage)
      })
    },
    computed: {
      isScanning: function () {
        return this.scanner.status == scanner.Status.SCANNING
      },

      scanner: function () {
        return this.$store.getters.getScannerById(this.scannerId)
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

      },

      carouselVisible: function () {
        return this.pages.length > 1
      }
    }

  }
</script>

<style lang="scss" scoped>

  @import "../styles/var";

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

    .back-button {
      display: inline-block;
      float: left;
      padding: 0 5px 0 5px;
      transition: all 0.3s;

      &:hover {
        color: $txt-hover-color;
      }
    }

    .scanner-info {
      display: inline-block;
      float: left;
    }

    .scan-button {
      i {

      }
    }

  }

  .page-preview {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
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
