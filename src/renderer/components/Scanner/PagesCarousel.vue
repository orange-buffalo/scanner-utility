<template>
  <div class="carousel">
    <swiper :options="swiperOption" ref="swiper" class="swiper-no-swiping">
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
      prop: 'selected-page-id',
      event: 'select-page'
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
        this.$emit('select-page', page.id)
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
  @import "~sass-svg-uri/svg-uri";
  @import "../../styles/var";

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

      .swiper-button-prev {
        background-image: svg-uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 44"><path d="M0,22L22,0l2.1,2.1L4.2,22l19.9,19.9L22,44L0,22L0,22L0,22z" fill="#{$txt-color}"/></svg>');
      }

      .swiper-button-next {
        background-image: svg-uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 44"><path d="M27,22L27,22L5,44l-2.1-2.1L22.8,22L2.9,2.1L5,0L27,22L27,22z" fill="#{$txt-color}"/></svg>');
      }

      .swiper-button-prev, .swiper-button-next {
        &:focus {
          outline: none;
        }
      }

    }
  }

</style>
