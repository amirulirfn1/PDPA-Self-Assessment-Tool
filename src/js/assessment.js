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
  getDocs,
  addDoc,
  updateDoc,
  doc,
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

let currentQuestionIndex = 0;
let questions = [];
let completedQuestions = new Set(); // To track completed questions

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadQuestions();
  } else {
    window.location.href = "/signin.html";
  }
});

// Function to load questions from Firestore
async function loadQuestions() {
  try {
    const q = collection(db, "questions");
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const questionData = doc.data();
      const questionId = doc.id;
      questions.push({
        id: questionId,
        data: questionData,
        selectedAnswer: null,
      });
    });

    if (questions.length > 0) {
      showQuestion();
      updateProgressIndicator();
    } else {
      console.error("No questions available");
    }
  } catch (error) {
    console.error("Error loading questions: ", error);
  }
}

// Function to show the current question and its options
function showQuestion() {
  const questionContainer = document.getElementById("questionContainer");
  if (!questionContainer) {
    console.error("Question container not found");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.querySelector(".progress-bar");

  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;

  questionContainer.innerHTML = `
    <div class="question-header">
      <h4>Question ${questionNumber} of ${questions.length}</h4>
      <h5>${currentQuestion.data.category}</h5>
    </div>
    <div class="question-body">
      <p>${currentQuestion.data.question}</p>
      <button class="toggle-description" id="toggleDescriptionBtn" type="button">▼ Show Description</button>
      <div class="description" id="description" style="display: none;">
        <p>${currentQuestion.data.description}</p>
      </div>
      <ul class="answer-choice" style="list-style-type: none !important">
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-yes" value="Yes" />
          <label for="${currentQuestion.id}-yes">Yes</label>
        </li>
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-partially" value="Partially" />
          <label for="${currentQuestion.id}-partially">Partially</label>
        </li>
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-no" value="No" />
          <label for="${currentQuestion.id}-no">No</label>
        </li>
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-notapplicable" value="Not Applicable" />
          <label for="${currentQuestion.id}-notapplicable">Not Applicable</label>
        </li>
      </ul>
    </div>
  `;

  // Toggle Description visibility
  const toggleDescriptionBtn = document.getElementById("toggleDescriptionBtn");
  const description = document.getElementById("description");

  toggleDescriptionBtn.addEventListener("click", () => {
    const isVisible = description.style.display === "block";
    description.style.display = isVisible ? "none" : "block";
    toggleDescriptionBtn.textContent = isVisible
      ? "▼ Show Description"
      : "▲ Hide Description";
  });

  // Repopulate saved answer
  if (currentQuestion.selectedAnswer) {
    const savedAnswerRadio = document.getElementById(
      `${currentQuestion.id}-${currentQuestion.selectedAnswer.toLowerCase()}`
    );
    if (savedAnswerRadio) {
      savedAnswerRadio.checked = true;
    }
  }

  // Update button visibility
  if (currentQuestionIndex === questions.length - 1) {
    submitBtn.classList.remove("d-none");
    nextBtn.classList.add("d-none");
  } else {
    submitBtn.classList.add("d-none");
    nextBtn.classList.remove("d-none");
  }

  prevBtn.style.visibility = currentQuestionIndex === 0 ? "hidden" : "visible";

  // Update progress bar
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress);

  // Update progress indicator after each question load
  updateProgressIndicator();
}

// Function to update the progress indicator
function updateProgressIndicator() {
  const progressIndicator = document.getElementById("progressIndicator");

  if (!progressIndicator) {
    console.error("Progress indicator element not found");
    return;
  }

  progressIndicator.innerHTML = ""; // Clear previous indicators

  questions.forEach((question, index) => {
    const indicator = document.createElement("span");
    indicator.classList.add("progress-dot");
    indicator.classList.add(
      completedQuestions.has(question.id) ? "completed" : "pending"
    );
    indicator.setAttribute("data-index", index + 1);

    // Make the dots clickable
    indicator.addEventListener("click", () => {
      currentQuestionIndex = index;
      showQuestion();
    });

    progressIndicator.appendChild(indicator);
  });
}

document.getElementById("prevBtn").addEventListener("click", () => {
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = document.querySelector(
    `input[name="${currentQuestion.id}"]:checked`
  );

  if (selectedOption) {
    currentQuestion.selectedAnswer = selectedOption.value; // Save the selected answer before going back
  }

  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = document.querySelector(
    `input[name="${currentQuestion.id}"]:checked`
  );

  // Make sure the user has selected an answer
  if (!selectedOption) {
    alert("Please select an answer before proceeding.");
    return;
  }

  // Store the selected answer
  currentQuestion.selectedAnswer = selectedOption.value;

  completedQuestions.add(currentQuestion.id);

  // Move to the next question if it's not the last one
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const assessmentForm = document.querySelector("#assessmentForm");

  assessmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = assessmentForm.submitBtn;
    submitBtn.disabled = true;

    const responses = {};
    questions.forEach((question) => {
      responses[question.id] = question.selectedAnswer || "No answer";
    });

    const userId = auth.currentUser.uid;
    let score = 0;
    const improvementAreas = [];

    // Calculate score and determine improvement areas
    for (const questionId in responses) {
      const response = responses[questionId];

      if (response === "Yes") {
        score += 2; // Full score for "Yes"
      } else if (response === "Partially") {
        score += 1; // Partial score for "Partially"
      } else if (response === "No") {
        improvementAreas.push(questionId); // Log areas that need improvement
      }
    }

    const normalizedScore = (score / (questions.length * 2)) * 100;

    try {
      await addDoc(collection(db, "assessments"), {
        userId: userId,
        responses: responses,
        timestamp: new Date().toISOString(),
      });

      await updateDoc(doc(db, "users", userId), {
        "results.score": normalizedScore,
        "results.improvementAreas": improvementAreas,
      });

      alert("Assessment submitted successfully");
      window.location.href = "/assessmentresult.html";
    } catch (error) {
      console.error("Error saving assessment: ", error.message);
      alert("Error submitting assessment.");
      submitBtn.disabled = false;
    }
  });

  const signoutbtn = document.querySelector("#signoutbtn");

  if (signoutbtn) {
    signoutbtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to sign out?")) {
        signOut(auth)
          .then(() => {
            alert("Signing out...");
            window.location.href = "/signin.html";
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    });
  }
});
