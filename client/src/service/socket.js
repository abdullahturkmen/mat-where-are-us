import {ref} from "vue";
import openSocket from "socket.io-client";

export function useSocketIo() {
    return openSocket(process.env.VUE_APP_SERVER_ADDRESS, {transports: ['websocket']});
}

export function useSocketMethods(socket) {


    const allUserCoordinates = ref("");

    socket.on("allUserCoordinates", allUserCoordinatesServer => {
        var filteredDatas = []

        filteredDatas = allUserCoordinatesServer;

        // console.log("11111 : ", allUserCoordinatesServer)
        // Object.entries(allUserCoordinates.value).map(e => console.log('e : ', e[1]))
        // console.log("grup kontrol : ", Object.entries(allUserCoordinates.value).filter(e => e[1].group === localStorage.getItem('userGroup')).length)

        if (localStorage.getItem('userGroup')) {


            if (Object.entries(allUserCoordinates.value).filter(e => e[1].group === localStorage.getItem('userGroup')).length === 0) {
                localStorage.removeItem('userGroup')
            } else {
                filteredDatas = []
                Object.entries(allUserCoordinates.value).filter(e => e[1].group === localStorage.getItem('userGroup')).map(e => {
                    filteredDatas.push(e[1])
                })

            }

        }

        allUserCoordinates.value = filteredDatas;


    });


    const setUserCoordinate = (value) => {
        socket.emit("updateCoordinate", value);
    }

    return [allUserCoordinates, setUserCoordinate];
}
