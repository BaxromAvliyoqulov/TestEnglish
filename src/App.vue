<template>
	<div id="app">
		<main>
			<router-view></router-view>
		</main>
	</div>
</template>

<script>
	import { ref, onMounted } from "vue";
	import { useRouter } from "vue-router";
	import { auth } from "./firebase";
	import { onAuthStateChanged } from "firebase/auth";
	import Login from "./views/Login.vue";

	export default {
		name: "App",
		components: {
			Login,
		},
		setup() {
			const user = ref(null);
			const router = useRouter();

			onMounted(() => {
				onAuthStateChanged(auth, (currentUser) => {
					user.value = currentUser;
					if (!user.value) {
						if (router.resolve("/login").matched.length > 0) {
							router.push("/login").catch((error) => {
								console.error("Navigation error:", error);
							});
						} else {
							console.warn("No match found for location with path '/login'");
						}
					} else {
						if (router.resolve("/dashboard").matched.length > 0) {
							router.push("/dashboard").catch((error) => {
								console.error("Navigation error:", error);
							});
						} else {
							console.warn("No match found for location with path '/dashboard'");
						}
					}
				});
			});

			return {
				user,
			};
		},
	};
</script>

<style>
	html,
	body,
	#app {
		height: 100%;
		margin: 0;
		padding: 0;
		font-family: "Arial", sans-serif;
		background-color: #f9f9f9;
		color: #333;
	}

	#app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	main {
		flex: 1;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
