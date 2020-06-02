import React from "react";
import ReactDOM from "react-dom";
import firebase from 'firebase/app';
import 'firebase/firestore';

import App from "./App";
import { API_KEY } from "./Google";

// Initialize Cloud Firestore through Firebase
window.store = firebase
  .initializeApp({
    apiKey: API_KEY,
    authDomain: "renotype.firebaseapp.com",
    databaseURL: "https://renotype.firebaseio.com",
    projectId: "renotype",
    storageBucket: "renotype.appspot.com",
    messagingSenderId: "450118682683"
  })
  .firestore();


const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
