<template>
  <div style="height: 100vh; width: 100%">
    <div class="msg-content" :class="{ active: getMessageSidebarVisible }">
      <div class="msg-sender">
        <input v-model="userMsg" placeholder="Yaz..."/>
        <button class="btn btn-send-msg" @click="sendMessage()"></button>
      </div>

      <ul class="msg-content-list">
        <li v-for="(msg, index) in getMessageList" :key="index">
          {{ msg.msgText }} <small>{{ timeConvert(msg.msgDate) }}</small>
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
          :lat-lng="[coord.x, coord.y]"
          @click="getMarkerCoord(coord.x, coord.y)"
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
      if (userMsg.value.trim().length > 0) {
        sendMessagesServer(userMsg.value.trim());
        userMsg.value = "";
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
      zoom: 6,
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
  },
  methods: {
    timeConvert(date) {
      return moment(date).format("kk:mm");
    },
    getMarkerCoord(x, y) {
      console.log("coodinatlar : ", { xx: x, yy: y });
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
        toastClassName: 'mobile-toastr'
      });
    },
  },
};
</script>
