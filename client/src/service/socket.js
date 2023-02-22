import {ref} from "vue";
import openSocket from "socket.io-client";
import {toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import store from '@/store/index.js';

export function useSocketIo() {
    return openSocket(process.env.VUE_APP_SERVER_ADDRESS, {transports: ['websocket']});
}

export function useSocketMethods(socket) {


    const allUserCoordinates = ref("");

    socket.on("allUserCoordinates", allUserCoordinatesServer => {
        var filteredDatas = []

        allUserCoordinatesServer.filter(e => e.group == undefined).map(e => {
            filteredDatas.push(e)
        })

        if (localStorage.getItem('userGroup')) {
            if (allUserCoordinatesServer.filter(e => e.group === localStorage.getItem('userGroup')).length === 0) {
                localStorage.removeItem('userGroup')
                // setUserLeftGroup()
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
        store.dispatch('newMessage', {
            msgText: msg,
            msgDate: new Date()
        });

        socket.emit("sendMessagesServer", {
            msgText: msg,
            msgDate: new Date()
        });
    };

    socket.on('newMessage', newMessage => {

        var filteredMessages = null

        filteredMessages = newMessage
        if (localStorage.getItem('userGroup') || newMessage.hasOwnProperty('group')) {
            filteredMessages = null

            if (newMessage.hasOwnProperty('group')) {

                if (newMessage.group === localStorage.getItem('userGroup')) {

                    filteredMessages = newMessage
                }
            }
        }

        if (filteredMessages != null) {

            store.dispatch('newMessage', filteredMessages);

            if (!store.getters.getMessageSidebarVisible) {

                toast.success(`${
                    newMessage.msgText
                } - ${
                    newMessage.msgDate
                }`, {
                    icon: false,
                    autoClose: 4000
                })

                store.dispatch('increaseMessageCount');
            }


        }

    })


    return [
        allUserCoordinates,
        setUserCoordinate,
        setUserJoinGroup,
        setUserLeftGroup,
        sendMessagesServer,
        store
    ];
}
