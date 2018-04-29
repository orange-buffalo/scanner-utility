<template>
  <div class="page-container grid-middle-noGutter-noBottom">
    <progress-bar class="progress-bar"
                  v-if="page && !page.ready"
                  :percent="page.percentLoaded"
                  color="#86C232">
    </progress-bar>

    <div class="col">
      <fade-transition mode="out-in">
        <div v-if="!page"
             :key="'welcomeMessage'"
             class="page-message">click 'Scan' to start rolling
        </div>

        <div v-if="page && !page.hasData"
             :key="'connectingMessage'"
             class="page-message">we are scanning.. and you don't think of purple hippos
        </div>

        <img :src="pageUrl"
             :key="page.fileName"
             v-if="page && page.hasData && pageUrl"
             :width="thumbnailSize.width"
             :height="thumbnailSize.height"/>
      </fade-transition>
    </div>
  </div>
</template>

<script>

  import {FadeTransition} from 'vue2-transitions'
  import ProgressBar from '../ProgressBar'

  export default {
    name: 'scanner-page',

    props: ['page'],

    components: {FadeTransition, ProgressBar},

    data: function () {
      return {
        maxPageWidth: 0,
        maxPageHeight: 0,
        thumbnailWidth: 0,
        thumbnailHeight: 0,
        pageUrl: null
      }
    },

    mounted: function () {
      let updateSizes = () => {
        this.maxPageWidth = this.$el.offsetWidth - 100
        this.maxPageHeight = this.$el.offsetHeight - 100
      }

      new ResizeObserver(() => {
        updateSizes()
      }).observe(this.$el)
    },

    computed: {
      thumbnailSize: function () {
        let thumbnailWidth = Math.min(this.maxPageWidth, this.page.width)
        let thumbnailHeight = thumbnailWidth * this.page.height / this.page.width
        if (thumbnailHeight > this.maxPageHeight) {
          thumbnailHeight = this.maxPageHeight
          thumbnailWidth = thumbnailHeight * this.page.width / this.page.height
        }
        return {
          width: thumbnailWidth,
          height: thumbnailHeight
        }
      }
    },

    watch: {
      'page.url': function (newUrl) {
        if (this.page.hasData) {
          if (this.$loadingImage) {
            this.$loadingImage.onload = null
            this.$loadingImage.src = ''
          }
          this.$loadingImage = new Image()
          this.$loadingImage.src = newUrl
          this.$loadingImage.onload = () => {
            this.pageUrl = newUrl
            this.$loadingImage = null
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../styles/var";

  .page-container {
    overflow: auto;
    height: 100%;
    box-sizing: border-box;
    text-align: center;
    background-color: #474b4f;
    position: relative;

    .page-message {
      font-size: 200%;
      color: fade_out($txt-color, 0.4);
      width: 70%;
      margin: auto;
    }

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
  }
</style>
