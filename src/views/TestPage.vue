<!-- filepath: src/views/TestPage.vue -->
<template>
	<div class="test-page">
		<h1>Test</h1>
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
				<button @click="nextQuestion" :disabled="currentQuestionIndex === questions.length - 1">Next</button>
			</div>
		</div>
		<div v-else>
			<p>Loading...</p>
		</div>
	</div>
</template>

<script>
	import { ref, computed, onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { db } from "../firebase";
	import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

	export default {
		name: "TestPage",
		setup() {
			const route = useRoute();
			const router = useRouter();
			const questions = ref([]);
			const currentQuestionIndex = ref(0);
			const selectedAnswer = ref(null);
			const userAnswers = ref([]);

			const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

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

			const fetchQuestions = async () => {
				const level = route.query.level;
				const category = route.query.category;
				const q = query(collection(db, "test"), where("level", "==", level), where("category", "==", category));
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((doc) => {
					questions.value.push(doc.data());
				});
			};

			const finishTest = async () => {
				const correctAnswers = questions.value.map((q) => q.answer);
				const score = userAnswers.value.reduce((acc, answer, index) => {
					return acc + (answer === correctAnswers[index] ? 1 : 0);
				}, 0);

				await addDoc(collection(db, "testHistory"), {
					userId: auth.currentUser.uid,
					score,
					date: new Date(),
					level: route.query.level,
					category: route.query.category,
				});

				router.push({
					path: "/result",
					query: {
						score,
						userAnswers: JSON.stringify(userAnswers.value),
						correctAnswers: JSON.stringify(correctAnswers),
					},
				});
			};

			onMounted(() => {
				fetchQuestions();
			});

			return {
				questions,
				currentQuestionIndex,
				currentQuestion,
				selectedAnswer,
				prevQuestion,
				nextQuestion,
			};
		},
	};
</script>

<style scoped>
	.test-page {
		max-width: 600px;
		margin: 0 auto;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.test-page h1 {
		text-align: center;
	}
	.test-page ul {
		list-style-type: none;
		padding: 0;
	}
	.test-page li {
		margin-bottom: 1em;
	}
	.test-page .navigation {
		display: flex;
		justify-content: space-between;
	}
	.test-page button {
		padding: 0.7em;
		font-size: 1em;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.test-page button:disabled {
		background-color: #ccc;
	}
</style>
