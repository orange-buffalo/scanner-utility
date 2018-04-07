<template>
  <slide-y-up-transition>
    <div class="content grid-3-middle-center">
      <div class="col">
        <fade-transition group tag="div">
          <scanner-button v-for="scanner in scanners"
                          :key="scanner.id"
                          :scanner="scanner"/>
        </fade-transition>
      </div>
    </div>
  </slide-y-up-transition>
</template>

<script>
  import scanner from "../services/scanner"
  import events from "../services/event-bus"
  import ScannerButton from "./ScannerSelection/ScannerButton"
  import {FadeTransition, SlideYUpTransition} from 'vue2-transitions'
  import _ from 'lodash'

  export default {
    name: 'scanner-selection',

    components: {ScannerButton, FadeTransition, SlideYUpTransition},

    created: function () {
      // scanner.startSearching()
    },

    computed: {
      scanners: function () {
        return _.sortBy(this.$store.state.scanners, (s) => {
          switch (s.status) {
            case scanner.Status.READY: return 1
            case scanner.Status.PENDING: return 2
            case scanner.Status.FAILED: return 3
          }
          return 42
        })
      }
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
