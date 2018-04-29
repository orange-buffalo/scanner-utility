<template>
  <div class="progress-bar" :class="progressBarClass">
    <div class="progress-bar-indicator" :style="indicatorStyle">
    </div>
  </div>
</template>

<script>
  export default {
    name: 'progress-bar',

    props: ['percent', 'color'],

    computed: {
      progressBarClass: function () {
        return this.percent ? 'regular' : 'indeterminate'
      },

      indicatorStyle: function () {
        let style = {
          width: this.percent ? `${this.percent}%` : '100%'
        }
        if (this.color) {
          style["background-color"] = this.color
        }
        return style
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../styles/var";

  .progress-bar {
    position: relative;
    height: 2px;
    display: block;
    width: 100%;
    overflow: hidden;

    &.indeterminate {
      background-color: $bg-color;

      .progress-bar-indicator {
        background-color: $txt-color;

        &:before {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }

        &:after {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
          animation-delay: 1.15s;
        }
      }
    }

    &.regular {
      background-color: $txt-color;

      .progress-bar-indicator {
        background-color: #28af33;
        height: 100%;
      }
    }
  }

  @keyframes indeterminate {
    0% {
      left: -35%;
      right: 100%;
    }
    60% {
      left: 100%;
      right: -90%;
    }
    100% {
      left: 100%;
      right: -90%;
    }
  }

  @keyframes indeterminate-short {
    0% {
      left: -200%;
      right: 100%;
    }
    60% {
      left: 107%;
      right: -8%;
    }
    100% {
      left: 107%;
      right: -8%;
    }
  }

</style>
