import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id", // <--- Esta linha precisa existir com o ID do seu projeto!
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789...:web:..."
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);