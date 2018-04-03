<template>
  <div class="grid-noGutter-noBottom scanner-button"
       :class="classObject"
       @click="navigateToScanner">
    <div class="col">
      <span class="name">{{scanner.name}}</span><br/>
      <span class="address">at {{scanner.address}}</span>
      <span class="status" v-if="!isReady">
        <icon name="spinner" spin v-if="isPending"></icon>
        {{status}}
      </span>
    </div>
  </div>
</template>

<script>
  import scanners from '../../services/scanner'
  import events from "../../services/event-bus"

  export default {
    name: 'scanner-button',
    props: {
      scanner: {}
    },
    methods: {
      navigateToScanner: function () {
        if (this.scanner.status == scanners.Status.READY) {
          this.$router.push({name: 'scanner', params: {scannerId: this.scanner.id}})
        }
      }
    },

    computed: {
      status: function () {
        switch (this.scanner.status) {
          case scanners.Status.PENDING:
            return 'Pending'
          case scanners.Status.FAILED:
            return 'Failed'
          case scanners.Status.READY:
            return 'Ready'
        }
      },

      isReady: function () {
        return this.scanner.status == scanners.Status.READY
      },

      isPending: function () {
        return this.scanner.status == scanners.Status.PENDING
      },

      isFailed: function () {
        return this.scanner.status == scanners.Status.FAILED
      }
      ,

      classObject: function () {
        return {
          ready: this.isReady,
          failed: this.isFailed,
          pending: this.isPending
        }

      }
    }

  }
</script>

<style lang="scss" scoped>
  @import "../../styles/var";

  .scanner-button {
    border: 1px solid;
    border-radius: 3px;
    padding: 15px;
    transition: all 0.3s;
    text-align: center;
    margin-bottom: 30px;
    display: inline-block;
    width: 100%;

    &.ready {
      &:hover {
        background: lighten($bg-color, 5);
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
      text-align: right;
      margin-top: 5px;
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
