<template>
  <div class="button"
       :class="styleClasses"
       @click.stop="onClick">
    <slot></slot>
  </div>
</template>

<script>

  export default {
    name: 'simple-button',

    props: ['disabled'],

    methods: {
      onClick: function (e) {
        if (!this.disabled) {
          this.$emit('click', e)
        }
      }
    },

    computed: {
      styleClasses: function () {
        return this.disabled ? 'disabled' : ''
      }
    }
  }

</script>

<style lang="scss" scoped>
  @import "../styles/var";

  .button {
    display: inline-block;

    position: relative;
    line-height: 1;
    padding: 10px 15px 10px 45px;
    border-radius: 2px;
    border: 1px solid darken($txt-color, 20);
    transition: all 0.3s;

    &:hover {
      background-color: lighten($bg-color, 5);
    }

    &.disabled {
      background-color: $bg-color;
      border-color: lighten($bg-color, 20);
      color: lighten($bg-color, 20);
    }

    .fa-icon {
      position: absolute;
      top: 50%;
      left: 15px;
      transform: translateY(-60%);
      height: 20px;
      width: 20px;
    }
  }

</style>
