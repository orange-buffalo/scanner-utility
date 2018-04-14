<template>
  <div class="carousel">
    <swiper :options="swiperOption" ref="swiper">
      <swiper-slide v-for="page in pages"
                    :key="page.id"
                    :style="getCarouselSlideStyle(page)">
        <div class="grid-middle-noGutter-noBottom"
             @click="selectPage(page)">
          <fade-transition>
            <img :src="page.url"
                 v-if="page.ready">
          </fade-transition>

          <fade-transition>
            <div class="col"
                 v-if="!page.ready">
              <icon name="spinner" spin></icon>
            </div>
          </fade-transition>
        </div>
      </swiper-slide>
      <div class="swiper-button-prev" slot="button-prev"></div>
      <div class="swiper-button-next" slot="button-next"></div>
    </swiper>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {FadeTransition} from 'vue2-transitions'

  export default {
    name: 'pages-carousel',

    components: {FadeTransition},

    model: {
      prop: 'selectedPageId',
      event: 'selectPage'
    },

    props: ['selectedPageId'],

    data: function () {
      return {
        swiperOption: {
          slidesPerView: 'auto',
          spaceBetween: 0,
          centeredSlides: true,
          freeMode: true,
          freeModeMomentum: false,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          },
        }
      }
    },

    mounted: function () {
      this.scrollToPage(this.selectedPageId)
    },

    updated: function () {
      this.$nextTick(function () {
        this.scrollToPage(this.selectedPageId)
      })
    },

    methods: {
      selectPage: function (page) {
        this.$emit('selectPage', page.id)
      },

      getCarouselSlideStyle: function (page) {
        let width = 200.0 * page.width / page.height
        return {
          width: width + 'px',
          opacity: page.id == this.selectedPageId ? 1 : 0.4
        }
      },

      scrollToPage: function (pageId) {
        let slideIndex = this.pages.findIndex(p => p.id == pageId)
        this.$refs.swiper.swiper.slideTo(slideIndex)
      }
    },

    computed: {
      ...mapState({
        pages: state => state.session.pages
      })
    }
  }

</script>

<style lang="scss" scoped>

  .carousel {
    .swiper-container {
      height: 100%;

      .swiper-slide {
        text-align: center;
        padding: 5px 10px;
        transition: all 0.3s;

        img {
          max-width: 100%;
          max-height: 100%;
        }

        [class*="grid-"] {
          height: 100%;
        }
      }
    }
  }

</style>
