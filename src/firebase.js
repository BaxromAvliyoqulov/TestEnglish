import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
