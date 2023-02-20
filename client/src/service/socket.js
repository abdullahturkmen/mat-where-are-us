import {ref} from "vue";
import openSocket from "socket.io-client";
import {toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export function useSocketIo() {
    return openSocket(process.env.VUE_APP_SERVER_ADDRESS, {transports: ['websocket']});
}

export function useSocketMethods(socket) {


    const allUserCoordinates = ref("");
    const allUserMessages = ref("");
    var userMsgList = []

    socket.on("allUserCoordinates", allUserCoordinatesServer => {
        var filteredDatas = []

        allUserCoordinatesServer.filter(e => e.group == undefined).map(e => {
            filteredDatas.push(e)
        })

        if (localStorage.getItem('userGroup')) {
            if (allUserCoordinatesServer.filter(e => e.group === localStorage.getItem('userGroup')).length === 0) {
                localStorage.removeItem('userGroup')
                setUserLeftGroup()
            } else {
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

    const sendMessagesServer = (msg) => {
        userMsgList.push({msgText: msg, msgDate: new Date()})
        allUserMessages.value = userMsgList;
        socket.emit("sendMessagesServer", {msgText: msg, msgDate: new Date()});
        console.log("gönderilen mesajlar : ", allUserMessages.value)
        
    } 
    
    socket.on('newMessage', newMessage => {
        userMsgList.push(newMessage)
        allUserMessages.value = userMsgList;
        toast.success(`${newMessage.msgText} - ${newMessage.msgDate}`, {
            icon: false,
            autoClose: 4000
        })
        console.log("gelen mesajlar : ", allUserMessages.value)
        
    })


    return [
        allUserCoordinates,
        setUserCoordinate,
        setUserJoinGroup,
        setUserLeftGroup,
        sendMessagesServer,
        allUserMessages
    ];
}
