<template>
	<div class="dashboard">
		<h2>Your Test History</h2>
		<div class="test-history">
			<table v-if="testHistory.length > 0">
				<thead>
					<tr>
						<th>Subject</th>
						<th>Level</th>
						<th>Score</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="test in testHistory" :key="test.id">
						<td>{{ test.subject }}</td>
						<td>{{ test.level }}</td>
						<td>{{ test.score }} / {{ test.totalQuestions }}</td>
						<td>{{ formatDate(test.timestamp) }}</td>
					</tr>
				</tbody>
			</table>
			<p v-else>No test history found.</p>
		</div>
	</div>
</template>

<script>
	import { ref, onMounted } from "vue";
	import { auth, db } from "../firebase";
	import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

	export default {
		name: "Dashboard",
		setup() {
			const testHistory = ref([]);

			const fetchTestHistory = async () => {
				try {
					const user = auth.currentUser;
					if (!user) return;

					const q = query(
						collection(db, "testHistory"),
						where("userId", "==", user.uid),
						orderBy("timestamp", "desc")
					);

					const querySnapshot = await getDocs(q);
					testHistory.value = querySnapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));
				} catch (error) {
					console.error("Error fetching test history:", error);
				}
			};

			const formatDate = (timestamp) => {
				if (!timestamp) return "";
				return new Date(timestamp.toDate()).toLocaleDateString();
			};

			onMounted(() => {
				fetchTestHistory();
			});

			return {
				testHistory,
				formatDate,
			};
		},
	};
</script>

<style scoped>
	.dashboard {
		padding: 2em;
		max-width: 1000px;
		margin: 0 auto;
	}

	.test-history {
		margin-top: 2em;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1em;
	}

	th,
	td {
		padding: 1em;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f5f5f5;
		font-weight: bold;
	}

	tr:hover {
		background-color: #f9f9f9;
	}

	@media (max-width: 600px) {
		.dashboard {
			padding: 1em;
		}

		table {
			display: block;
			overflow-x: auto;
		}
	}
</style>
