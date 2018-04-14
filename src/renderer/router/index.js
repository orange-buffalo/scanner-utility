import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'scanner-selection',
      component: require('@/components/ScannerSelection').default
    },
    {
      path: '/scanner',
      name: 'scanner',
      component: require('@/components/Scanner').default,
      props: true
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
