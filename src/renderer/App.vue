<template>
  <Layout>
    <Content class="app-content">
      <router-view></router-view>
    </Content>
    <Footer class="app-footer">
      <span>&copy; 2018</span>
    </Footer>
  </Layout>
</template>

<script>
  export default {
    name: 'scanner-utility'
  }
</script>

<style lang="less">
  /*@import '../../node_modules/reset-css/reset';*/
  @import './iview';
  @import './main';

  .app-content {
    height: 100vh;
    box-sizing: border-box;
    padding-bottom: 69px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .app-footer {
    position: fixed;
    left: 0;
    bottom: 0;
  }
</style>
