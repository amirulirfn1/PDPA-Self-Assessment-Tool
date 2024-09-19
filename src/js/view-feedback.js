const main = require("./main.js");

// Function to load feedbacks with optional date range filtering
const loadFeedbacks = (startDate, endDate) => {
  let feedbackQuery = main.collection(main.db, "feedback");

  // Ensure dates are valid and create Date objects for Firestore query
  if (startDate && endDate) {
    const startTimestamp = new Date(startDate);
    const endTimestamp = new Date(endDate);
    endTimestamp.setHours(23, 59, 59, 999); // Include entire end date

    feedbackQuery = main.query(
      feedbackQuery,
      main.where("timestamp", ">=", startTimestamp),
      main.where("timestamp", "<=", endTimestamp)
    );
  }

  main
    .getDocs(feedbackQuery)
    .then((querySnapshot) => {
      const feedbackContainer = document.getElementById("feedbackContainer");
      feedbackContainer.innerHTML = ""; // Clear previous content

      if (querySnapshot.empty) {
        feedbackContainer.innerHTML =
          "<p>No feedback available for the selected date range.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const feedbackData = doc.data();
        const feedbackItem = document.createElement("div");
        feedbackItem.className = "feedback-item";

        // Convert string or Firestore timestamp to a Date object
        const feedbackDate = new Date(feedbackData.timestamp);

        feedbackItem.innerHTML = `
          <p><strong>Category:</strong> ${feedbackData.category}</p>
          <p><strong>Rating:</strong> ${feedbackData.rating}</p>
          <p><strong>Feedback:</strong> ${feedbackData.feedback}</p>
          <p><strong>Date:</strong> ${feedbackDate.toLocaleString()}</p>
        `;

        feedbackContainer.appendChild(feedbackItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching feedbacks: ", error);
    });
};

// Function to handle form submission for filtering feedback
const handleFormSubmit = (event) => {
  event.preventDefault();

  const startDate = document.querySelector("#startDate").value;
  const endDate = document.querySelector("#endDate").value;

  if (startDate && endDate) {
    loadFeedbacks(startDate, endDate);
  } else {
    alert("Please select both start and end dates.");
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

// Check authentication state and load the feedback data
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    loadFeedbacks(); // Load all feedback by default
  } else {
    window.location.href = "/signin.html";
  }
});

// Attach form submit event listener for filtering feedbacks
document
  .querySelector("#filterForm")
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
