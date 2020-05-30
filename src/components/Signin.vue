<template>
  <div>
    <div v-if="!signIn">連線中...</div>
    <div v-if="signIn" class="userInfo">
      <div class="domino"></div>
      <div class="mainText"></div>
      <div class="block" id="userInput">
        <div class="blockTitle">輸入您的暱稱</div>
        <div class="blockContent">
          <input class="inputText" v-model="$store.state.userInfo.name" @keyup.13="enter_click" />
          <div @click="enter_click" class="enter button">讓我們暢所欲言</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import firestore from "firebase/firestore";
const Firestore = firebase.firestore;
export default {
  name: "Chatroom",
  props: {},
  data: function() {
    return {
      signIn: false
    };
  },
  beforeCreate: function() {},
  created: function() {
    this.signin();
  },
  watch: {},
  mounted: function() {},
  methods: {
    enter_click: function() {
      if (this.$store.state.userInfo.name === "") {
        alert("輸入您的暱稱");
      } else {
        var that = this;
        var usersColl = Firestore().collection("users");
        usersColl
          .doc(firebase.auth().currentUser.uid)
          .update({
            name: that.$store.state.userInfo.name
          })
          .then(function(snapshot) {
            that.$router.push("/chatroom");
          });
      }
    },
    signin: function() {
      var that = this;
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function() {
          return firebase
            .auth()
            .signInAnonymously()
            .then(function(data) {
              var user = data.user;
              var usersColl = Firestore().collection("users");
              usersColl
                .doc(user.uid)
                .get()
                .then(function(doc) {
                  if (doc.exists) {
                    var data = doc.data();
                    data.user_uid = user.uid;
                    that.$store.commit("setUserInfo", data);
                    that.signIn = true;
                  } else {
                    var userDate = {
                      name: ""
                    };
                    userDate.user_uid = user.uid;
                    usersColl
                      .doc(user.uid)
                      .set(userDate, { merge: true })
                      .then(function(val) {
                        that.$store.commit("setUserInfo", userDate);
                        that.signIn = true;
                      });
                  }
                });
            });
        });
    }
  },
  computed: {}
};
</script>

<style scoped>
.userInfo {
  text-align: center;
}
.domino {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 240px;
  margin: 10px 0px;
  background-position: center;
  background-size: auto 100%;
  background-repeat: no-repeat;
  background-image: url(../assets/img/domino.svg);
}
.mainText {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 60px;
  margin: 10px 0px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url(../assets/img/mainText.svg);
  max-width: 280px;
}
#userInput {
  max-width: 300px;
  margin: 0 auto;
}
#userInput .inputText {
  margin-bottom: 5px;
  font-size: 12px;
  text-align: center;
  color: #fff;
}
#userInput .enter {
  font-size: 12px;
  padding: 10px;
}
</style>
