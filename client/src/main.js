import {createApp} from 'vue'
import App from './App.vue'
import "./assets/css/style.scss"
import store from "./store";

createApp(App).use(store).mount('#app')
