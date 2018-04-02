<template>
  <div class="app-content">
    <router-view></router-view>

    <div class="app-footer">
      <span>&copy; 2018</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'scanner-utility'
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
