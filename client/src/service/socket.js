import {ref} from "vue";
import openSocket from "socket.io-client";

export function useSocketIo() {
    return openSocket('http://localhost:3001');
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
