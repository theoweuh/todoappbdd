// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEffDiUrHj0NlxIldgjBhsR8_OMGBJ3TM",
  authDomain: "tdbddfirebase.firebaseapp.com",
  projectId: "tdbddfirebase",
  storageBucket: "tdbddfirebase.appspot.com",
  messagingSenderId: "71119208205",
  appId: "1:71119208205:web:c4235d13d3e3c3cfa3ba44",
  measurementId: "G-071GMGHYP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);