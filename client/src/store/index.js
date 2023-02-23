import {createStore} from "vuex";

export default createStore({
    state: {
        counter: 0,
        msgSidebarVisible: false,
        messageList: []
    },
    getters: {
        getMessageCount(state) {
            return state.counter;
        },
        getMessageSidebarVisible(state) {
            return state.msgSidebarVisible;
        },
        getMessageList(state) {
            return state.messageList;
        }
    },
    mutations: {
        increaseMessageCount(state) {
            state.counter += 1;
            if (state.msgSidebarVisible) {
                state.counter = 0
            }
        },
        resetMessageCount(state) {
            state.counter = 0
        },
        msgSidebarVisibiltyChange(state, value) {
            state.msgSidebarVisible = value
        },
        newMessage(state, value) {
            state.messageList.push(value)
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
        }
    },
    modules: {}
});
