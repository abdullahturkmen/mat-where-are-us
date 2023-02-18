import {ref} from "vue";
import openSocket from "socket.io-client";

export function useSocketIo() {
    return openSocket(process.env.VUE_APP_SERVER_ADDRESS);
}

export function useSocketMethods(socket) {
    const allUserCoordinates = ref("");

    socket.on("allUserCoordinates", allUserCoordinatesServer => {
        allUserCoordinates.value = allUserCoordinatesServer;
    });

    function setUserCoordinate(value) {
        socket.emit("updateCoordinate", value);
    }

    return [allUserCoordinates, setUserCoordinate];
}
