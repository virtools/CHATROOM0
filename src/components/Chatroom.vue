<template>
  <div class="chatroom">
    <div class="block" id="online">
      <div class="blockTitle">線上：</div>
      <div class="blockContent">
        <template v-for="(item,key) in onlineUserDate">
          <div :key="key" class="item" v-if="key!==$store.state.userInfo.user_uid">{{item.name}}</div>
        </template>
      </div>
    </div>

    <template v-if="!roomItem">
      <div class="block" id="room">
        <div class="blockTitle">
          <div @click="add_click" class="add button">+</div>房間內容
        </div>
        <div class="blockContent">
          <div v-for="(item) in roomDate" :key="item.id" @click="roomDate_click(item)" class="item">
            <div class="button">{{item.name||item.id}}</div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="block" id="message">
        <div class="blockTitle">
          <div @click="back_click" class="back button">←</div>
          {{roomItem.name}}
        </div>
        <div class="blockContent" ref="messageContent">
          <table class="messageTable">
            <tbody>
              <template v-for="(item) in messageDateDisplay">
                <template v-if="item.user_uid!==$store.state.userInfo.user_uid">
                  <tr :key="item.id" class="messageBox other">
                    <td>
                      <div class="name">{{item.name}}</div>
                      <div class="mainText">
                        <div class="text" v-if="!item.texture">{{item.message}}</div>
                        <div
                          class="img"
                          :style="{backgroundImage: `url(${textureDate[item.message].src})`}"
                          v-else
                        ></div>
                        <div
                          class="time"
                          v-if="item.date"
                        >{{getDate(new Date(item.date.seconds*1000).getTime())}}</div>
                      </div>
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr :key="item.id" class="messageBox self">
                    <td>
                      <div class="mainText">
                        <div
                          class="time"
                          v-if="item.date"
                        >{{getDate(new Date(item.date.seconds*1000).getTime())}}</div>
                        <div class="text" v-if="!item.texture">{{item.message}}</div>
                        <div
                          class="img"
                          :style="{backgroundImage: `url(${textureDate[item.message].src})`}"
                          v-else
                        ></div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div class="sendBox">
        <input class="inputText" v-model="message" @keyup.13="send_click" />
        <div class="other">
          <div @click="textureIcon_click" class="textureIcon button"></div>
        </div>
        <div @click="send_click" class="send button">→</div>
        <div class="textures" v-if="texturesBool">
          <div
            v-for="(item,key) in textureDate"
            :key="key"
            class="item"
            @click="sendTexture_click(key)"
          >
            <div class="button" :style="{backgroundImage: `url(${item.src})`}"></div>
          </div>
        </div>
      </div>
    </template>

    <div class="roomInfo" v-if="addRoom">
      <div class="block" id="roomInput">
        <div class="blockTitle">
          <div @click="addRoomBack_click" class="back button">←</div>輸入聊天房間名稱
        </div>
        <div class="blockContent">
          <input class="inputText" v-model="inputRoom" @keyup.13="ok_click" />
          <div @click="ok_click" class="ok button">確定</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase, { functions } from "firebase/app";
import firestore from "firebase/firestore";
import database from "firebase/database";
import moment from "moment";
import { setTimeout } from "timers";

