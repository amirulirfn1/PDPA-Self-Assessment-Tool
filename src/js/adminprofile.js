const main = require("./main.js");
let adminData;

// Function to populate the profile form with admin data
const populateProfileForm = (adminData) => {
  document.querySelector("#fullname").value = adminData.fullName || "";
  document.querySelector("#email").value = adminData.email || "";
};

// Function to handle admin sign-out
const handleSignOut = () => {
  main
    .signOut(main.auth)
    .then(() => {
      alert("Signing out...");
      window.location.href = "/loginadmin.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
};

// Check authentication state and populate profile data
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "admins", user.uid))
      .then((doc) => {
        if (doc.exists()) {
          adminData = doc.data();
          populateProfileForm(adminData);
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    window.location.href = "/loginadmin.html";
  }
});

// Update admin profile data
const adminProfileForm = document.querySelector("#adminProfileForm");
adminProfileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedData = {
    fullName: adminProfileForm.fullname.value,
    email: adminProfileForm.email.value,
  };

  main
    .updateDoc(
      main.doc(main.db, "admins", main.auth.currentUser.uid),
      updatedData
    )
    .then(() => {
      alert("Profile updated successfully");
    })
    .catch((error) => {
      console.error("Error updating profile:", error);
    });
});

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
