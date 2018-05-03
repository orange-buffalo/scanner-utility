<template>
  <div class="popover" v-bind:class="{ open: isOpen, [name]: true }">
    <div class="popover-trigger" :aria-owns="id" v-on:click="onPopoverToggle">
      <slot name="trigger">
      </slot>
    </div>

    <fade-transition>
      <div class="popover-container" :id="id" v-if="isOpen" v-on:click="onPopoverContentClick">
        <slot name="content"></slot>
      </div>
    </fade-transition>
  </div>
</template>

<script>
  import {FadeTransition} from 'vue2-transitions'

  export default {
    props: {
      name: {
        type: String,
        required: true
      },

      closeOnContentClick: {
        'default': true,
        type: Boolean,
        required: false
      }
    },

    components: {FadeTransition},

    data: function () {
      return {
        isOpen: false
      }
    },

    methods: {
      open: function () {
        this.isOpen = true
        document.documentElement.addEventListener('click', this.close, false)
        this.$emit('open')
      },

      onPopoverToggle: function (e) {
        e.stopPropagation()

        if (this.isOpen) {
          this.close()
          return
        }

        this.open()
      },

      onPopoverContentClick: function (e) {
        e.stopPropagation()
        if (this.closeOnContentClick) {
          this.close()
        }
      },

      removeDocumentEvent: function () {
        document.documentElement.removeEventListener('click', this.close, false)
      },

      close: function () {
        this.isOpen = false
        this.$emit('close')
      }
    },

    computed: {
      id() {
        return `popover-${this.name}`
      }
    },

    mounted: function () {
      this.$on('close', this.removeDocumentEvent)
    },

    beforeDestroy: function () {
      this.removeDocumentEvent()
    }
  }
</script>

<style lang="scss">
  @import "../../styles/var";

  .popover {
    position: relative;
    display: inline-block;

    &-container {
      position: absolute;
      z-index: 1000;
      right: 0;
      background: $overlay-bg-color;
      border-color: $overlay-border-color;
      border-radius: $border-radius;
      top: 45px;
      color: $overlay-txt-color;
      overflow: hidden;
      box-sizing: border-box;
      width: 300px;
      text-align: left;
      box-shadow: 0 0 10px 0 rgba(27, 33, 58, 0.4);
    }
  }
</style>