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
      <a href="#" @click="savePdf" v-if="pdfFileName">Save</a>
      <a href="#" @click="saveAsPdf">Save As</a>
      <a href="#"
         @click="rotatePage(activePageId)"
         v-if="activePage && activePage.ready">Rotate</a>
      <a href="#"
         @click="movePageBackward(activePageId)"
         v-if="moveBackwardVisible">Move to the beginning</a>
    </div>
  </popover>
</template>

<script>
  import SimpleButton from '../SimpleButton.vue'
  import popover from 'vue-popover'
  import {mapGetters, mapActions, mapState} from 'vuex'
  import Noty from 'noty'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, popover
    },

    props: ['activePageId'],

    methods: {
      ...mapActions({
        saveSessionAs: 'session/saveAsPdf',
        saveSession: 'session/savePdf',
        deletePage: 'session/deletePage',
        rotatePage: 'session/rotatePage',
        movePageBackward: 'session/movePageBackward'
      }),

      openActionsPopover: function (e) {
        this.$refs.actionsPopover.onPopoverToggle(e)
      },

      savePdf: function () {
        this.saveSession()
        new Noty({
          text: `Saved to ${this.pdfFileName}`,
          type: 'success',
          layout: 'bottomCenter',
          timeout: 5000
        }).show()
      },

      saveAsPdf: function () {
        this.saveSessionAs()
        new Noty({
          text: `Saved to ${this.pdfFileName}`,
          type: 'success',
          layout: 'bottomCenter',
          timeout: 5000
        }).show()
      }
    },

    computed: {
      ...mapGetters({
        getPageById: 'session/getPageById',
        getPageIndexById: 'session/getPageIndexById'
      }),

      ...mapState({
        pdfFileName: state => state.session.pdfFileName
      }),

      activePage: function () {
        return this.activePageId ? this.getPageById(this.activePageId) : null
      },

      moveBackwardVisible: function () {
        return this.activePage && this.getPageIndexById(this.activePageId) > 0
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
