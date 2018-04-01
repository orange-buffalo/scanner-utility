<template>
  <Row type="flex" class="content" align="middle" justify="center">
    <Col span="12">
      <scanner-button v-for="scanner in scanners"
                      :key="scanner.name"
                      :scanner="scanner"/>
    </Col>
  </Row>
</template>

<script>
  import scanner from "../services/scanner"
  import events from "../services/event-bus"
  import ScannerButton from "./ScannerSelection/ScannerButton"

  export default {
    name: 'scanner-selection',
    components: {ScannerButton},
    data: function () {
      return {
        scanners: []
      }
    },
    created: function () {
      events.on('new-scanner', s => {
        this.scanners.push(s)
      })
      events.on('scanner-update', s => {
        actualScanner = s
      })

      // scanner.startSearching()
      events.emit('new-scanner', {
        name: 'Cannon TS9080 Series',
        address: '192.168.1.1',
        status: scanner.Status.PENDING
      })
    }

  }
</script>

<style lang="scss" scoped>
  .content {
    height: 100%;
    overflow-y: auto;

  }
</style>
