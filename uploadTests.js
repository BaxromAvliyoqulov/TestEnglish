import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
	apiKey: "AIzaSyBSNumZZAhTF7-GtLYGNF8STdg_4fvjTKg",
	authDomain: "testquiz-d4274.firebaseapp.com",
	projectId: "testquiz-d4274",
	storageBucket: "testquiz-d4274.firebasestorage.app",
	messagingSenderId: "585977312564",
	appId: "1:585977312564:web:7433a460fd3508f4b5e161",
	measurementId: "G-JHLB9JRJGG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const levels = ["A1", "A2", "B1", "B2", "C1"];

const uploadTests = async () => {
	for (const level of levels) {
		const dirPath = join(__dirname, "src", "tests", level);
		if (!fs.existsSync(dirPath)) {
			console.error(`Directory not found: ${dirPath}`);
			continue;
		}

		const files = fs.readdirSync(dirPath);
		for (const file of files) {
			const filePath = join(dirPath, file);
			try {
				const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
				const batch = data.map((test) => addDoc(collection(db, "test"), { ...test, level }));
				await Promise.all(batch);
				console.log(`Uploaded ${data.length} tests from ${file}`);
			} catch (error) {
				console.error(`Error processing file: ${filePath}`, error);
			}
		}
	}
	console.log("All tests uploaded successfully");
};

uploadTests().catch(console.error);