const Firestore = firebase.firestore;
const Database = firebase.database;
export default {
  name: "Chatroom",
  props: {},
  data: function() {
    return {
      message: "",
      messagesColl: null,
      messageDate: [],
      unMessagesColl: null,
      roomsColl: null,
      roomDate: [],
      unRoomsColl: null,
      onlineUserDate: {},
      onlineDate: [],
      roomItem: null,
      signOut: false,
      dateFormat: "YYYY-MM-DD hh:mm",
      addRoom: false,
      inputRoom: "",
      textureDate: {
        img000001: { src: "./texture/img000001.png" },
        img000002: { src: "./texture/img000002.png" }
      },
      texturesBool: false
    };
  },
  beforeCreate: function() {},
  created: function() {
    var that = this;
    var currentUser = firebase.auth().currentUser;
    if (currentUser) {
      this.loadRooms();
      this.onlineSnapshot();
      this.onlineUserSnapshot();
    } else {
      this.$router.push("/signin");
    }
  },
  watch: {},
  mounted: function() {},
  methods: {
    checkPrev: function(messageDateDisplay, index) {
      if (index === 0) {
        return true;
      }
      if (
        messageDateDisplay[index - 1].user_uid !==
          messageDateDisplay[index].user_uid ||
        messageDateDisplay[index - 1].name !== messageDateDisplay[index].name
      ) {
        return true;
      }
    },
    onlineSnapshot: function() {
      var uid = firebase.auth().currentUser.uid;
      var userStatusDatabaseRef = Database().ref("/status/" + uid);
      var isOfflineForDatabase = {
        state: "offline",
        last_changed: Database.ServerValue.TIMESTAMP
      };

      var isOnlineForDatabase = {
        state: "online",
        last_changed: Database.ServerValue.TIMESTAMP
      };
      var userStatusFirestoreRef = Firestore().doc("/status/" + uid);
      var isOfflineForFirestore = {
        state: "offline",
        last_changed: Firestore.FieldValue.serverTimestamp()
      };
      var isOnlineForFirestore = {
        state: "online",
        last_changed: Firestore.FieldValue.serverTimestamp()
      };
      Database()
        .ref(".info/connected")
        .on("value", function(snapshot) {
          if (snapshot.val() == false) {
            userStatusFirestoreRef.set(isOfflineForFirestore);
            return;
          }

          userStatusDatabaseRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(function() {
              userStatusDatabaseRef.set(isOnlineForDatabase);
              userStatusFirestoreRef.set(isOnlineForFirestore);
            });
        });
    },
    onlineUserSnapshot: function() {
      var that = this;
      Firestore()
        .collection("status")
        .where("state", "==", "online")
        .onSnapshot(function(snapshot) {
          snapshot.docChanges().forEach(function(change) {
            if (change.type === "added" || change.type === "modified") {
              Firestore()
                .collection("users")
                .doc(change.doc.id)
                .get()
                .then(function(doc) {
                  that.$set(that.onlineUserDate, change.doc.id, doc.data());
                });
            } else if (change.type === "removed") {
              that.$delete(that.onlineUserDate, change.doc.id);
            }
          });
        });
    },
    roomDate_click: function(item) {
      this.openRoom(item);
    },
    openRoom: function(item) {
      this.roomItem = item;
      this.messageDate = [];
      this.loadMessages(this.roomItem.id);
      if (this.unRoomsColl) {
        this.unRoomsColl();
        this.unRoomsColl = null;
      }
    },
    loadRooms: function() {
      if (this.unRoomsColl) {
        this.unRoomsColl();
      }
      var that = this;
      this.roomsColl = Firestore().collection("rooms");
      this.unRoomsColl = this.roomsColl.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          that.setData(that.roomDate, change);
        });
      });
    },
    send_click: function() {
      if (this.message !== "") {
        this.messagesColl.add({
          user_uid: this.$store.state.userInfo.user_uid,
          name: this.$store.state.userInfo.name,
          message: this.message,
          date: Firestore.FieldValue.serverTimestamp()
        });
        this.message = "";
      }
    },
    back_click: function() {
      this.roomDate = [];
      this.roomItem = null;
      this.loadRooms();
    },
    add_click: function() {
      this.addRoom = true;
    },
    addRoomBack_click: function() {
      this.addRoom = false;
    },
    ok_click: function() {
      if (this.inputRoom === "") {
        alert("請輸入聊天房間名稱");
      } else {
        var that = this;
        this.roomsColl
          .add({
            name: this.inputRoom
          })
          .then(function(snapshot) {
            snapshot.get().then(function(doc) {
              var data = doc.data();
              data.id = doc.id;
              that.openRoom(data);
            });
          });
        this.addRoom = false;
      }
    },
    sendTexture_click: function(id) {
      this.texturesBool = false;
      this.messagesColl.add({
        user_uid: this.$store.state.userInfo.user_uid,
        name: this.$store.state.userInfo.name,
        message: id,
        texture: true,
        date: Firestore.FieldValue.serverTimestamp()
      });
    },
    textureIcon_click: function() {
      this.texturesBool = !this.texturesBool;
    },
    loadMessages: function(name) {
      if (this.unMessagesColl) {
        this.unMessagesColl();
      }
      var that = this;
      this.messagesColl = this.roomsColl.doc(name).collection("messages");
      this.unMessagesColl = this.messagesColl
        .orderBy("date", "desc")
        .limit(50)
        .onSnapshot(function(snapshot) {
          snapshot.docChanges().forEach(function(change) {
            that.setData(that.messageDate, change);
          });
          that.$nextTick(function() {
            var messageContent = that.$refs.messageContent;
            messageContent.scrollTop =
              messageContent.scrollHeight - messageContent.offsetHeight;
          });
        });
    },
    setData: function(data, change) {
      var temp = change.doc.data();
      temp.id = change.doc.id;
      if (change.type === "added") {
        data.splice(change.newIndex, 0, temp);
      } else if (change.type === "modified") {
        data.splice(change.newIndex, 1, temp);
      } else if (change.type === "removed") {
        data.splice(change.oldIndex, 1);
      }
    },
    getDate: function(time) {
      return moment(time).format(this.dateFormat);
    }
  },
  computed: {
    messageDateDisplay: function() {
      return [].concat(this.messageDate).reverse();
    }
  }
};
</script>

