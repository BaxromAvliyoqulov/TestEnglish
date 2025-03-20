<template>
	<div id="app">
		<nav class="navbar">
			<div class="nav-brand"><h1>Test.me</h1></div>
			<div class="nav-items">
				<div class="user-profile" @click="toggleProfileMenu" v-if="user">
					<img :src="userPhotoURL" :alt="user?.displayName || 'User'" class="profile-image" />
					<div v-if="showProfileMenu" class="profile-menu">
						<router-link to="/dashboard" class="menu-item">Dashboard</router-link>
						<router-link to="/contact" class="menu-item">Contact Us</router-link>
						<a href="#" @click.prevent="logout" class="menu-item">Logout</a>
					</div>
				</div>
			</div>
		</nav>
		<!-- nav ends -->
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
						<!-- *** Subject *** -->
						<label for="subject">Subject:</label>
						<select v-model="subject" required>
							<option value="english">English</option>
							<option value="math">Mathematics</option>
							<option value="russian">Russian</option>
							<option value="history">History</option>
						</select>
					</div>
					<!-- *** Number of Questions *** -->
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
					<!-- *** Level *** -->
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
	import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

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
			const profileRef = ref(null);
			const showMobileMenu = ref(false);

			const toggleMobileMenu = () => {
				showMobileMenu.value = !showMobileMenu.value;
			};

			const userPhotoURL = computed(() => {
				if (user.value?.photoURL) {
					return user.value.photoURL;
				}
				return "default-user-icon.png"; // Bu yerda default user icon'ning yo'lini ko'rsating
			});
			const toggleProfileMenu = () => {
				showProfileMenu.value = !showProfileMenu.value;
			};
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
			const startTest = async () => {
				testSelected.value = true;
				await fetchQuestions();
			};

			const fetchQuestions = async () => {
				try {
					const q = query(
						collection(db, "tests"),
						where("subject", "==", subject.value),
						where("level", "==", level.value)
					);

					const querySnapshot = await getDocs(q);
					questions.value = [];
					querySnapshot.forEach((doc) => {
						questions.value.push({ id: doc.id, ...doc.data() });
					});

					// Shuffle and limit questions
					questions.value = questions.value
						.sort(() => Math.random() - 0.5)
						.slice(0, parseInt(testCount.value));

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
				await signOut(auth);
				user.value = null;
			};

			onMounted(() => {
				onAuthStateChanged(auth, (currentUser) => {
					user.value = currentUser;
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
				showMobileMenu,
				toggleMobileMenu,
				user,
				showProfileMenu,
				toggleProfileMenu,
				logout,
				userPhotoURL,
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

	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #007bff;
		color: white;
		padding: 1rem;
	}

	.nav-brand {
		font-size: 1.5rem;
		font-weight: bold;
	}

	.user-profile {
		position: relative;
		cursor: pointer;
	}

	.profile-image {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.profile-menu {
		position: absolute;
		top: 50px;
		right: 0;
		background-color: white;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		overflow: hidden;
		width: 200px;
	}

	.menu-item {
		display: block;
		padding: 0.75rem 1rem;
		color: #333;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.menu-item:hover {
		background-color: #f0f0f0;
	}

	.user-profile {
		position: relative;
		cursor: pointer;
	}

	.profile-image {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.profile-menu {
		position: absolute;
		top: 50px;
		right: 0;
		background-color: white;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		overflow: hidden;
		width: 200px;
	}

	.profile-info {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #eee;
	}

	.profile-image-small {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		margin-right: 0.5rem;
	}

	.menu-item {
		display: block;
		padding: 0.75rem 1rem;
		color: #333;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.menu-item:hover {
		background-color: #f0f0f0;
	}

	main {
		flex: 1;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	form {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}

	form div {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	input,
	select,
	button {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	button {
		background-color: #007bff;
		color: white;
		border: none;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	.test-progress {
		margin-bottom: 1rem;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.question-container {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 600px;
	}

	.question-text {
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	.options-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.option-label {
		display: flex;
		align-items: center;
		padding: 0.5rem 0;
		cursor: pointer;
	}

	.option-text {
		margin-left: 0.5rem;
	}

	.navigation {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	.results-container {
		text-align: center;
	}

	.score-display {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
	}
	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		padding: 10px;
		cursor: pointer;
	}

	.hamburger {
		display: block;
		width: 25px;
		height: 3px;
		background: white;
		position: relative;
	}

	.hamburger::before,
	.hamburger::after {
		content: "";
		position: absolute;
		width: 100%;
		height: 3px;
		background: white;
		left: 0;
	}

	.hamburger::before {
		top: -8px;
	}

	.hamburger::after {
		bottom: -8px;
	}
	.user-profile {
		position: relative;
		cursor: pointer;
	}

	.profile-trigger {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px;
	}

	.username {
		color: white;
		margin-right: 4px;
	}

	.dropdown-arrow {
		color: white;
		font-size: 12px;
	}

	.profile-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background-color: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		width: 220px;
		z-index: 1000;
		margin-top: 8px;
	}

	.profile-info {
		padding: 15px;
		border-bottom: 1px solid #eee;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.user-name {
		font-weight: 500;
		color: #333;
		word-break: break-word;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 15px;
		color: #333;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.menu-item:hover {
		background-color: #f5f5f5;
	}

	.menu-item i {
		width: 20px;
	}

	.logout {
		color: #dc3545;
	}

	.profile-image {
		width: 35px;
		height: 35px;
		border-radius: 50%;
		object-fit: cover;
	}

	.profile-image-small {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	@media (max-width: 768px) {
		.mobile-menu-btn {
			display: block;
		}

		.nav-items {
			display: none;
			width: 100%;
			position: absolute;
			top: 100%;
			left: 0;
			background-color: #007bff;
			padding: 1rem;
		}

		.nav-items.active {
			display: flex;
			flex-direction: column;
		}

		.profile-menu {
			position: fixed;
			top: auto;
			right: 10px;
			width: calc(100% - 20px);
			max-width: 300px;
		}
		.profile-menu {
			position: fixed;
			top: auto;
			right: 10px;
			width: calc(100% - 20px);
			max-width: 300px;
		}
	}
	@media (max-width: 600px) {
		.navbar {
			flex-direction: column;
			align-items: flex-start;
		}

		.nav-items {
			flex-direction: column;
			gap: 0.5rem;
		}

		main {
			padding: 1rem;
		}

		form {
			padding: 1.5rem;
		}
	}
</style>
