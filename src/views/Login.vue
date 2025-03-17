<!-- filepath: src/views/Login.vue -->
<template>
	<div class="login">
		<h1>Login</h1>
		<form @submit.prevent="login">
			<div>
				<label for="email">Email:</label>
				<input type="email" v-model="email" required />
			</div>
			<div>
				<label for="password">Password:</label>
				<input type="password" v-model="password" required />
			</div>
			<button type="submit">Login</button>
		</form>
		<p>Don't have an account? <a @click="showRegister = true">Register here</a></p>

		<div v-if="showRegister">
			<h1>Register</h1>
			<form @submit.prevent="register">
				<div>
					<label for="email">Email:</label>
					<input type="email" v-model="email" required />
				</div>
				<div>
					<label for="password">Password:</label>
					<input type="password" v-model="password" required />
				</div>
				<button type="submit">Register</button>
			</form>
		</div>
	</div>
</template>

<script>
	import { ref } from "vue";
	import { auth } from "../firebase";
	import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

	export default {
		name: "Login",
		setup() {
			const email = ref("");
			const password = ref("");
			const showRegister = ref(false);

			const login = async () => {
				try {
					await signInWithEmailAndPassword(auth, email.value, password.value);
					// Redirect to test selection page
					this.$router.push("/test-selection");
				} catch (error) {
					console.error("Login error:", error);
				}
			};

			const register = async () => {
				try {
					await createUserWithEmailAndPassword(auth, email.value, password.value);
					// Redirect to test selection page
					this.$router.push("/test-selection");
				} catch (error) {
					console.error("Registration error:", error);
				}
			};

			return {
				email,
				password,
				showRegister,
				login,
				register,
			};
		},
	};
</script>

<style scoped>
	.login {
		max-width: 400px;
		margin: 0 auto;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.login h1 {
		text-align: center;
	}
	.login form {
		display: flex;
		flex-direction: column;
	}
	.login form div {
		margin-bottom: 1em;
	}
	.login form label {
		margin-bottom: 0.5em;
		color: #333333;
	}
	.login form input {
		padding: 0.5em;
		font-size: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.login form button {
		padding: 0.7em;
		font-size: 1em;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.login form button:hover {
		background-color: #0056b3;
	}
</style>
