import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { firebaseConfig } from "../TestEnglish-1/src/firebase";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const englishQuestions = {
	A1: [
		{
			question: "What is the correct form of 'be' for 'I'?",
			options: ["am", "is", "are", "be"],
			answer: 0,
			subject: "english",
			level: "A1",
			createdAt: new Date(),
		},
		// Add more questions...
	],
	A2: [
		// A2 level questions
	],
	// Add more levels...
};

const mathQuestions = {
	beginner: [
		{
			question: "What is 5 + 7?",
			options: ["10", "11", "12", "13"],
			answer: 2,
			subject: "math",
			level: "beginner",
			createdAt: new Date(),
		},
		// Add more questions...
	],
	// Add more levels...
};

// Add similar structures for Russian and History

async function checkExistingQuestions(subject, level) {
	const q = query(collection(db, "tests"), where("subject", "==", subject), where("level", "==", level));

	const snapshot = await getDocs(q);
	return !snapshot.empty;
}

async function uploadQuestions() {
	try {
		// Upload English questions
		for (const [level, questions] of Object.entries(englishQuestions)) {
			const exists = await checkExistingQuestions("english", level);
			if (!exists) {
				for (const question of questions) {
					await addDoc(collection(db, "tests"), question);
					console.log(`Uploaded English ${level} question`);
				}
			}
		}

		// Upload Math questions
		for (const [level, questions] of Object.entries(mathQuestions)) {
			const exists = await checkExistingQuestions("math", level);
			if (!exists) {
				for (const question of questions) {
					await addDoc(collection(db, "tests"), question);
					console.log(`Uploaded Math ${level} question`);
				}
			}
		}

		// Add similar blocks for Russian and History

		console.log("Upload completed successfully!");
	} catch (error) {
		console.error("Error uploading questions:", error);
	}
}

// Run the upload
uploadQuestions();
