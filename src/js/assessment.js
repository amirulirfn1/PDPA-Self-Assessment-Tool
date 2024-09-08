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
  query,
  onSnapshot,
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

async function loadQuestions() {
  try {
    const q = query(collection(db, "questions"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const questionData = doc.data();
      const questionId = doc.id;
      console.log("Question fetched:", questionData);
      questions.push({ id: questionId, data: questionData });
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

  console.log("Displaying question:", currentQuestion);

  // Add a toggle arrow for description and description section
  questionContainer.innerHTML = `
    <div class="question-header">
      <h4>Question ${questionNumber} of ${questions.length}</h4>
      <h5>${currentQuestion.data.category}</h5>
    </div>
    <div class="question-body">
      <p>${currentQuestion.data.question}</p>
      <button class="toggle-description" id="toggleDescriptionBtn">▼ Show Description</button>
      <div class="description" id="description" style="display: none;">
        <p>${currentQuestion.data.description}</p>
      </div>
      <ul class="answer-choice" style="list-style-type: none !important">
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-yes" value="Yes" required />
          <label for="${currentQuestion.id}-yes">Yes</label>
        </li>
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-partially" value="Partially" required />
          <label for="${currentQuestion.id}-partially">Partially</label>
        </li>
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-no" value="No" required />
          <label for="${currentQuestion.id}-no">No</label>
        </li>
        <li class="form-group">
          <input type="radio" name="${currentQuestion.id}" id="${currentQuestion.id}-notapplicable" value="Not Applicable" required />
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

  prevBtn.style.visibility = currentQuestionIndex === 0 ? "hidden" : "visible";
  nextBtn.style.display =
    currentQuestionIndex === questions.length - 1 ? "none" : "inline-block";
  submitBtn.classList.toggle(
    "d-none",
    currentQuestionIndex !== questions.length - 1
  );

  // Update progress bar
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress);

  // Update progress indicator after each question load
  updateProgressIndicator();
}

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
    indicator.setAttribute("data-index", index + 1); // Attach the question number

    // Make the dots clickable
    indicator.addEventListener("click", () => {
      currentQuestionIndex = index;
      showQuestion();
    });

    progressIndicator.appendChild(indicator);
  });
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1) {
    // Mark the current question as completed before moving to the next
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = document.querySelector(
      `input[name="${currentQuestion.id}"]:checked`
    );

    if (selectedOption) {
      completedQuestions.add(currentQuestion.id);
    }

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
    const formData = new FormData(assessmentForm);
    formData.forEach((value, key) => {
      responses[key] = value;
    });

    const userId = auth.currentUser.uid;
    let score = 0;
    const improvementAreas = [];
    let totalImportance = 0;

    // Calculate score and determine improvement areas
    for (const questionId in responses) {
      const response = responses[questionId];
      const questionDoc = await getDoc(doc(db, "questions", questionId));
      const questionData = questionDoc.data();
      const weight = parseInt(questionData.importance, 10) || 1;

      if (response !== "Not Applicable") {
        totalImportance += weight;
      }

      if (response === "Yes") {
        score += 2 * weight;
      } else if (response === "Partially") {
        score += 1 * weight;
      } else if (response === "No") {
        improvementAreas.push(questionId);
      }
    }

    const normalizedScore = totalImportance
      ? (score / (2 * totalImportance)) * 100
      : 0;

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
      alert(error.message);
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
