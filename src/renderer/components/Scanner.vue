<template>
  <slide-y-down-transition>
    <div class="wrapper">
      <div class="header">
        header
      </div>

      <div class="page-preview"
           :class="pagePreviewClassObject"
           @click="back">

        page

      </div>

      <div class="carousel"
           :class="carouselClassObject">dsf</div>
    </div>

  </slide-y-down-transition>
</template>

<script>
  import scanner from "../services/scanner"
  import events from "../services/event-bus"
  import ScannerButton from "./ScannerSelection/ScannerButton"
  import {SlideYDownTransition} from 'vue2-transitions'


  let testcounter = 1

  export default {
    name: 'scanner-selection',
    components: {ScannerButton, SlideYDownTransition},
    data: function () {
      return {
        carouselVisible: false
      }
    },
    methods: {
      back: function () {
        // this.$router.push("/")
        this.carouselVisible = !this.carouselVisible

      }
    },
    created: function () {

    },
    computed: {
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
