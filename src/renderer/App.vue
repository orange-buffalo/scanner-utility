<template>
  <div class="app-content">
    <slide-y-down-transition mode="out-in">
      <router-view></router-view>
    </slide-y-down-transition>

    <div class="app-footer">
      <span>&copy; 2018</span>
    </div>
  </div>
</template>

<script>
  import {SlideYDownTransition} from 'vue2-transitions'

  export default {
    name: 'scanner-utility',

    components: {SlideYDownTransition}
  }
</script>

<style lang="scss">
  .app-content {
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 70px;
  }

  .app-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    height: 70px;
    padding: 15px;
    width: 100%;
    box-sizing: border-box;
  }
</style>
