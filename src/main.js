import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import Vuex from 'vuex'

Vue.config.productionTip = false

Vue.use(Vuex);
var store = new Vuex.Store({
	state: {
		userInfo:{
		},	    
	},
	mutations: {
		setUserInfo:function(state,data){
			state.userInfo = data;
		}
	}
});

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
