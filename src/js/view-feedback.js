const main = require("./main.js");

// Function to load feedbacks
const loadFeedbacks = (startDate, endDate) => {
  let feedbackQuery = main.collection(main.db, "feedback");

  if (startDate && endDate) {
    const startTimestamp = new Date(startDate);
    const endTimestamp = new Date(endDate);
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
      feedbackContainer.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const feedbackData = doc.data();
        const feedbackItem = document.createElement("div");
        feedbackItem.className = "feedback-item";
        feedbackItem.innerHTML = `
          <p><strong>Feedback:</strong> ${feedbackData.feedback}</p>
          <p><strong>Date:</strong> ${new Date(
            feedbackData.timestamp.seconds * 1000
          ).toLocaleString()}</p>
        `;
        feedbackContainer.appendChild(feedbackItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching feedbacks: ", error);
    });
};

// Function to handle form submission
const handleFormSubmit = (event) => {
  event.preventDefault();

  const startDate = document.querySelector("#startDate").value;
  const endDate = document.querySelector("#endDate").value;

  loadFeedbacks(startDate, endDate);
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
    loadFeedbacks();
  } else {
    window.location.href = "/signin.html";
  }
});

// Attach form submit event listener
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
