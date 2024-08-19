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
  where,
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadQuestions();
  } else {
    window.location.href = "/signin.html";
  }
});

async function loadQuestions() {
  const questionsContainer = document.getElementById("questionsContainer");
  try {
    const q = query(collection(db, "questions"));
    const querySnapshot = await getDocs(q);

    const questionsByCategory = {};

    querySnapshot.forEach((doc) => {
      const questionData = doc.data();
      const questionId = doc.id;
      const category = questionData.category || "Uncategorized";

      if (!questionsByCategory[category]) {
        questionsByCategory[category] = [];
      }

      questionsByCategory[category].push({
        id: questionId,
        data: questionData,
      });
    });

    let questionHTML = "";

    for (const category in questionsByCategory) {
      questionHTML += `<h3>${category}</h3>`;
      questionsByCategory[category].forEach(({ id, data }) => {
        questionHTML += `
          <div class="tajuk">
            <h4>${data.category}</h4>
            <div class="row" style="padding-bottom: 10px">
              <div class="col-lg-10 col-md-6">
                <p>${data.question}</p>
                <p># ${data.description}</p>
                <p class="suggestion">Suggestion</p>
                <p class="suggestion-text" style="font-size: 15px">
                  ${data.suggestion}
                </p>
              </div>
              <div class="col-lg-2 col-md-6">
                <p>Importance Rating: <b>${data.importance}</b></p>
                <ul class="answer-choice" style="list-style-type: none !important">
                  <li class="form-group">
                    <input type="radio" name="${id}" id="${id}-yes" value="Yes" required />
                    <label for="${id}-yes">Yes</label>
                  </li>
                  <li class="form-group">
                    <input type="radio" name="${id}" id="${id}-partially" value="Partially" required />
                    <label for="${id}-partially">Partially</label>
                  </li>
                  <li class="form-group">
                    <input type="radio" name="${id}" id="${id}-no" value="No" required />
                    <label for="${id}-no">No</label>
                  </li>
                  <li class="form-group">
                    <input type="radio" name="${id}" id="${id}-notapplicable" value="Not Applicable" required />
                    <label for="${id}-notapplicable">Not Applicable</label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `;
      });
    }

    questionsContainer.innerHTML = questionHTML;
  } catch (error) {
    console.error("Error loading questions: ", error);
  }
}

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
