<!-- filepath: src/views/Dashboard.vue -->
<template>
	<div class="dashboard">
		<h1>Dashboard</h1>
		<ul>
			<li v-for="(test, index) in testHistory" :key="index">
				<p>Test {{ index + 1 }}: {{ test.score }} points</p>
			</li>
		</ul>
	</div>
</template>

<script>
	import { ref, onMounted } from "vue";
	import { db } from "../firebase";
	import { collection, getDocs, query, where } from "firebase/firestore";
	import { auth } from "../firebase";

	export default {
		name: "Dashboard",
		setup() {
			const testHistory = ref([]);

			const fetchTestHistory = async () => {
				const q = query(collection(db, "testHistory"), where("userId", "==", auth.currentUser.uid));
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((doc) => {
					testHistory.value.push(doc.data());
				});
			};

			onMounted(() => {
				fetchTestHistory();
			});

			return {
				testHistory,
			};
		},
	};
</script>

<style scoped>
	.dashboard {
		max-width: 600px;
		margin: 0 auto;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.dashboard h1 {
		text-align: center;
	}
	.dashboard ul {
		list-style-type: none;
		padding: 0;
	}
	.dashboard li {
		margin-bottom: 1em;
		padding: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
