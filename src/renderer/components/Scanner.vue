<template>
  <div class="wrapper" v-if="scanner">
    <div class="header grid-noGutter-noBottom-middle">
      <div class="col-6">
        <div class="back-button" @click="back">
          <icon name="chevron-left" scale="2"/>
        </div>

        <div class="scanner-info">
          <scanner-info :scanner-id="scanner.id"
                        @config-change-requested="showConfigDialog"></scanner-info>

          <scanner-config-dialog :scanner-id="scanner.id"></scanner-config-dialog>
        </div>
      </div>

      <div class="col-6">
        <simple-button class="scan-button"
                       :disabled="scanner.isScanning"
                       @click="onStartScanning">
          <icon name="inbox"></icon>
          {{scanner.isScanning ? 'Scanning...' : 'Scan'}}
        </simple-button>

        <page-actions :active-page-id="activePageId"></page-actions>
      </div>
    </div>

    <div class="page-preview"
         :class="pagePreviewClassObject">
      <scanner-page :page="activePage">

      </scanner-page>
    </div>

    <pages-carousel :class="carouselClassObject"
                    v-model="activePageId">
    </pages-carousel>
  </div>
</template>

<script>
  import ScannerInfo from './Scanner/ScannerInfo'
  import ScannerPage from './Scanner/ScannerPage'
  import ScannerConfigDialog from './Scanner/ScannerConfigDialog'
  import SimpleButton from './SimpleButton.vue'
  import {mapGetters, mapState, mapActions} from 'vuex'
  import PagesCarousel from './Scanner/PagesCarousel'
  import Noty from 'noty'
  import PageActions from './Scanner/PageActions'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, ScannerInfo, ScannerConfigDialog, ScannerPage, PagesCarousel, PageActions
    },

    data: function () {
      return {
        activePageId: null
      }
    },

    methods: {
      ...mapActions({
        startScanning: 'scanners/startScanning',
        deletePage: 'session/deletePage'
      }),

      back: function () {
        this.$router.push("/")
      },

      showConfigDialog: function () {
        this.$modal.show('scanner-config')
      },

      onStartScanning: function () {
        this.startScanning()
            .then(page => this.activePageId = page.id)
      }
    },

    created: function () {
      if (!this.scanner) {
        this.$router.push('/')
        return
      }

      this.activePageId = this.pages.length ? this.pages[this.pages.length - 1].id : null
    },

    computed: {
      ...mapGetters({
        getPageById: 'session/getPageById'
      }),

      ...mapState({
        pages: state => state.session.pages,
        scanner: states => states.scanners.activeScanner
      }),

      pagePreviewClassObject: function () {
        return {
          "with-carousel": this.carouselVisible
        }
      },

      carouselClassObject: function () {
        return {
          "visible": this.carouselVisible,
          "carousel": true
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
        if (!this.getPageById(this.activePageId)) {
          this.activePageId = newPages.length ? newPages[newPages.length - 1].id : null
        }
      },

      'activePage.error': function (error) {
        if (this.activePage && error) {
          new Noty({
            text: 'Page scan failed :(',
            type: 'error',
            layout: 'bottomCenter',
            timeout: 5000
          }).show()

          if (!this.activePage.hasData) {
            this.deletePage(this.activePageId)
          }
        }
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
