import { createApp } from "vue";
import App from "./App.vue";

import plugin from "./plugin";

const app = createApp(App);

// app.use(plugin, {
//   clientId: "216130615027-lggtauf66eokgl6a06a8hnut85oifhgt.apps.googleusercontent.com",
// });

app.mount("#app");
