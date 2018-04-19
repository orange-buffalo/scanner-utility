<template>
  <popover name="actions" ref="actionsPopover">
    <div slot="face">
      <simple-button class="actions-button"
                     @click="openActionsPopover"
                     :disabled="!activePageId || !activePage.ready">
        <icon name="bars"></icon>
        &nbsp;
      </simple-button>
    </div>
    <div slot="content">
      <a href="#" @click="saveAsPdf">npmjs.com</a>
    </div>
  </popover>
</template>

<script>
  import SimpleButton from '../SimpleButton.vue'
  import popover from 'vue-popover'
  import {mapGetters, mapActions} from 'vuex'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, popover
    },

    props: ['activePageId'],

    methods: {
      ...mapActions({
        saveAsPdf: 'session/saveAsPdf',
        deletePage: 'session/deletePage'
      }),

      openActionsPopover: function (e) {
        this.$refs.actionsPopover.onPopoverToggle(e)
      },


    },

    created: function () {

    },

    computed: {
      ...mapGetters({
        getPageById: 'session/getPageById'
      }),

      activePage: function () {
        return this.activePageId ? this.getPageById(this.activePageId) : null
      }
    },

    watch: {}
  }
</script>

<style lang="scss" scoped>

  @import "../../styles/var";
  @import "~vue-popover/dist/styles.css";

  .actions-button {
    padding-right: 1px;
    margin-left: 10px;
  }

  .popover {
    display: inline-block;

    .popover__container {
      left: 35px;
      background: white;
      padding: 5px;
      top: 45px;
    }
  }
</style>
