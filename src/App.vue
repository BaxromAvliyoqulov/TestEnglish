<!-- filepath: src/App.vue -->
<template>
	<div id="app">
		<nav v-if="user" class="navbar">
			<div class="nav-brand">Test App</div>
			<div class="nav-items">
				<router-link to="/dashboard" class="nav-link">Dashboard</router-link>
				<div class="user-profile" @click="toggleProfileMenu">
					<img :src="userPhotoURL" :alt="user.displayName" class="profile-image" />
					<div v-if="showProfileMenu" class="profile-menu">
						<div class="profile-info">
							<img :src="userPhotoURL" :alt="user.displayName" class="profile-image-small" />
							<span>{{ user.displayName || user.email }}</span>
						</div>
						<router-link to="/dashboard" class="menu-item">Dashboard</router-link>
						<a href="#" @click.prevent="logout" class="menu-item">Logout</a>
					</div>
				</div>
			</div>
		</nav>

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
						<label for="subject">Subject:</label>
						<select v-model="subject" required>
							<option value="english">English</option>
							<option value="math">Mathematics</option>
							<option value="russian">Russian</option>
							<option value="history">History</option>
						</select>
					</div>
					<div>
						<label for="level">Level:</label>
						<select v-model="level" required>
							<template v-if="subject === 'english'">
								<option value="A1">A1</option>
								<option value="A2">A2</option>
								<option value="B1">B1</option>
								<option value="B2">B2</option>
								<option value="C1">C1</option>
							</template>
							<template v-else>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</template>
						</select>
					</div>
					<div>
						<label for="testCount">Number of Questions:</label>
						<select v-model="testCount" required>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="20">20</option>
							<option value="30">30</option>
							<option value="40">40</option>
							<option value="50">50</option>
						</select>
					</div>
					<button type="submit">Start Test</button>
				</form>
			</div>
			<div v-else-if="!testFinished">
				<h2>Test</h2>
				<div class="test-progress">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</div>
				<div v-if="currentQuestion" class="question-container">
					<p class="question-text">{{ currentQuestion.question }}</p>
					<ul class="options-list">
						<li v-for="(option, index) in currentQuestion.options" :key="index">
							<label class="option-label">
								<input
									type="radio"
									:value="index"
									v-model="selectedAnswer"
									:name="'question-' + currentQuestionIndex"
								/>
								<span class="option-text">{{ option }}</span>
							</label>
						</li>
					</ul>
					<div class="navigation">
						<button @click="prevQuestion" :disabled="currentQuestionIndex === 0">Previous</button>
						<button @click="nextQuestion" :disabled="currentQuestionIndex === questions.length - 1">
							Next
						</button>
						<button v-if="currentQuestionIndex === questions.length - 1" @click="finishTest">
							Finish Test
						</button>
					</div>
				</div>
				<div v-else>
					<p>Loading...</p>
				</div>
			</div>
			<div v-else class="results-container">
				<h2>Test Results</h2>
				<div class="score-display">
					<h3>Your Score: {{ score }} out of {{ questions.length }}</h3>
					<p>Percentage: {{ ((score / questions.length) * 100).toFixed(1) }}%</p>
				</div>
				<button @click="goToDashboard">Go to Dashboard</button>
				<button @click="startNewTest">Start New Test</button>
			</div>
		</main>
	</div>
</template>

<script>
	import { ref, computed, onMounted } from "vue";
	import { auth, db } from "./firebase";
	import {
		signInWithEmailAndPassword,
		signInWithPopup,
		GoogleAuthProvider,
		signOut,
		onAuthStateChanged,
	} from "firebase/auth";
	import { collection, getDocs, query, where, addDoc, orderBy, limit } from "firebase/firestore";

	export default {
		name: "App",
		setup() {
			const email = ref("");
			const password = ref("");
			const user = ref(null);
			const subject = ref("");
			const level = ref("");
			const testCount = ref("");
			const testSelected = ref(false);
			const testFinished = ref(false);
			const questions = ref([]);
			const currentQuestionIndex = ref(0);
			const selectedAnswer = ref(null);
			const userAnswers = ref([]);
			const score = ref(0);
			const showProfileMenu = ref(false);

			const userPhotoURL = computed(() => {
				return user.value?.photoURL || "https://www.gravatar.com/avatar/?d=mp";
			});

			const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

			const login = async () => {
				try {
					const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
					user.value = userCredential.user;
				} catch (error) {
					console.error("Login error:", error);
					alert("Login failed. Please check your credentials.");
				}
			};

			const loginWithGoogle = async () => {
				try {
					const provider = new GoogleAuthProvider();
					const result = await signInWithPopup(auth, provider);
					user.value = result.user;
				} catch (error) {
					console.error("Google login error:", error);
					alert("Google login failed. Please try again.");
				}
			};

			const logout = async () => {
				try {
					await signOut(auth);
					user.value = null;
					showProfileMenu.value = false;
				} catch (error) {
					console.error("Logout error:", error);
				}
			};

			const toggleProfileMenu = () => {
				showProfileMenu.value = !showProfileMenu.value;
			};

			const startTest = async () => {
				testSelected.value = true;
				await fetchQuestions();
			};

			const fetchQuestions = async () => {
				try {
					const q = query(
						collection(db, "tests"),
						where("subject", "==", subject.value),
						where("level", "==", level.value),
						orderBy("createdAt"),
						limit(parseInt(testCount.value))
					);

					const querySnapshot = await getDocs(q);
					questions.value = [];
					querySnapshot.forEach((doc) => {
						questions.value.push({ id: doc.id, ...doc.data() });
					});

					if (questions.value.length === 0) {
						alert("No questions found for the selected criteria. Please try different options.");
						testSelected.value = false;
					}
				} catch (error) {
					console.error("Error fetching questions:", error);
					alert("Error loading questions. Please try again.");
					testSelected.value = false;
				}
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
