<template>
  <div class="grid-noGutter-noBottom scanner-button"
       :class="classObject"
       @click="navigateToScanner">
    <div class="col">
      <span class="name">{{scanner.name}}</span><br/>
      <span class="address">at {{scanner.address}}</span>
      <span class="status" v-if="!scanner.isReady">
        <icon name="spinner" spin v-if="scanner.isPending"></icon>
        {{status}}
      </span>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex'
  import {Status} from '../../scanners/scanners-store'

  export default {
    name: 'scanner-button',

    props: ['scanner'],

    methods: {
      ...mapActions({
        setActiveScanner: 'scanners/setActiveScanner'
      }),

      navigateToScanner: function () {
        if (this.scanner.isReady) {
          this.setActiveScanner(this.scanner)
          this.$router.push({name: 'scanner'})
        }
      }
    },

    computed: {
      status: function () {
        switch (this.scanner.status) {
          case Status.PENDING:
            return 'Pending'
          case Status.FAILED:
            return 'Failed'
          case Status.READY:
            return 'Ready'
        }
      },

      classObject: function () {
        return {
          ready: this.scanner.isReady,
          failed: this.scanner.isFailed,
          pending: this.scanner.isPending
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
