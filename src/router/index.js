import Vue from 'vue'
import VueRouter from 'vue-router'
import Root from '@/components/Root'
import Signin from '@/components/Signin'
import Chatroom from '@/components/Chatroom'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/signin',
    component: Root,
    meta: {
    },
    children:[
      {
        path: 'signin',
        component: Signin,
        meta: {
        }
      },
      {
        path: 'chatroom',
        component: Chatroom,
        meta: {
        }
      }
    ]
  }   
];

const router = new VueRouter({
  routes:routes
});


export default router;