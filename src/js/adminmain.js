const main = require("./main.js");
let userData;

main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "admins", user.uid))
      .then((doc) => {
        userData = doc.data();
        const welcomeMessage = document.querySelector("#welcomeMessage");
        if (welcomeMessage) {
          welcomeMessage.textContent = `Welcome, ${userData.fullname}`;
        }
      })
      .catch((error) => {
        console.error("Error fetching admin data:", error);
        alert(
          "Error fetching admin data: Missing or insufficient permissions."
        );
      });
  } else {
    window.location.href = "/loginadmin.html";
  }
});

const signoutbtn = document.querySelector("#signoutbtn");

if (signoutbtn) {
  signoutbtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to sign out?")) {
      main
        .signOut(main.auth)
        .then(() => {
          alert("Signing out...");
          window.location.href = "/loginadmin.html";
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

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

if (newAdminForm) {
  newAdminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert(
      "Legacy admin creation is disabled. Use the new /admin role assignment flow."
    );
  });
}