<style scoped>
.chatroom {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0px;
  padding-bottom: 40px;
  box-sizing: border-box;
  padding-top: 40px;
}
#room {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  top: 0px;
  padding-bottom: 40px;
  box-sizing: border-box;
  padding-top: 40px;
  left: 0px;
}
#room > .blockContent {
  height: 100%;
  overflow: auto;
}
#room > .blockTitle {
  border-bottom: 1px solid #f2d68c;
  height: 40px;
  line-height: 40px;
  padding: 0;
  padding-left: 40px;
  text-align: center;
}
#room .item {
  min-width: 33.33333%;
  box-sizing: border-box;
}
#room .add {
  position: absolute;
  display: block;
  left: 5px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  top: 5px;
  color: #f2d68c;
  background-color: transparent;
  box-sizing: border-box;
}

#message {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  top: 0px;
  padding-bottom: 40px;
  box-sizing: border-box;
  padding-top: 40px;
  left: 0px;
}
#message > .blockContent {
  height: 100%;
  overflow: auto;
}
#message > .blockTitle {
  border-bottom: 1px solid #f2d68c;
  height: 40px;
  line-height: 40px;
  padding: 0;
  padding-left: 40px;
  text-align: center;
}
#message .back {
  position: absolute;
  display: block;
  left: 5px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  top: 5px;
  color: #f2d68c;
  background-color: transparent;
  box-sizing: border-box;
}
#online {
  position: absolute;
  display: flex;
  height: 40px;
  width: 100%;
  top: 0px;
  left: 0px;
  border-bottom: 1px solid #f2d68c;
}
#online > .blockTitle {
  border: 0;
}

.roomInfo {
  position: fixed;
  display: flex;
  background-color: rgba(28, 28, 28, 0.9);
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  justify-content: center;
  align-items: center;
}
#roomInput {
  min-width: 350px;
  border: 1px solid #f2d68c;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 10px;
}

#roomInput > .blockTitle {
  border-bottom: 1px solid #f2d68c;
  height: 40px;
  line-height: 40px;
  padding: 0;
  padding-left: 40px;
  text-align: center;
}
#roomInput .inputText {
  margin-bottom: 5px;
  font-size: 12px;
  text-align: center;
  color: #fff;
}
#roomInput .back {
  position: absolute;
  display: block;
  left: 5px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  top: 5px;
  color: #f2d68c;
  background-color: transparent;
  box-sizing: border-box;
}
#roomInput .ok {
  font-size: 12px;
  padding: 10px;
}
.messageBox {
  position: relative;
  margin: 1px 0px;
}

.messageBox .name {
  position: relative;
  display: block;
  width: 100px;
  font-size: 12px;
}
.messageBox .mainText {
  position: relative;
  font-size: 18px;
}
.messageBox .mainText .text {
  position: relative;
  display: inline-block;
  padding: 10px;
}
.messageBox .mainText .img {
  position: relative;
  display: inline-block;
  width: 128px;
  height: 128px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}
.messageBox .mainText .time {
  position: relative;
  display: inline-block;
  font-size: 12px;
  margin: 0px 5px;
  vertical-align: bottom;
}
.messageTable {
  position: relative;
  width: 100%;
}

.messageBox.other .mainText .text {
  border: 1px solid #f2d68c;
  border-radius: 0px 10px 10px 10px;
  color: #f2d68c;
}

.messageBox.self {
  text-align: right;
}
.messageBox.self .mainText .text {
  background-color: #f2d68c;
  border-radius: 10px 0px 10px 10px;
  color: #1c1c1c;
}

.item {
  position: relative;
  display: inline-block;
  padding: 5px;
}
#online .item {
  border: 1px solid #f2d68c;
  border-radius: 10px;
  font-size: 12px;
  box-sizing: border-box;
  height: 30px;
  line-height: 30px;
  padding: 0 5px;
  box-sizing: border-box;
}
#room .item .button {
  margin: 5px;
  padding: 20px;
}

.sendBox {
  position: fixed;
  display: block;
  bottom: 0px;
  width: 100%;
}
.sendBox .inputText {
  position: relative;
  display: block;
  width: 100%;
  height: 40px;
  border-radius: 0px;
  border: 0;
  border-top: 1px solid #f2d68c;
  color: #fff;
  padding-right: 45px;
  padding-left: 45px;
}
.sendBox .send,
.sendBox .textureIcon {
  position: absolute;
  display: block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  top: 5px;
  color: #f2d68c;
  background-color: transparent;
  box-sizing: border-box;
}
.sendBox .send {
  right: 5px;
}
.sendBox .other {
  position: absolute;
  display: block;
  top: 0px;
  left: 0px;
}
.sendBox .textureIcon {
  position: absolute;
  display: block;
  left: 5px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url(../assets/img/textureIcon.png);
}
.textures {
  position: absolute;
  display: block;
  bottom: 100%;
}
.textures .button {
  width: 48px;
  height: 48px;
  background-position: center;
  background-size: 80%;
  background-repeat: no-repeat;
  background-color: #1c1c1c;
  border: 1px solid #f2d68c;
}
</style>
