<template>
  <div style="height: 100vh; width: 100%">
    <div>
      <input v-model="userMsg" />
      <button @click="sendMessage(userMsg)">gönder</button>
    </div>

    <ul>
      <li v-for="(msg, index) in getNewMessages" :key="index">{{ msg }}</li>
    </ul>

    <l-map ref="map" v-model:zoom="zoom" :center="[userLat, userLng]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <span v-for="(coord, index) in getServerAllCoordinates" :key="index">
        <l-marker :lat-lng="[coord.x, coord.y]"> </l-marker>
      </span>
    </l-map>
    <div class="buttons">
      <button class="btn btn-chat" >
        Comments
      </button>
      <button v-if="userGroup" class="btn btn-share">
        Share
      </button>
      <button
        v-if="!userGroup"
        class="btn btn-group-create"
        @click="createGroup"
      >
        Create Group
      </button>
      <button v-if="userGroup" class="btn btn-group-left" @click="leftGroup">
        Left Group
      </button>
    </div>
  </div>
</template>

<script>
import { useSocketIo, useSocketMethods } from "../service/socket.js";
import { ref } from "vue";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";

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
      getNewMessages,
    ] = useSocketMethods(socket);

    const createGroup = () => {
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

    const sendMessage = (e) => {
      userMsg.value = "";
      sendMessagesServer(e);
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

      console.log("izin popup : ", navigator.geolocation)

      // This will open permission popup
      navigator.geolocation.getCurrentPosition(getPos);
    };

    const generateKey = (length) => {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/+";
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
      }
      return result;
    };

    setInterval(() => {
      getUserCoordinates();
    }, 1000);

    return {
      getServerAllCoordinates,
      createGroup,
      leftGroup,
      userGroup,
      userLat,
      userLng,
      sendMessage,
      userMsg,
      getNewMessages,
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
};
</script>
