import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { auth } from "./firebase";

let app;

auth.onAuthStateChanged(() => {
	if (!app) {
		app = createApp(App);
		app.use(router);
		app.mount("#app");
	}
});
