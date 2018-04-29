<template>
  <div class="content grid-middle-center">
    <div class="col">
      <fade-transition group tag="div">
        <div class="button-container"
             v-for="scanner in scanners"
             :key="scanner.id">
          <scanner-button :scanner-id="scanner.id"/>
        </div>
      </fade-transition>

      <div class="searching-label">
        <progress-bar></progress-bar>
        <span>searching for scanners...</span>
      </div>
    </div>
  </div>
</template>

<script>
  import ScannerButton from "./ScannerSelection/ScannerButton"
  import {FadeTransition} from 'vue2-transitions'
  import _ from 'lodash'
  import {mapState, mapActions} from 'vuex'
  import {Status} from '../scanners/scanner-api'
  import ProgressBar from './ProgressBar'

  export default {
    name: 'scanner-selection',

    components: {ScannerButton, FadeTransition, ProgressBar},

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
            case Status.SCANNING:
              return 0
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

    .button-container {
      width: 90%;
      margin-left: auto;
      margin-right: auto;

      @media (min-width: 500px) {
        width: 70%;
      }

      @media (min-width: 800px) {
        width: 450px;
      }

      @media (min-width: 1500px) {
        width: 600px;
      }
    }
  }

  .searching-label {
    font-size: 70%;
    text-align: center;
    padding: 5px 20%;

    span {
      display: inline-block;
      padding-top: 5px;
    }
  }
</style>
