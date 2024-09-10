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

// Function to load user details
const loadUserDetails = (userId) => {
  const userDocRef = doc(db, "users", userId);
  getDoc(userDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data().personalDetails;
        document.getElementById("companyName").textContent =
          userData.organization;
        document.getElementById("userInCharge").textContent = userData.fullname;
        document.getElementById("userTitle").textContent = userData.title;
        document.getElementById("userAddress").textContent = userData.address;
        document.getElementById("userEmail").textContent = userData.email;
        document.getElementById("userPhone").textContent = userData.phoneNumber;
      } else {
        console.error("No such document!");
      }
    })
    .catch((error) => {
      console.error("Error fetching user details: ", error);
    });
};

// Function to calculate and display the assessment result (excluding "Not Applicable")
const calculateAssessmentResult = (userId) => {
  const q = query(collection(db, "assessments"), where("userId", "==", userId));

  getDocs(q)
    .then((querySnapshot) => {
      let totalScore = 0;
      let applicableQuestions = 0; // Only count applicable questions (exclude "Not Applicable")
      const improvementAreas = [];

      const promises = []; // Track promises to get question data

      querySnapshot.forEach((assessmentDoc) => {
        const assessment = assessmentDoc.data();
        const responses = assessment.responses;

        for (const questionId in responses) {
          const response = responses[questionId];

          // Fetch question details to display improvement suggestion if necessary
          const questionDocRef = doc(db, "questions", questionId);
          promises.push(
            getDoc(questionDocRef).then((questionDoc) => {
              if (questionDoc.exists()) {
                const questionData = questionDoc.data();

                // Exclude "Not Applicable" questions from the count and score
                if (response !== "Not Applicable") {
                  applicableQuestions++; // Count only applicable questions

                  if (response === "Yes") {
                    totalScore += 2; // Full score for "Yes"
                  } else if (response === "Partially") {
                    totalScore += 1; // Partial score for "Partially"
                  } else if (response === "No") {
                    // Add to improvement areas
                    improvementAreas.push({
                      question: questionData.question,
                      suggestions: questionData.suggestions, // Now using the array of suggestions
                    });
                  }
                }
              }
            })
          );
        }
      });

      Promise.all(promises)
        .then(() => {
          // Normalize the score based on the number of applicable questions
          const normalizedScore = applicableQuestions
            ? (totalScore / (2 * applicableQuestions)) * 100
            : 0;

          // Update user's result in Firestore
          return updateDoc(doc(db, "users", userId), {
            "results.score": normalizedScore,
            "results.improvementAreas": improvementAreas,
          }).then(() => {
            // Display the results after calculation
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

// Function to display the results with card design
const displayResults = (score, improvementAreas) => {
  const resultContainer = document.getElementById("resultContainer");
  if (resultContainer) {
    // Clear the container before adding new content
    resultContainer.innerHTML = `
      <h3>Assessment Results</h3>
      <p><strong>Score:</strong> ${score.toFixed(2)}%</p>
      <div class="progress">
        <div class="progress-bar" id="progressBar" style="width: ${score.toFixed(
          2
        )}%">${score.toFixed(2)}%</div>
      </div>
      <h4>Areas for Improvement:</h4>
    `;

    // Loop through each improvement area and create a card for it
    improvementAreas.forEach((area) => {
      const card = document.createElement("div");
      card.className = "card"; // Applying card style

      const question = document.createElement("p");
      question.innerHTML = `<strong>Question:</strong> ${area.question}`;

      const suggestionList = document.createElement("ul");
      area.suggestions.forEach((suggestion) => {
        const listItem = document.createElement("li");
        listItem.textContent = suggestion;
        suggestionList.appendChild(listItem);
      });

      const suggestionsDiv = document.createElement("div");
      suggestionsDiv.className = "suggestions";
      suggestionsDiv.innerHTML = "<strong>Suggestions:</strong>";
      suggestionsDiv.appendChild(suggestionList);

      card.appendChild(question);
      card.appendChild(suggestionsDiv);
      resultContainer.appendChild(card);
    });
  }
};

// Check authentication state, load user details, and calculate the assessment result
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    loadUserDetails(userId); // Load company and user details
    calculateAssessmentResult(userId); // Calculate and display assessment results
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
