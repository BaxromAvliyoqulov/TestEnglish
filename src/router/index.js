import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import TestSelection from "../views/TestSelection.vue";
import TestPage from "../views/TestPage.vue";
import ResultPage from "../views/ResultPage.vue";
import Dashboard from "../views/Dashboard.vue";
import Contact from "../views/Contact.vue";
import App from '../App.vue';

const routes = [
	{ path: "/", component: Login },
	{ path: "/test-selection", component: TestSelection },
	{ path: "/test", component: TestPage },
	{ path: "/result", component: ResultPage },
	{ path: "/dashboard", component: Dashboard },
	{ path: "/contact", component: Contact },
	{ path: "/", name: 'App', component: App, meta: { requiresAuth: true } },
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
	const isAuthenticated = auth.currentUser;

	if (requiresAuth && !isAuthenticated) {
		next('/login');
	} else {
		next();
	}
});

export default router;
