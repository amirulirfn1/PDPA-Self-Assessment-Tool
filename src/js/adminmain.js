const main = require("./main.js");
const { getFunctions, httpsCallable } = require("firebase/functions");
const functions = getFunctions();
const createAdminUser = httpsCallable(functions, "createAdminUser");
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
  newAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const adminName = newAdminForm.querySelector("#adminName").value;
    const adminEmail = newAdminForm.querySelector("#adminEmail").value;

    try {
      await createAdminUser({ name: adminName, email: adminEmail });
      await main.sendPasswordResetEmail(main.auth2, adminEmail);
      alert(
        "New admin created successfully. A password reset email has been sent."
      );
      newAdminForm.reset();
      newAdminForm.classList.remove("show");
    } catch (error) {
      console.error("Error creating new admin:", error);
      alert(error.message);
    }
  });
}
