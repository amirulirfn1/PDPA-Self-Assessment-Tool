const main = require("./main.js");
let userData;

main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "users", user.uid))
      .then((doc) => {
        userData = doc.data();
        if (userData.type === "user" && user.emailVerified) {
          window.location.href = "/home.html";
        } else if (userData.type === "admin" && user.emailVerified) {
          window.location.href = "/adminmain.html";
        } else {
          alert("Please verify your email.");
          main.signOut(main.auth);
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    // No user is signed in, stay on the index page
  }
});

// Sign out
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

// Open add new admin form
const newAdminBtn = document.querySelector("#newAdminBtn");
const newAdminForm = document.querySelector("#newAdminForm");
if (newAdminBtn) {
  newAdminBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alert(
      "Legacy admin creation is disabled. Use the new /admin role assignment flow."
    );
  });
}

// Handle new admin form submission
if (newAdminForm) {
  newAdminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert(
      "Legacy admin creation is disabled. Use the new /admin role assignment flow."
    );
  });
}
