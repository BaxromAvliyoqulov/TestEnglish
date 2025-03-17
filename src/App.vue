<!-- filepath: src/App.vue -->
<template>
	<div id="app">
		<header>
			<h1>My App</h1>
		</header>
		<main>
			<div v-if="!user">
				<h2>Login</h2>
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
				<button @click="loginWithGoogle">Login with Google</button>
			</div>
			<div v-else-if="!testSelected">
				<h2>Select Test</h2>
				<form @submit.prevent="startTest">
					<div>
						<label for="testCount">Number of Tests:</label>
						<select v-model="testCount" required>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="20">20</option>
							<option value="30">30</option>
							<option value="40">40</option>
							<option value="50">50</option>
						</select>
					</div>
					<div>
						<label for="level">Level:</label>
						<select v-model="level" required>
							<option value="A1">A1</option>
							<option value="A2">A2</option>
							<option value="B1">B1</option>
							<option value="B2">B2</option>
							<option value="C1">C1</option>
						</select>
					</div>
					<button type="submit">Start Test</button>
				</form>
			</div>
			<div v-else-if="!testFinished">
				<h2>Test</h2>
				<div v-if="currentQuestion">
					<p>{{ currentQuestion.question }}</p>
					<ul>
						<li v-for="(option, index) in currentQuestion.options" :key="index">
							<label>
								<input type="radio" :value="index" v-model="selectedAnswer" />
								{{ option }}
							</label>
						</li>
					</ul>
					<div class="navigation">
						<button @click="prevQuestion" :disabled="currentQuestionIndex === 0">Prev</button>
						<button @click="nextQuestion" :disabled="currentQuestionIndex === questions.length - 1">
							Next
						</button>
					</div>
				</div>
				<div v-else>
					<p>Loading...</p>
				</div>
			</div>
			<div v-else>
				<h2>Test Results</h2>
				<p>Your score: {{ score }}</p>
				<button @click="goToDashboard">Go to Dashboard</button>
			</div>
		</main>
	</div>
</template>

<script>
	import { ref, computed, onMounted } from "vue";
	import { auth, db } from "./firebase";
	import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
	import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

	export default {
		name: "App",
		setup() {
			const email = ref("");
			const password = ref("");
			const user = ref(null);
			const testCount = ref("");
			const level = ref("");
			const testSelected = ref(false);
			const testFinished = ref(false);
			const questions = ref([]);
			const currentQuestionIndex = ref(0);
			const selectedAnswer = ref(null);
			const userAnswers = ref([]);
			const score = ref(0);

			const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

			const login = async () => {
				try {
					const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
					user.value = userCredential.user;
				} catch (error) {
					console.error("Login error:", error);
				}
			};

			const loginWithGoogle = async () => {
				try {
					const provider = new GoogleAuthProvider();
					const result = await signInWithPopup(auth, provider);
					user.value = result.user;
				} catch (error) {
					console.error("Google login error:", error);
				}
			};

			const startTest = async () => {
				testSelected.value = true;
				await fetchQuestions();
			};

			const fetchQuestions = async () => {
				const q = query(collection(db, "test"), where("level", "==", level.value));
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((doc) => {
					questions.value.push(doc.data());
				});
			};

			const prevQuestion = () => {
				if (currentQuestionIndex.value > 0) {
					currentQuestionIndex.value--;
					selectedAnswer.value = userAnswers.value[currentQuestionIndex.value] || null;
				}
			};

			const nextQuestion = () => {
				if (selectedAnswer.value !== null) {
					userAnswers.value[currentQuestionIndex.value] = selectedAnswer.value;
					if (currentQuestionIndex.value < questions.value.length - 1) {
						currentQuestionIndex.value++;
						selectedAnswer.value = userAnswers.value[currentQuestionIndex.value] || null;
					} else {
						finishTest();
					}
				}
			};

			const finishTest = async () => {
				const correctAnswers = questions.value.map((q) => q.answer);
				score.value = userAnswers.value.reduce((acc, answer, index) => {
					return acc + (answer === correctAnswers[index] ? 1 : 0);
				}, 0);

				await addDoc(collection(db, "testHistory"), {
					userId: user.value.uid,
					score: score.value,
					date: new Date(),
					level: level.value,
				});

				testFinished.value = true;
			};

			const goToDashboard = () => {
				// Redirect to dashboard or show dashboard content
			};

			onMounted(() => {
				auth.onAuthStateChanged((currentUser) => {
					if (currentUser) {
						user.value = currentUser;
					}
				});
			});

			return {
				email,
				password,
				user,
				testCount,
				level,
				testSelected,
				testFinished,
				questions,
				currentQuestionIndex,
				currentQuestion,
				selectedAnswer,
				userAnswers,
				score,
				login,
				loginWithGoogle,
				startTest,
				prevQuestion,
				nextQuestion,
				finishTest,
				goToDashboard,
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
	}

	#app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	header {
		background-color: #007bff;
		color: white;
		padding: 1em;
		text-align: center;
	}

	main {
		flex: 1;
		overflow-y: auto;
		padding: 1em;
	}

	@media (max-width: 600px) {
		header {
			font-size: 1.2em;
		}

		main {
			padding: 0.5em;
		}
	}
</style>
