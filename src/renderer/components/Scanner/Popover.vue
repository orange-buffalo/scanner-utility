<template>
  <div class="popover" v-bind:class="{ open: isOpen, [name]: true }">
    <div class="popover-trigger" :aria-owns="id" v-on:click="onPopoverToggle">
      <slot name="trigger">
      </slot>
    </div>

    <div class="popover-container" :id="id" v-if="isOpen" v-on:click="onPopoverContentClick">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>

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

    data: function () {
      return {
        isOpen: false
      }
    },

    methods: {
      open: function () {
        this.isOpen = true
        document.documentElement.addEventListener('click', this.close, false)
        this.$emit('popover:open')
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
        this.$emit('popover:close')
      }
    },

    computed: {
      id() {
        return `popover-${this.name}`
      }
    },

    mounted: function () {
      this.$on('popover:close', this.removeDocumentEvent)
    },

    beforeDestroy: function () {
      this.removeDocumentEvent()
    }
  }
</script>

<style lang="scss">

  .popover {
    position: relative;
    display: inline-block;

    &-container {
      position: absolute;
      z-index: 1000;
      left: 0;
    }
  }
</style>