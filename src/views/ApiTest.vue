<!-- filepath: src/views/ApiTest.vue -->
<template>
	<div class="api-test">
		<h1>API Test</h1>
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
	import axios from "axios";

	export default {
		name: "ApiTest",
		setup() {
			const questions = ref([]);
			const currentQuestionIndex = ref(0);
			const selectedAnswer = ref(null);
			const userAnswers = ref([]);

			const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

			const fetchQuestions = async () => {
				try {
					const response = await axios.get("https://opentdb.com/api.php?amount=10&type=multiple");
					const data = response.data.results.map((item) => ({
						question: item.question,
						options: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5),
						answer: item.correct_answer,
					}));
					questions.value = data;
				} catch (error) {
					console.error("Error fetching questions:", error);
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
					} else {
						finishTest();
					}
				}
			};

			const finishTest = () => {
				const correctAnswers = questions.value.map((q) => q.answer);
				const score = userAnswers.value.reduce((acc, answer, index) => {
					return acc + (answer === correctAnswers[index] ? 1 : 0);
				}, 0);
				alert(`Test finished! Your score: ${score}`);
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
	.api-test {
		max-width: 600px;
		margin: 0 auto;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.api-test h1 {
		text-align: center;
	}
	.api-test ul {
		list-style-type: none;
		padding: 0;
	}
	.api-test li {
		margin-bottom: 1em;
	}
	.api-test .navigation {
		display: flex;
		justify-content: space-between;
	}
	.api-test button {
		padding: 0.7em;
		font-size: 1em;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.api-test button:disabled {
		background-color: #ccc;
	}
</style>
