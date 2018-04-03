<template>
  <slide-y-down-transition  >
  <div class="content grid-3-middle-center">
    <div class="col" @click="back">
      privet
    </div>
  </div>
  </slide-y-down-transition>
</template>

<script>
  import scanner from "../services/scanner"
  import events from "../services/event-bus"
  import ScannerButton from "./ScannerSelection/ScannerButton"
  import { SlideYDownTransition } from 'vue2-transitions'


  let testcounter = 1

  export default {
    name: 'scanner-selection',
    components: {ScannerButton, SlideYDownTransition},
    data: function () {
      return {
        scanners: []
      }
    },
    methods: {
      back: function () {
        this.$router.push("/")

      }
    },
    created: function () {
      setTimeout(() => {
        events.emit('new-scanner', {
        name: 'Cannon TS9080 Series - Pending',
        address: '192.168.1.1',
        status: scanner.Status.PENDING
      })
      }, 2000)

      setTimeout(() => {
        events.emit('new-scanner', {
        name: 'Cannon TS9080 Series - Ready',
        address: '192.168.1.1',
        status: scanner.Status.READY
      })
      }, 5000)

      setTimeout(() => {
        events.emit('new-scanner', {
        name: 'Cannon TS9080 Series - Failed',
        address: '192.168.1.1',
        status: scanner.Status.FAILED
      })
      }, 10000)



      events.on('new-scanner', s => {
        this.scanners.push(s)
        this.scanners.sort((a, b) => {
          let orders = []
          orders[scanner.Status.READY] = 1
          orders[scanner.Status.PENDING] = 2
          orders[scanner.Status.FAILED] = 3
          return orders[a.status] - orders[b.status]
        })
      })
      events.on('scanner-update', s => {
        this.scanners.sort((a, b) => {
          let orders = []
          orders[scanner.Status.READY] = 1
          orders[scanner.Status.PENDING] = 2
          orders[scanner.Status.FAILED] = 3
          return orders[a.status] - orders[b.status]
        })
      })

      // scanner.startSearching()
      events.emit('new-scanner', {
        name: 'Cannon TS9080 Series',
        address: '192.168.1.1',
        status: scanner.Status.PENDING
      })

      events.emit('new-scanner', {
        name: 'Cannon PIXMA MG7550 Series',
        address: '192.168.1.170',
        status: scanner.Status.READY
      })

      events.emit('new-scanner', {
        name: 'HP Test Connection Scanner New Generation',
        address: '192.168.45.170',
        status: scanner.Status.FAILED
      })

      events.emit('new-scanner', {
        name: 'Cannon TS6000 Series',
        address: 'companthost',
        status: scanner.Status.PENDING
      })
    }

  }
</script>

<style lang="scss" scoped>
  .content {
    min-height: 100%;
    overflow-y: auto;
    padding-top: 30px;
  }
</style>
