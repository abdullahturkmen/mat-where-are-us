import {ref} from "vue";
import openSocket from "socket.io-client";

export function useSocketIo() {
    return openSocket(process.env.VUE_APP_SERVER_ADDRESS, {transports: ['websocket']});
}

export function useSocketMethods(socket) {


    const allUserCoordinates = ref("");

    socket.on("allUserCoordinates", allUserCoordinatesServer => {
        var filteredDatas = []

        // filteredDatas = allUserCoordinatesServer;

        // Object.entries(allUserCoordinates.value).map(e => console.log('e : ', e[1]))
        // console.log("grup kontrol : ", Object.entries(allUserCoordinates.value).filter(e => e[1].group === localStorage.getItem('userGroup')).length)

        allUserCoordinatesServer.filter(e => e.group == undefined).map(e => {
            filteredDatas.push(e)
        })

        if (localStorage.getItem('userGroup')) {
            if (allUserCoordinatesServer.filter(e => e.group === localStorage.getItem('userGroup')).length === 0) {
                console.log("ifin içi")
                localStorage.removeItem('userGroup')
            } else {
                console.log("elsenin içi")
                filteredDatas = []
                allUserCoordinatesServer.filter(e => e.group === localStorage.getItem('userGroup')).map(e => {
                    filteredDatas.push(e)
                })

            }

        }

        allUserCoordinates.value = filteredDatas;


    });

    const setUserLeftGroup = () => {
        socket.emit("leftGroup");
    }

    const setUserJoinGroup = (value) => {
        socket.emit("joinGroup", value);
    }


    const setUserCoordinate = (value) => {
        socket.emit("updateCoordinate", value);
    }


    return [allUserCoordinates, setUserCoordinate, setUserJoinGroup, setUserLeftGroup];
}
