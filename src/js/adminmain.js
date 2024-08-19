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
    newAdminForm.classList.toggle("show");
  });
}

if (newAdminForm) {
  newAdminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const adminName = newAdminForm.querySelector("#adminName").value;
    const adminEmail = newAdminForm.querySelector("#adminEmail").value;

    // Create a new admin user with email and default password
    main
      .createUserWithEmailAndPassword(main.auth2, adminEmail, "defaultPassword")
      .then((cred) => {
        return main.setDoc(main.doc(main.db, "admins", cred.user.uid), {
          username: adminName,
          email: adminEmail,
          type: "admin",
        });
      })
      .then(() => {
        alert("New admin created successfully.");
        newAdminForm.reset();
        newAdminForm.classList.remove("show");
      })
      .catch((error) => {
        console.error("Error creating new admin:", error);
        alert(error.message);
      });
  });
}
