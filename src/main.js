import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { auth } from "./firebase";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'; 


let app;

// Add all icons to the library
library.add(fas);

auth.onAuthStateChanged((user) => {
	if (!app) {
		app = createApp(App);
		app.use(router);
		app.component('font-awesome-icon', FontAwesomeIcon);
		app.mount("#app");
	}

	if (!user && router.currentRoute.value.path !== "/login") {
		router.push("/login");
	}
});
