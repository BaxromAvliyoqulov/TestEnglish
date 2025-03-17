import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import TestSelection from "../views/TestSelection.vue";
import TestPage from "../views/TestPage.vue";
import ResultPage from "../views/ResultPage.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
	{ path: "/", component: Login },
	{ path: "/test-selection", component: TestSelection },
	{ path: "/test", component: TestPage },
	{ path: "/result", component: ResultPage },
	{ path: "/dashboard", component: Dashboard },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
