const main = require("./main.js");

const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  main
    .signInWithEmailAndPassword(main.auth, email, password)
    .then((cred) => {
      if (cred.user.emailVerified) {
        main.getDoc(main.doc(main.db, "users", cred.user.uid)).then((doc) => {
          if (doc.exists) {
            console.log("User document found:", doc.data());
            window.location.href = "/home.html";
          } else {
            main
              .getDoc(main.doc(main.db, "admins", cred.user.uid))
              .then((doc) => {
                if (doc.exists) {
                  console.log("Admin document found:", doc.data());
                  window.location.href = "/adminmain.html";
                } else {
                  console.log("User type not found. Please contact support.");
                  alert("User type not found. Please contact support.");
                }
              });
          }
        });
      } else {
        alert("Please verify your email before signing in.");
        console.log("Email not verified:", cred.user.email);
      }
    })
    .catch((error) => {
      console.error("Error signing in:", error);
      alert(error.message);
    });
});
