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
    newAdminForm.classList.add("show");
    newAdminBtn.style.visibility = "hidden";
    console.log(main.auth.currentUser);
  });
}

// Handle new admin form submission
if (newAdminForm) {
  newAdminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = newAdminForm.username.value;
    const email = newAdminForm.email.value;
    const password = "123456"; // default password

    main
      .createUserWithEmailAndPassword(main.auth2, email, password)
      .then((cred) => {
        if (cred.user) {
          return main
            .updateProfile(cred.user, {
              displayName: username,
            })
            .then(() => {
              return main.setDoc(main.doc(main.db, "admins", username), {
                email: email,
                type: "admin",
                uid: cred.user.uid,
              });
            });
        }
      })
      .then(() => {
        alert("New admin saved successfully!");
        newAdminForm.reset();
        newAdminForm.classList.remove("show");
        newAdminBtn.style.visibility = "visible";
        return main.signOut(main.auth2);
      })
      .catch((err) => {
        alert(err.message);
      });
  });
}
