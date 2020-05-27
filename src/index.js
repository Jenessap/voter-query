import React from "react";
import ReactDOM from "react-dom";
//import * as firebase from "firebase";

import App from "./App";
import { API_KEY } from "./Google";

// Initialize Cloud Firestore through Firebase
/*window.db = firebase
  .initializeApp({
    apiKey: API_KEY,
    authDomain: "renotype.firebaseapp.com",
    databaseURL: "https://renotype.firebaseio.com",
    projectId: "renotype.firebaseapp.com",
    storageBucket: "renotype.appspot.com",
    messagingSenderId: "450118682683"
  })
  .firestore();*/

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);

