<template>
  <div style="height: 100vh; width: 100%">
    <div class="msg-content" :class="{ active: getMessageSidebarVisible }">
      <div class="msg-sender">
        <div
          v-if="fileUploadLoadingVisible"
          class="msg-sender-file-loading"
        ></div>
        <div v-if="getMessageFile" class="msg-sender-file">
          <img :src="getMessageFile" />
          <button @click="deleteFile" class="msg-sender-file-delete">
            &#x2715;
          </button>
        </div>
        <div class="msg-sender-text">
          <input
            v-model="userMsg"
            placeholder="Yaz..."
            ref="msgInput"
            @keyup.enter="sendMessage()"
          />
          <label class="btn btn-select-file">
            <input type="file" @change="onFileSelected" accept="image/*" />
          </label>
          <button class="btn btn-send-msg" @click="sendMessage()"></button>
        </div>
      </div>

      <ul class="msg-content-list">
        <li v-for="(msg, index) in getMessageList" :key="index">
          <div v-if="msg.msgText">{{ msg.msgText }}</div>
          <img :src="msg.msgFile" v-if="msg.msgFile" />
          <small>{{ timeConvert(msg.msgDate) }}</small>
        </li>
      </ul>

      <button class="msg-content-close" @click="msgContentVisibleClose">
        &#x2715;
      </button>
    </div>

    <l-map ref="map" v-model:zoom="zoom" :center="[userLat, userLng]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <span v-for="(coord, index) in getServerAllCoordinates" :key="index">
        <l-marker
          @click="getUserID(coord.user_id)"
          :lat-lng="[coord.x, coord.y]"
        >
        </l-marker>
      </span>
    </l-map>
    <div class="buttons">
      <button
        class="btn btn-mobile-map"
        @click="msgContentVisibleClose"
      ></button>
      <button
        v-if="userGroup"
        class="btn btn-share"
        @click="copyGroupLink(userGroup)"
      ></button>
      <button class="btn btn-chat" @click="msgContentVisible">
        <span
          v-if="!getMessageSidebarVisible && getMessageCount > 0"
          class="btn-badge btn-badge-error"
          >{{ getMessageCount }}</span
        >
      </button>
      <button
        v-if="!userGroup"
        class="btn btn-group-create"
        @click="joinGroup"
      ></button>
      <button
        v-if="userGroup"
        class="btn btn-group-left"
        @click="leftGroup"
      ></button>
    </div>
  </div>
</template>

<script>
import { useSocketIo, useSocketMethods } from "../service/socket.js";
import { ref } from "vue";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import moment from "moment";

export default {
  setup() {
    const userGroup = ref(localStorage.getItem("userGroup"));
    const userLat = ref("41.016147");
    const userLng = ref("28.986725");
    const userMsg = ref("");
    const msgInput = ref("");
    const msgFile = ref(null);
    const fileUploadLoadingVisible = ref(false);

    const socket = useSocketIo();
    const [
      getServerAllCoordinates,
      setUserCoordinate,
      setUserJoinGroup,
      setUserLeftGroup,
      sendMessagesServer,
      store,
    ] = useSocketMethods(socket);

    if (document.location.search.split("?g=")[1]) {
      var groupKey = document.location.search.split("?g=")[1];
      localStorage.setItem("userGroup", groupKey);
      userGroup.value = groupKey;
      setUserJoinGroup(groupKey);
    }

    const joinGroup = () => {
      var generatedKey = generateKey(8);
      localStorage.setItem("userGroup", generatedKey);
      userGroup.value = generatedKey;
      setUserJoinGroup(generatedKey);
    };

    const leftGroup = () => {
      localStorage.removeItem("userGroup");
      setUserLeftGroup();
      userGroup.value = null;
    };

    const sendMessage = () => {
      msgFile.value = store.getters.getMessageFile;
      msgInput.value.focus();
      if (userMsg.value.trim().length > 0 || msgFile.value) {
        sendMessagesServer(userMsg.value.trim(), msgFile.value);
        userMsg.value = "";
        deleteFile();
      }
    };

    const getUserCoordinates = () => {
      // console.log("asdf : ",this.coordinates.length)
      const getPos = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        userLat.value = latitude;
        userLng.value = longitude;

        setUserCoordinate({ x: latitude, y: longitude });
        //console.log("gidyyoor", { x: userLat, y: userLng });
      };

      //console.log("izin popup : ", navigator);

      navigator.geolocation.getCurrentPosition(getPos);

      // This will open permission popup
    };

    const generateKey = (length) => {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
      }
      return `g${result}`;
    };

    const onFileSelected = (event) => {
      deleteFile();
      const file = event.target.files[0];
      if (file) {
        fileUploadLoadingVisible.value = true;
      }
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          store.dispatch('newMessageFile', canvas.toDataURL("image/jpeg", 0.8));
          fileUploadLoadingVisible.value = false;
        };
      };
    };

    const deleteFile = () => {
      store.dispatch('newMessageFile', null);
    };

    setInterval(() => {
      getUserCoordinates();
    }, 1000);

    return {
      getServerAllCoordinates,
      joinGroup,
      leftGroup,
      userGroup,
      userLat,
      userLng,
      sendMessage,
      userMsg,
      msgInput,
      msgFile,
      onFileSelected,
      deleteFile,
      fileUploadLoadingVisible,
    };
  },

  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },

  data() {
    return {
      zoom: 16,
    };
  },
  computed: {
    getMessageCount() {
      return this.$store.getters.getMessageCount;
    },
    getMessageSidebarVisible() {
      this.$store.dispatch("resetMessageCount");
      return this.$store.getters.getMessageSidebarVisible;
    },
    getMessageList() {
      return this.$store.getters.getMessageList;
    },
    getMessageFile() {
      return this.$store.getters.getMessageFile;
    }
  },
  methods: {
    timeConvert(date) {
      return moment(date).format("kk:mm");
    },
    getUserID(userId) {
      console.log("user_id : ", userId);
      console.log(
        this.calcDistance("41.102986", "28.889334", "41.036737", "28.985056")
      );
    },
    msgContentVisible() {
      this.$store.dispatch(
        "msgSidebarVisibiltyChange",
        !this.$store.getters.getMessageSidebarVisible
      );
    },
    msgContentVisibleClose() {
      this.$store.dispatch("msgSidebarVisibiltyChange", false);
    },
    copyGroupLink(e) {
      var body = document.querySelector("body");
      var newInput = document.createElement("textarea");
      newInput.value = e;
      newInput.classList.add(e);
      newInput.classList.add("url-copy");
      body.appendChild(newInput);

      var createdElement = document.querySelector(`.${e}`);

      createdElement.select();
      createdElement.setSelectionRange(0, 99999);

      navigator.clipboard.writeText(
        `${document.location.origin}?g=${createdElement.value}`
      );

      toast.info("Grup adresi kopyalandı!", {
        icon: false,
        autoClose: 3000,
        toastClassName: "mobile-toastr",
      });
    },
    calcDistance(lat1, lon1, lat2, lon2) {
      const R = 6371000; // Earth's radius in kilometers
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) *
          Math.cos(this.toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      return distance;
    },

    toRad(degrees) {
      return (degrees * Math.PI) / 180;
    },
  },
};
</script>
