<template>
  <div style="height: 100vh; width: 100%">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="[this.clientLat, this.clientLng]"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <span v-for="(coord, index) in getServerAllCoordinates" :key="index">
        <l-marker :lat-lng="[coord.x, coord.y]"> </l-marker>
      </span>
    </l-map>
    <button v-if="!userGroup" class="btn btn-group-create" @click="createGroup">
      Create Group
    </button>
    <button v-if="userGroup" class="btn btn-group-left" @click="leftGroup">
      Left Group
    </button>
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
    var userLat = null;
    var userLng = null;
    const socket = useSocketIo();
    const [getServerAllCoordinates, setUserCoordinate] =
      useSocketMethods(socket);

    const createGroup = () => {
      console.log("grup kurulacak");
      localStorage.setItem("userGroup", "denemex");
      userGroup.value = "asfsadf";
    };

    const leftGroup = () => {
      console.log("gruptan çıkıldı");
      localStorage.removeItem("userGroup");
      userGroup.value = null;
    };

    const getUserCoordinates = () => {
      // console.log("asdf : ",this.coordinates.length)
      const getPos = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        userLat = latitude;
        userLng = longitude;

        setUserCoordinate({ x: userLat, y: userLng });
        //console.log("gidyyoor", { x: userLat, y: userLng });
      };

      // This will open permission popup
      navigator.geolocation.getCurrentPosition(getPos);
    };
    setInterval(() => {
      getUserCoordinates();
    }, 1000);
    return {
      getServerAllCoordinates,
      createGroup,
      leftGroup,
      userGroup,
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
      clientLat: 41.016147,
      clientLng: 28.986725,
      zoom: 5,
    };
  },
  created() {
    this.getUserCoordinates();
  },

  methods: {
    getUserCoordinates() {
      setInterval(() => {
        // console.log("asdf : ",this.coordinates.length)
        const getPos = (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          this.clientLat = latitude;
          this.clientLng = longitude;

          // this.coordinates.pop()

          // this.coordinates.push({ x: latitude, y: longitude });

          // console.log(`lat : ${latitude} - lng : ${longitude}`);

          //this.calculateDistance('41.1003848', '28.8835792', '37.8468', '29.0848')

          // Do something with the position
        };

        // This will open permission popup
        navigator.geolocation.getCurrentPosition(getPos);
      }, 1000);
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      var R = 10000; // km
      var dLat = this.toRad(lat2 - lat1);
      var dLon = this.toRad(lon2 - lon1);
      var lat1 = this.toRad(lat1);
      var lat2 = this.toRad(lat2);

      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
          Math.sin(dLon / 2) *
          Math.cos(lat1) *
          Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;

      return d;
    },
    toRad(Value) {
      return (Value * Math.PI) / 180;
    },
  },
};
</script>
