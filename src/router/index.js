import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import TestSelection from "../views/TestSelection.vue";
import TestPage from "../views/TestPage.vue";
import ResultPage from "../views/ResultPage.vue";
import Dashboard from "../views/Dashboard.vue";
import Contact from "../views/Contact.vue";

const routes = [
	{ path: "/", component: Login },
	{ path: "/test-selection", component: TestSelection },
	{ path: "/test", component: TestPage },
	{ path: "/result", component: ResultPage },
	{ path: "/dashboard", component: Dashboard },
	{ path: "/contact", component: Contact },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
