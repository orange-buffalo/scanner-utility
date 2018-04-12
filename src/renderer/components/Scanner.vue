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
              <a href="#" @click="savePdf">npmjs.com</a>
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
                        :key="page.id"
                        :style="getCarouselSlideStyle(page)">
            <img :src="page.url" @click="activePageId = page.id">
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
  import ScannerButton from './ScannerSelection/ScannerButton'
  import ScannerInfo from './Scanner/ScannerInfo'
  import ScannerPage from './Scanner/ScannerPage'
  import ScannerConfigDialog from './Scanner/ScannerConfigDialog'
  import {SlideYDownTransition} from 'vue2-transitions'
  import {SET_SCANNER_CONFIG} from '../scanners/scanners-mutations'
  import SimpleButton from './SimpleButton.vue'
  import popover from 'vue-popover'
  import {mapGetters, mapState} from 'vuex'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, ScannerButton, SlideYDownTransition, ScannerInfo,
      ScannerConfigDialog, ScannerPage, popover
    },

    props: ['scannerId'],

    data: function () {
      return {
        activePageId: null,

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
      },

      savePdf: function () {
        this.$store.dispatch('session/saveAsPdf')
      }
    },

    created: function () {
      //todo move to service
      this.$store.commit(`scanners/${SET_SCANNER_CONFIG}`, {
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

      if (this.pages.length) {
        this.activePageId = this.pages[0].id
      }
    },

    computed: {
      ...mapGetters({
        getScannerById: 'scanners/getScannerById',
        getPageById: 'session/getPageById'
      }),

      ...mapState({
        pages: state => state.session.pages,
      }),

      isScanning: function () {
        return this.scanner.status == scanner.Status.SCANNING
      },

      scanner: function () {
        return this.getScannerById(this.scannerId)
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

      activePage: function () {
        return this.activePageId ? this.getPageById(this.activePageId) : null
      }

    },

    watch: {
      pages: function (newPages) {
        if (newPages.length) {
          this.activePageId = newPages[newPages.length - 1].id
        }
      }
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
