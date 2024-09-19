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

// Function to retrieve and display the assessment result
const displayAssessmentResults = (userId) => {
  const userDocRef = doc(db, "users", userId);
  getDoc(userDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const improvementAreaIds = userData.results.improvementAreas || [];

        console.log("Improvement Area IDs:", improvementAreaIds); // Debugging output

        // Fetch details for each question ID in improvementAreas
        const fetchPromises = improvementAreaIds.map((questionId) =>
          getDoc(doc(db, "questions", questionId))
        );

        Promise.all(fetchPromises)
          .then((questionDocs) => {
            const improvementAreas = [];

            questionDocs.forEach((questionDoc, index) => {
              if (questionDoc.exists()) {
                const questionData = questionDoc.data();
                console.log(`Question ${index + 1} Data:`, questionData); // Debugging output

                // Ensure suggestions is an array and handle undefined data
                const suggestions = Array.isArray(questionData.suggestions)
                  ? questionData.suggestions
                  : [];

                improvementAreas.push({
                  question:
                    questionData.question || "No question text available",
                  suggestions: suggestions, // Ensure suggestions is always an array
                });
              } else {
                console.error(
                  `Question ${index + 1} does not exist in the database.`
                );
              }
            });

            const score = userData.results.score || 0;
            displayResults(score, improvementAreas); // Call the display function with fetched data
          })
          .catch((error) => {
            console.error("Error fetching question details: ", error);
          });
      } else {
        console.error("No such document!");
      }
    })
    .catch((error) => {
      console.error("Error fetching user details: ", error);
    });
};

// Function to display the results with card design
const displayResults = (score, improvementAreas) => {
  const resultContainer = document.getElementById("resultContainer");
  if (resultContainer) {
    // Clear the container before adding new content
    resultContainer.innerHTML = `
      <h3>Assessment Results</h3>
      <p><strong>Implementation Percentage:</strong> ${score.toFixed(2)}%</p>
      <div class="progress">
        <div class="progress-bar" id="progressBar" style="width: ${score.toFixed(
          2
        )}%">${score.toFixed(2)}%</div>
      </div>
      <h4>Areas for Improvement:</h4>
    `;

    // Loop through each improvement area and create a card for it
    improvementAreas.forEach((area, index) => {
      console.log(`Displaying Question ${index + 1}:`, area); // Debugging output

      const card = document.createElement("div");
      card.className = "card"; // Applying card style

      const question = document.createElement("p");
      question.innerHTML = `<strong>Question:</strong> ${area.question}`;

      const suggestionList = document.createElement("ul");
      // Safely iterate over suggestions only if it's an array
      if (Array.isArray(area.suggestions) && area.suggestions.length > 0) {
        area.suggestions.forEach((suggestion) => {
          const listItem = document.createElement("li");
          listItem.textContent = suggestion;
          suggestionList.appendChild(listItem);
        });
      } else {
        console.warn(`No suggestions found for Question ${index + 1}`); // Debugging output
      }

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

// Check authentication state, load user details, and display assessment results
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    loadUserDetails(userId); // Load company and user details
    displayAssessmentResults(userId); // Fetch and display assessment results
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
