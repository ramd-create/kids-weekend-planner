import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCChXRE3xxE_zTTDt0TEsfI1XgOpL341Ts",
  authDomain: "rasa-efb6e.firebaseapp.com",
  databaseURL: "https://rasa-efb6e-default-rtdb.firebaseio.com",
  projectId: "rasa-efb6e",
  storageBucket: "rasa-efb6e.firebasestorage.app",
  messagingSenderId: "810721861079",
  appId: "1:810721861079:web:2522ed1522416dd368ff92"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
