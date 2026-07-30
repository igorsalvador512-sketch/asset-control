import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...", // cole aqui a sua apiKey completa que estava na linha 25
  authDomain: "controle-de-estoque-e689b.firebaseapp.com",
  projectId: "controle-de-estoque-e689b",
  storageBucket: "controle-de-estoque-e689b.firebasestorage.app",
  messagingSenderId: "399935986577",
  appId: "1:399935986577:web:2778dac2f70687bc201830",
  measurementId: "G-EPBJN9J3WP"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para ser usado nas telas
export const db = getFirestore(app);