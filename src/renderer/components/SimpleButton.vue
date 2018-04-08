<template>
  <div class="button" @click.stop="onClick">
    <slot></slot>
  </div>
</template>

<script>

  export default {
    name: 'simple-button',

    props: ['classes'],

    methods: {
      onClick: function () {
        this.$emit('click')
      }
    },

    computed: {

    }
  }

</script>

<style lang="scss" scoped>
  @import "../styles/var";

  .button {
    display: inline-block;
    padding: 5px;
    background-color: #b16f6f;
  }

</style>
