import $ from "jquery";
import "../scss/style.scss";
import AOS from "aos";
import Isotope from "isotope-layout";
import Waypoint from "waypoints/lib/noframework.waypoints.min.js";
import GLightbox from "glightbox";
import Swiper from "swiper/bundle";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBibjeVdQv1h-M-UjdgVzcDj8tKCb9LHYA",
  authDomain: "pdpa-self-assessment-tool.firebaseapp.com",
  databaseURL: "https://pdpa-self-assessment-tool-default-rtdb.firebaseio.com",
  projectId: "pdpa-self-assessment-tool",
  storageBucket: "pdpa-self-assessment-tool.appspot.com",
  messagingSenderId: "394371555199",
  appId: "1:394371555199:web:ef84f0a031b9bf8bbd444a",
  measurementId: "G-PXLM35TRCV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to calculate and display the assessment result
const calculateAssessmentResult = (userId) => {
  const q = query(collection(db, "assessments"), where("userId", "==", userId));

  getDocs(q)
    .then((querySnapshot) => {
      let totalScore = 0;
      let totalImportance = 0;
      const improvementAreas = [];

      const promises = [];

      querySnapshot.forEach((assessmentDoc) => {
        const assessment = assessmentDoc.data();
        const responses = assessment.responses;

        for (const questionId in responses) {
          const response = responses[questionId];
          const questionDocRef = doc(db, "questions", questionId);
          promises.push(
            getDoc(questionDocRef).then((questionDoc) => {
              if (questionDoc.exists()) {
                const questionData = questionDoc.data();
                const importance = parseInt(questionData.importance, 10) || 1;

                if (response !== "Not Applicable") {
                  totalImportance += importance;
                }

                if (response === "Yes") {
                  totalScore += 2 * importance;
                } else if (response === "Partially") {
                  totalScore += 1 * importance;
                } else if (response === "No") {
                  improvementAreas.push({
                    question: questionData.question,
                    suggestion: questionData.suggestion,
                  });
                }
              }
            })
          );
        }
      });

      Promise.all(promises)
        .then(() => {
          const normalizedScore = totalImportance
            ? (totalScore / (2 * totalImportance)) * 100
            : 0;

          return updateDoc(doc(db, "users", userId), {
            "results.score": normalizedScore,
            "results.improvementAreas": improvementAreas,
          }).then(() => {
            displayResults(normalizedScore, improvementAreas);
          });
        })
        .catch((error) => {
          console.error("Error calculating assessment result: ", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching assessments: ", error);
    });
};

// Function to display the results
const displayResults = (score, improvementAreas) => {
  const resultContainer = document.getElementById("resultContainer");
  if (resultContainer) {
    resultContainer.innerHTML = `
      <h3>Assessment Results</h3>
      <p>Score: ${score.toFixed(2)}%</p>
      <h4>Areas for Improvement:</h4>
      <ul>
        ${improvementAreas
          .map(
            (area) => `
            <li>
              <strong>Question:</strong> ${area.question}<br>
              <strong>Suggestion:</strong> ${area.suggestion}
            </li>`
          )
          .join("")}
      </ul>
    `;
  }
};

// Check authentication state and calculate the assessment result
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    calculateAssessmentResult(userId);
  } else {
    window.location.href = "/signin.html";
  }
});

// Function to handle user sign-out
const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      alert("Signing out...");
      window.location.href = "/signin.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
};

// Add event listener for sign-out button
document.addEventListener("DOMContentLoaded", () => {
  const signoutBtn = document.querySelector("#signoutbtn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to sign out?")) {
        handleSignOut();
      }
    });
  }
});
