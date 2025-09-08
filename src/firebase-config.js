// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ВАЖНО: Перенесите эти ключи в переменные окружения!
const firebaseConfig = {
  apiKey: "AIzaSyDrtF0JVYttXpp8nfsbeeiMpbraGfTUi4k",
  authDomain: "troakar-prompt-manager.firebaseapp.com",
  projectId: "troakar-prompt-manager",
  storageBucket: "troakar-prompt-manager.firebasestorage.app",
  messagingSenderId: "990600187347",
  appId: "1:990600187347:web:3e150bd2100bc0c6493326",
  measurementId: "G-1F1W3QSD4F"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем экземпляр Firestore для использования в других файлах
export const db = getFirestore(app);