<!-- filepath: src/views/TestSelection.vue -->
<template>
	<div class="test-selection">
		<h1>Select Test</h1>
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
			<div>
				<label for="category">Category:</label>
				<select v-model="category" required>
					<option value="Category1">Category1</option>
					<option value="Category2">Category2</option>
					<option value="Category3">Category3</option>
					<!-- Add more categories as needed -->
				</select>
			</div>
			<button type="submit">Start Test</button>
		</form>
	</div>
</template>

<script>
	import { ref } from "vue";

	export default {
		name: "TestSelection",
		setup() {
			const testCount = ref("");
			const level = ref("");
			const category = ref("");

			const startTest = () => {
				// Redirect to test page with selected options
				this.$router.push({
					path: "/test",
					query: { testCount: testCount.value, level: level.value, category: category.value },
				});
			};

			return {
				testCount,
				level,
				category,
				startTest,
			};
		},
	};
</script>

<style scoped>
	.test-selection {
		max-width: 400px;
		margin: 0 auto;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.test-selection h1 {
		text-align: center;
	}
	.test-selection form {
		display: flex;
		flex-direction: column;
	}
	.test-selection form div {
		margin-bottom: 1em;
	}
	.test-selection form label {
		margin-bottom: 0.5em;
		color: #333333;
	}
	.test-selection form select {
		padding: 0.5em;
		font-size: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.test-selection form button {
		padding: 0.7em;
		font-size: 1em;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.test-selection form button:hover {
		background-color: #0056b3;
	}
</style>
