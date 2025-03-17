<!-- filepath: src/views/ResultPage.vue -->
<template>
	<div class="result-page">
		<h1>Test Results</h1>
		<p>Your score: {{ score }}</p>
		<button @click="goToDashboard">Go to Dashboard</button>
	</div>
</template>

<script>
	import { ref, onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";

	export default {
		name: "ResultPage",
		setup() {
			const route = useRoute();
			const router = useRouter();
			const score = ref(0);

			onMounted(() => {
				score.value = route.query.score;
			});

			const goToDashboard = () => {
				router.push("/dashboard");
			};

			return {
				score,
				goToDashboard,
			};
		},
	};
</script>

<style scoped>
	.result-page {
		max-width: 600px;
		margin: 0 auto;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.result-page h1 {
		text-align: center;
	}
	.result-page p {
		font-size: 1.2em;
		text-align: center;
	}
	.result-page button {
		display: block;
		margin: 1em auto;
		padding: 0.7em;
		font-size: 1em;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.result-page button:hover {
		background-color: #0056b3;
	}
</style>
