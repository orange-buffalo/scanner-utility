<template>
  <div class="scanner-page grid-middle-noGutter-noBottom">
    <div class="col page-container">
      <img :src="page.fileName"
           v-if="page"
           :width="thumbnailWidth"
           :height="thumbnailHeight"/>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'scanner-page',
    props: ['page'],

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
        this.recalculatePageSize(val)
      }
    },

    computed: {}
  }
</script>

<style lang="scss" scoped>
  @import "../../styles/var";

  .scanner-page {
    height: 100%;

    .page-container {
      overflow: auto;
      height: 100%;
      box-sizing: border-box;
      padding: 40px;
      text-align: center;
      background-color: #494949;
    }
  }

</style>
