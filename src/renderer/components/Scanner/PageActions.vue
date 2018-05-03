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
    <div slot="content"
         v-if="activePage && activePage.ready"
         class="popover-body">

      <div class="content-tile session-info">
        <span>{{sessionInfo.pagesCount}} page(s) ({{sessionInfo.totalSize}} raw)</span>
        <span v-if="pdfFileName"> saved to {{pdfFileName}}</span>
        <br/>
        <span v-if="sessionInfo.allChangesSaved">All the changes are saved</span>
        <span class="danger-text" v-if="!sessionInfo.allChangesSaved">Unsaved changes are pending</span>
      </div>

      <div class="content-tile button"
           @click="savePdf"
           v-if="pdfFileName">Save
      </div>

      <div class="content-tile button"
           @click="saveAsPdf">Save As
      </div>

      <div class="content-tile button"
           @click="rotatePage(activePageId)">Rotate
      </div>

      <div class="content-tile button"
           @click="movePageBackward(activePageId)"
           v-if="isMoveBackwardVisible">Move to the beginning
      </div>

      <div class="content-tile button"
           @click="movePageForward(activePageId)"
           v-if="isMoveForwardVisible">Move to the end
      </div>

      <fade-transition mode="out-in">
        <div class="content-tile button"
             :key="'delete-button'"
             @click="showDeleteConfirmation = true"
             v-if="!showDeleteConfirmation">Delete
        </div>

        <div class="content-tile danger-button"
             @click="deleteCurrentPage"
             :key="'confirm-button'"
             v-if="showDeleteConfirmation">Confirm
        </div>
      </fade-transition>

    </div>
  </popover>
</template>

<script>
  import SimpleButton from '../SimpleButton.vue'
  import Popover from './Popover'
  import {mapGetters, mapActions, mapState} from 'vuex'
  import Noty from 'noty'
  import {FadeTransition} from 'vue2-transitions'

  export default {
    name: 'scanner',

    components: {
      SimpleButton, Popover, FadeTransition
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
        getPageIndexById: 'session/getPageIndexById',
        sessionInfo: 'session/getSessionInfo'
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

  .popover-body {
    .content-tile {
      border-bottom: 1px solid $overlay-border-color;
      padding: 10px;
      transition: all 0.3s;

      &:last-child {
        border-bottom: none;
      }
    }

    .session-info {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .danger-text {
      color: $danger-color;
    }

    .button {
      text-align: center;

      &:hover {
        background-color: $overlay-bg-active-color;
      }
    }

    .danger-button {
      @extend .button;

      background-color: $danger-color;
      color: white;
      
      &:hover {
        background-color: lighten($danger-color, 10);
      }
    }
  }
</style>
