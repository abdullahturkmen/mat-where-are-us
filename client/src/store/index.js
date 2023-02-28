import {createStore} from "vuex";

export default createStore({
    state: {
        messageFile: null,
        messageCounter: 0,
        msgSidebarVisible: false,
        messageList: []
    },
    getters: {
        getMessageCount(state) {
            return state.messageCounter;
        },
        getMessageSidebarVisible(state) {
            return state.msgSidebarVisible;
        },
        getMessageList(state) {
            return state.messageList;
        },
        getMessageFile(state) {
            return state.messageFile;
        }
    },
    mutations: {
        increaseMessageCount(state) {
            state.messageCounter += 1;
            if (state.msgSidebarVisible) {
                state.messageCounter = 0
            }
        },
        resetMessageCount(state) {
            state.messageCounter = 0
        },
        msgSidebarVisibiltyChange(state, value) {
            state.msgSidebarVisible = value
        },
        newMessage(state, value) {
            state.messageList.push(value)
        },
        newMessageFile(state, value) {
            state.messageFile = value
        }
    },
    actions: {
        increaseMessageCount(context) {
            context.commit('increaseMessageCount')
        },
        resetMessageCount(context) {
            context.commit('resetMessageCount')
        },
        msgSidebarVisibiltyChange(context, value) {
            context.commit('msgSidebarVisibiltyChange', value)
        },
        newMessage(context, value) {
            context.commit('newMessage', value)
        },
        newMessageFile(context, value) {
            context.commit('newMessageFile', value)
        }
    },
    modules: {}
});
