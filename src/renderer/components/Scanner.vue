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
          <simple-button class="scan-button"
                         :disabled="isScanning"
                         @click="startScanning">
            <icon name="inbox"></icon>
            {{isScanning ? 'Scanning...' : 'Scan'}}
          </simple-button>

          <popover name="actions" ref="actionsPopover">
            <div slot="face">
              <simple-button class="actions-button" @click="openActionsPopover">
                <icon name="bars"></icon>
                &nbsp;
              </simple-button>
            </div>
            <div slot="content">
              <ul>
                <li><a href="#">npmjs.com</a></li>
                <li><a href="#">github.com</a></li>
              </ul>
            </div>
          </popover>

        </div>
      </div>

      <div class="page-preview"
           :class="pagePreviewClassObject">
        <scanner-page :page="activePage">

        </scanner-page>
      </div>

      <div class="carousel"
           :class="carouselClassObject">

        <swiper :options="swiperOption">
          <swiper-slide v-for="page in pages"
                        :key="page.fileName"
                        :style="getCarouselSlideStyle(page)"
                        @click="activePage = page">
            <img :src="page.fileName">
          </swiper-slide>

          <div class="swiper-pagination" slot="pagination"></div>
          <div class="swiper-button-prev" slot="button-prev"></div>
          <div class="swiper-button-next" slot="button-next"></div>
        </swiper>

      </div>
    </div>

  </slide-y-down-transition>
</template>

<script>
  import scanner from '../services/scanner'
  import events from '../services/event-bus'
  import ScannerButton from './ScannerSelection/ScannerButton'
  import ScannerInfo from './Scanner/ScannerInfo'
  import ScannerPage from './Scanner/ScannerPage'
  import ScannerConfigDialog from './Scanner/ScannerConfigDialog'
  import {SlideYDownTransition} from 'vue2-transitions'
  import {NEW_SCANNER, SET_SCANNER_CONFIG} from '../scanners/scanners-mutations'
  import _ from 'lodash'
  import SimpleButton from './SimpleButton.vue'
  import popover from 'vue-popover'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, ScannerButton, SlideYDownTransition, ScannerInfo,
      ScannerConfigDialog, ScannerPage, popover
    },

    props: ['scannerId'],

    data: function () {
      return {
        // carouselVisible: false,
        pages: [],
        activePage: null,
        // scanner: {}
        swiperOption: {
          slidesPerView: 'auto',
          spaceBetween: 0,
          centeredSlides: true,
          freeMode: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          },
        }
      }
    },

    methods: {
      openActionsPopover: function (e) {
        this.$refs.actionsPopover.onPopoverToggle(e)
      },

      back: function () {
        this.$router.push("/")
      },

      showConfigDialog: function () {
        console.log('dialog shown')
        this.$modal.show('scanner-config')
      },

      startScanning: function () {
        this.scanner.startScanning()

      },

      getCarouselSlideStyle: function (page) {
        let width = 200.0 * page.width / page.height
        return {
          width: width + 'px'
        }
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
        let page = this.pages.find((p) => p.pageId == event.pageId)
        if (page) {
          this.activePage = page
        }
        else {
          this.activePage = _.extend({}, this.activePage, {
            pageId: event.pageId,
            width: this.scanner.capabilities.maxWidth,
            height: this.scanner.capabilities.maxHeight,
            fileName: null
          })
          this.pages.push(this.activePage)
        }

        this.activePage.fileName = `${event.fileName}?anticache=${new Date().getTime()}`
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
      },

    }

  }
</script>

<style lang="scss" scoped>

  @import "../styles/var";
  @import "~vue-popover/dist/styles.css";

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

    }

    .actions-button {
      padding-right: 1px;
      margin-left: 10px;
    }

    .popover {
      display: inline-block;
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

    .swiper-container {
      height: 100%;

      .swiper-slide {
        text-align: center;
        padding: 5px 10px;

        img {
          max-width: 100%;
          max-height: 100%;
        }
      }
    }
  }


</style>
