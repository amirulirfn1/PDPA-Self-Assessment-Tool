const main = require("./main.js");

// Handle user authentication state
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "admins", user.uid))
      .then((doc) => {
        if (doc.exists) {
          window.location.href = "/adminmain.html";
        } else {
          alert("You are not authorized to access this page.");
          main.signOut(main.auth);
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
        alert("Error accessing admin data.");
        main.signOut(main.auth);
      });
  }
});

// Handle login form submission
const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  main
    .signInWithEmailAndPassword(main.auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return main.getDoc(main.doc(main.db, "admins", user.uid));
    })
    .then((doc) => {
      if (doc.exists) {
        alert("Sign in successful");
        window.location.href = "/adminmain.html";
      } else {
        alert("No admin found with this email.");
        main.signOut(main.auth);
      }
    })
    .catch((error) => {
      alert("Sign in failed: " + error.message);
    });
});
