import { createApp } from 'vue'
import App from './App.vue'
import { vutify } from './plugins/vuetify';

createApp(App)
.use(vutify)
.mount('#app')
