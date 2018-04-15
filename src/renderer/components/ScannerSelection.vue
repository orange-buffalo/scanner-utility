<template>
  <div class="content grid-3-middle-center" :key="'scannerSelection'">
    <div class="col">
      <fade-transition group tag="div">
        <scanner-button v-for="scanner in scanners"
                        :key="scanner.id"
                        :scanner="scanner"/>
      </fade-transition>
    </div>
  </div>
</template>

<script>
  import ScannerButton from "./ScannerSelection/ScannerButton"
  import {FadeTransition} from 'vue2-transitions'
  import _ from 'lodash'
  import {mapState, mapActions} from 'vuex'
  import {Status} from '../scanners/scanner-api'

  export default {
    name: 'scanner-selection',

    components: {ScannerButton, FadeTransition},

    methods: {
      ...mapActions({
        startSearching: 'scanners/startSearching'
      })
    },

    created: function () {
      this.startSearching()
    },

    computed: {
      ...mapState({
        unsortedScanners: state => state.scanners.scanners
      }),

      scanners: function () {
        return _.sortBy(this.unsortedScanners, (s) => {
          switch (s.status) {
            case Status.READY:
              return 1
            case Status.PENDING:
              return 2
            case Status.FAILED:
              return 3
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
