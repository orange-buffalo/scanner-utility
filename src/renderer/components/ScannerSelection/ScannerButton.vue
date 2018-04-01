<template>
  <Row class="button-container">
    <Col>
      <span>{{scanner.name}}</span>
    </Col>
  </Row>
</template>

<script>
  export default {
    name: 'scanner-button',
    props: {
      scanner: {}
    }

  }
</script>

<style lang="scss" scoped>
  .button-container {
    &:hover {
      background: red;

    }

  }
</style>
