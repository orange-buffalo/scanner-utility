<template>
  <div class="page-container grid-middle-noGutter-noBottom">
    <progress-bar class="progress-bar"
                  v-if="page && !page.ready"
                  :percent="page.percentLoaded">
    </progress-bar>

    <div class="col">
      <fade-transition mode="out-in">
        <div v-if="!page"
             :key="'welcomeMessage'"
             class="page-message">Click 'Scan' to start scanning
        </div>

        <div v-if="page && !page.hasData"
             :key="'connectingMessage'"
             class="page-message">Making the scanner work hard..
        </div>

        <img :src="page.url"
             v-if="page && page.hasData"
             :width="thumbnailWidth"
             :height="thumbnailHeight"/>
      </fade-transition>
    </div>
  </div>
</template>

<script>

  import {FadeTransition} from 'vue2-transitions'
  import ProgressBar from './ProgressBar'

  export default {
    name: 'scanner-page',

    props: ['page'],

    components: {FadeTransition, ProgressBar},

    data: function () {
      return {
        maxPageWidth: 0,
        maxPageHeight: 0,
        thumbnailWidth: 0,
        thumbnailHeight: 0
      }
    },

    methods: {
      recalculatePageSize: function (page) {
        this.thumbnailWidth = Math.min(this.maxPageWidth, page.width)
        this.thumbnailHeight = this.thumbnailWidth * page.height / page.width
        if (this.thumbnailHeight > this.maxPageHeight) {
          this.thumbnailHeight = this.maxPageHeight
          this.thumbnailWidth = this.thumbnailHeight * page.width / page.height
        }
      }
    },

    mounted: function () {
      let updateSizes = () => {
        this.maxPageWidth = this.$el.offsetWidth - 100
        this.maxPageHeight = this.$el.offsetHeight - 100
      }

      new ResizeObserver(() => {
        updateSizes()
        if (this.page) {
          this.recalculatePageSize(this.page)
        }
      }).observe(this.$el)
    },

    watch: {
      page: function (val) {
        if (val) {
          this.recalculatePageSize(val)
        }
      }
    },

    computed: {}
  }
</script>

<style lang="scss" scoped>
  @import "../../styles/var";

  .page-container {
    overflow: auto;
    height: 100%;
    box-sizing: border-box;
    text-align: center;
    background-color: #494949;
    position: relative;

    .page-message {
      font-size: 200%;
      color: fade_out($txt-color, 0.7);
    }

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }

  }

</style>
