<template>
  <div class="appContent">
    <router-view></router-view>
  </div>
</template>

<script>
import firebase from "firebase/app";
import firestore from "firebase/firestore";
import database from "firebase/database";
const Firestore = firebase.firestore;

export default {
  components: {},
  props: {},
  data: function() {
    return {};
  },
  created: function() {},
  methods: {}
};
</script>

<style scoped>
.appContent {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}
</style>