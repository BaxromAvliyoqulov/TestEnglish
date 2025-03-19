import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs/promises";
import path from "path";

const firebaseConfig = {
	apiKey: "AIzaSyBSNumZZAhTF7-GtLYGNF8STdg_4fvjTKg",
	authDomain: "testquiz-d4274.firebaseapp.com",
	projectId: "testquiz-d4274",
	storageBucket: "testquiz-d4274.firebasestorage.app",
	messagingSenderId: "585977312564",
	appId: "1:585977312564:web:7433a460fd3508f4b5e161",
	measurementId: "G-JHLB9JRJGG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadTests() {
	try {
		// Read the JSON file
		const jsonPath = path.join(process.cwd(), "tests.json");
		const jsonData = await fs.readFile(jsonPath, "utf8");
		const tests = JSON.parse(jsonData);

		// Upload each test to Firebase
		for (const test of tests) {
			const testData = {
				...test,
				createdAt: new Date(),
			};

			await addDoc(collection(db, "tests"), testData);
			console.log(`Uploaded test: ${test.question.substring(0, 50)}...`);
		}

		console.log("All tests uploaded successfully!");
	} catch (error) {
		console.error("Error uploading tests:", error);
	}
}

uploadTests();
