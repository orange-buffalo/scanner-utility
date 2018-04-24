<template>
  <popover name="actions" ref="actionsPopover"
           :closeOnContentClick="false"
           @close="resetState">
    <div slot="trigger">
      <simple-button class="actions-button"
                     @click="openActionsPopover"
                     :disabled="!activePageId || !activePage.ready">
        <icon name="bars"></icon>
        &nbsp;
      </simple-button>
    </div>
    <div slot="content" v-if="activePage && activePage.ready">
      <a href="#" @click="savePdf" v-if="pdfFileName">Save</a>

      <a href="#" @click="saveAsPdf">Save As</a>

      <a href="#"
         @click="rotatePage(activePageId)">Rotate</a>

      <a href="#"
         @click="movePageBackward(activePageId)"
         v-if="isMoveBackwardVisible">Move to the beginning</a>

      <a href="#"
         @click="movePageForward(activePageId)"
         v-if="isMoveForwardVisible">Move to the end</a>

      <a href="#"
         @click="showDeleteConfirmation = true"
         v-if="!showDeleteConfirmation">Delete</a>

      <a href="#"
         @click="deleteCurrentPage"
         v-if="showDeleteConfirmation">Confirm</a>

    </div>
  </popover>
</template>

<script>
  import SimpleButton from '../SimpleButton.vue'
  import Popover from './Popover'
  import {mapGetters, mapActions, mapState} from 'vuex'
  import Noty from 'noty'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, Popover
    },

    props: ['activePageId'],

    data: function () {
      return {
        showDeleteConfirmation: false
      }
    },

    methods: {
      ...mapActions({
        saveSessionAs: 'session/saveAsPdf',
        saveSession: 'session/savePdf',
        deletePage: 'session/deletePage',
        rotatePage: 'session/rotatePage',
        movePageBackward: 'session/movePageBackward',
        movePageForward: 'session/movePageForward'
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

        this.$refs.actionsPopover.close()
      },

      saveAsPdf: function () {
        this.saveSessionAs().then(() =>
            new Noty({
              text: `Saved to ${this.pdfFileName}`,
              type: 'success',
              layout: 'bottomCenter',
              timeout: 5000
            }).show()
        )

        this.$refs.actionsPopover.close()
      },

      resetState: function () {
        this.showDeleteConfirmation = false
      },

      deleteCurrentPage: function () {
        this.deletePage(this.activePageId)
        this.$refs.actionsPopover.close()
      }
    },

    computed: {
      ...mapGetters({
        getPageById: 'session/getPageById',
        getPageIndexById: 'session/getPageIndexById'
      }),

      ...mapState({
        pdfFileName: state => state.session.pdfFileName,
        pages: state => state.session.pages
      }),

      activePage: function () {
        return this.activePageId ? this.getPageById(this.activePageId) : null
      },

      isMoveBackwardVisible: function () {
        return this.getPageIndexById(this.activePageId) > 0
      },

      isMoveForwardVisible: function () {
        return this.getPageIndexById(this.activePageId) < this.pages.length - 1
      }
    },

    watch: {}
  }
</script>

<style lang="scss" scoped>

  @import "../../styles/var";

  .actions-button {
    padding-right: 1px;
    margin-left: 10px;
  }

  .popover {
    .popover-container {
      left: 35px;
      background: white;
      padding: 5px;
      top: 45px;
    }
  }
</style>
