const main = require("./main.js");

let questionId; // Store the question ID here
let currentPage = 1;
const questionsPerPage = 5;
let questions = [];

// Function to load all questions
const loadQuestions = () => {
  main
    .getDocs(main.collection(main.db, "questions"))
    .then((querySnapshot) => {
      questions = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, data: doc.data() });
      });
      displayQuestions();
    })
    .catch((error) => {
      console.error("Error fetching questions: ", error);
    });
};

// Function to display questions for the current page
const displayQuestions = () => {
  const questionsContainer = document.getElementById("questionsContainer");
  questionsContainer.innerHTML = "";

  const start = (currentPage - 1) * questionsPerPage;
  const end = start + questionsPerPage;
  const questionsToShow = questions.slice(start, end);

  questionsToShow.forEach(({ id, data }) => {
    const questionItem = document.createElement("div");
    questionItem.className = "question-item";
    questionItem.innerHTML = `
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Description:</strong> ${data.description}</p>
      <p><strong>Question:</strong> ${data.question}</p>
      <p><strong>Suggestion:</strong> ${data.suggestion}</p>
      <p><strong>Importance:</strong> ${data.importance}</p>
      <button class="btn" onclick="editQuestion('${id}')">Edit</button>
      <button class="btn" onclick="deleteQuestion('${id}')">Delete</button>
    `;
    questionsContainer.appendChild(questionItem);
  });

  document.getElementById("prevPageBtn").disabled = currentPage === 1;
  document.getElementById("nextPageBtn").disabled = end >= questions.length;
};

// Function to load a specific question for editing
const loadQuestion = (id) => {
  main
    .getDoc(main.doc(main.db, "questions", id))
    .then((doc) => {
      if (doc.exists) {
        const questionData = doc.data();
        populateForm(questionData);
      } else {
        alert("No such question!");
      }
    })
    .catch((error) => {
      console.error("Error loading question: ", error);
    });
};

// Function to populate the form with question data
const populateForm = (data) => {
  document.querySelector("#category").value = data.category || "";
  document.querySelector("#description").value = data.description || "";
  document.querySelector("#question").value = data.question || "";
  document.querySelector("#suggestion").value = data.suggestion || "";
  document.querySelector("#importance").value = data.importance || "";
  document.querySelector("#editQuestionForm").style.display = "block";
  document.getElementById("overlay").style.display = "block";
};

// Function to handle form submission
const handleFormSubmit = (event) => {
  event.preventDefault();

  const updatedData = {
    category: document.querySelector("#category").value,
    description: document.querySelector("#description").value,
    question: document.querySelector("#question").value,
    suggestion: document.querySelector("#suggestion").value,
    importance: document.querySelector("#importance").value,
  };

  if (questionId) {
    // Update existing question
    main
      .updateDoc(main.doc(main.db, "questions", questionId), updatedData)
      .then(() => {
        alert("Question updated successfully");
        closeEditModal();
        loadQuestions();
      })
      .catch((error) => {
        console.error("Error updating question: ", error);
      });
  } else {
    // Add new question
    main
      .addDoc(main.collection(main.db, "questions"), updatedData)
      .then(() => {
        alert("Question added successfully");
        closeEditModal();
        loadQuestions();
      })
      .catch((error) => {
        console.error("Error adding question: ", error);
      });
  }
};

// Function to handle user sign-out
const handleSignOut = () => {
  main
    .signOut(main.auth)
    .then(() => {
      alert("Signing out...");
      window.location.href = "/signin.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
};

// Function to handle edit button click
window.editQuestion = (id) => {
  questionId = id;
  loadQuestion(id);
};

// Function to handle delete button click
window.deleteQuestion = (id) => {
  if (confirm("Are you sure you want to delete this question?")) {
    main
      .deleteDoc(main.doc(main.db, "questions", id))
      .then(() => {
        alert("Question deleted successfully");
        loadQuestions();
      })
      .catch((error) => {
        console.error("Error deleting question: ", error);
      });
  }
};

// Function to handle add button click
window.addQuestion = () => {
  questionId = null;
  document.querySelector("#editQuestionForm").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  document.querySelector("#editQuestionForm").reset();
};

// Function to handle cancel button click
window.cancelEdit = () => {
  closeEditModal();
};

// Function to close the edit modal
const closeEditModal = () => {
  document.querySelector("#editQuestionForm").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

// Pagination handling
document.getElementById("prevPageBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayQuestions();
  }
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
  if (currentPage * questionsPerPage < questions.length) {
    currentPage++;
    displayQuestions();
  }
});

// Check authentication state and load the question data
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    loadQuestions();
  } else {
    window.location.href = "/signin.html";
  }
});

// Attach form submit event listener
document
  .querySelector("#editQuestionForm")
  .addEventListener("submit", handleFormSubmit);

// Add event listener for sign-out button
const signoutBtn = document.querySelector("#signoutbtn");
if (signoutBtn) {
  signoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to sign out?")) {
      handleSignOut();
    }
  });
}
