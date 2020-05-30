<template>
  <div class="app noSelect" id="app" v-cloak>
    <router-view></router-view>
  </div>
</template>

<script>
import firebase from "firebase/app";
import auth from "firebase/auth";
import firestore from "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyAgGBSl_UAMrFGV6KS-ww-LAEMWbKXQvb0",
  authDomain: "f2e-chatroom.firebaseapp.com",
  databaseURL: "https://f2e-chatroom.firebaseio.com",
  projectId: "f2e-chatroom",
  storageBucket: "f2e-chatroom.appspot.com",
  messagingSenderId: "602258961366",
  appId: "1:602258961366:web:d5245c4586ed6226"
};
firebase.initializeApp(firebaseConfig);
export default {
  name: "app",
  components: {},
  mounted: function() {}
};
</script>

<style>
[v-cloak] {
  display: none;
}
html {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}
body {
  position: relative;
  display: block;
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: #1c1c1c;
  color: #f2d68c;
}
.app {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}
.button {
  position: relative;
  display: block;
  text-align: center;
  cursor: pointer;
  border-radius: 10px;
  background-color: #f2d68c;
  letter-spacing: 0.8px;
  color: #1c1c1c;
}
.inputText {
  position: relative;
  display: block;
  width: 100%;
  font-size: 16px;
  outline: 0;
  background-color: transparent;
  border: 1px solid #f2d68c;
  color: #f2d68c;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
}
.block {
  position: relative;
  display: block;
}
.block > .blockTitle {
  position: relative;
  display: block;
  padding: 10px;
  box-sizing: border-box;
}
.block > .blockContent {
  position: relative;
  display: block;
  padding: 5px;
  box-sizing: border-box;
}
</style>
