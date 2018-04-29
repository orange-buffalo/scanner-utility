<template>
  <div class="grid-noGutter-noBottom scanner-button"
       :class="classObject"
       @click="navigateToScanner">
    <div class="col">
      <span class="name">{{scanner.name}}</span><br/>
      <span class="address">at {{scanner.address}}</span>
      <span class="status" v-if="!scanner.isReady">
        <icon name="spinner" width="10px" height="10px" spin v-if="scanner.isPending"></icon>
        {{status}}
      </span>
    </div>
  </div>
</template>

<script>
  import {mapActions, mapGetters} from 'vuex'
  import {Status} from '../../scanners/scanner-api'

  export default {
    name: 'scanner-button',

    props: ['scannerId'],

    methods: {
      ...mapActions({
        setActiveScanner: 'scanners/setActiveScanner'
      }),

      navigateToScanner: function () {
        if (this.scanner.isReady || this.scanner.isScanning) {
          this.setActiveScanner(this.scannerId)
          this.$router.push({name: 'scanner'})
        }
      }
    },

    computed: {
      ...mapGetters({
        getScannerById: 'scanners/getScannerById'
      }),

      status: function () {
        switch (this.scanner.status) {
          case Status.PENDING:
            return 'Pending'
          case Status.FAILED:
            return 'Failed'
          case Status.READY:
            return 'Ready'
          case Status.SCANNING:
            return 'Scanning'
        }
      },

      classObject: function () {
        return {
          ready: this.scanner.isReady || this.scanner.isScanning,
          failed: this.scanner.isFailed,
          pending: this.scanner.isPending
        }
      },

      scanner: function () {
        return this.getScannerById(this.scannerId)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../styles/var";

  .scanner-button {
    border-top: 1px solid;
    border-bottom: 1px solid;
    padding: 15px;
    transition: all 0.3s;
    text-align: center;
    margin-bottom: 40px;
    display: inline-block;
    width: 100%;
    border-color: transparent;

    &.ready {
      &:hover {
        background: lighten($bg-color, 5);
        border-color: $accent-color;
        color: $accent-color;
        .address {
          color: lighten($accent-color, 20);
        }
      }
    }

    .name {
      font-weight: bold;
      display: inline-block;
      margin-right: 5px;
    }

    .address {
      font-size: 70%;
      color: lighten($txt-color, 20);
    }

    .status {
      display: inline-block;
      width: 100%;
      margin-top: 5px;
      font-size: 60%;
    }

    &.failed {
      opacity: 0.5;
      filter: grayscale(100%);
    }

    &.pending {
      opacity: 0.8;
    }
  }
</style>
