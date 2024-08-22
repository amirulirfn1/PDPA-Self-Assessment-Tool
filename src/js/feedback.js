const main = require("./main.js");
let userData;

main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "users", user.uid))
      .then((doc) => {
        userData = doc.data();
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    window.location.href = "/signin.html";
  }
});

const feedbackForm = document.querySelector("#feedbackForm");

feedbackForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const feedback = feedbackForm.feedback.value;
  const rating = document.querySelector('input[name="rating"]:checked').value;
  const category = feedbackForm.category.value;
  const userId = main.auth.currentUser.uid;

  main
    .addDoc(main.collection(main.db, "feedback"), {
      userId: userId,
      feedback: feedback,
      rating: rating,
      category: category,
      timestamp: new Date().toISOString(),
    })
    .then(() => {
      document.getElementById("successMessage").style.display = "block";
      feedbackForm.reset();
    })
    .catch((err) => {
      alert(err.message);
    });
});

// LOGOUT
const signoutbtn = document.querySelector("#signoutbtn");

if (signoutbtn) {
  signoutbtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to sign out?")) {
      main
        .signOut(main.auth)
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
