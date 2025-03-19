import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

const routes = [
	{
		path: "/",
		component: App,
	},
	{
		path: "/dashboard",
		component: () => import("./components/Dashboard.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
