const main = require("./main.js");
let userData;

// Function to populate the profile form with user data
const populateProfileForm = (userData) => {
  console.log("Populating form with user data:", userData); // Debugging log

  document.querySelector("#title").value = userData.personalDetails.title || "";
  document.querySelector("#fullname").value =
    userData.personalDetails.fullname || "";
  document.querySelector("#organization").value =
    userData.personalDetails.organization || "";
  document.querySelector("#email").value = userData.personalDetails.email || "";
  document.querySelector("#phoneNumber").value =
    userData.personalDetails.phoneNumber || "";
  document.querySelector("#address").value =
    userData.personalDetails.address || "";
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

// Check authentication state and populate profile data
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "users", user.uid))
      .then((doc) => {
        if (doc.exists()) {
          userData = doc.data();
          populateProfileForm(userData);
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    window.location.href = "/signin.html";
  }
});

// Update user profile data
const profileForm = document.querySelector("#detailsForm");
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedData = {
    personalDetails: {
      title: profileForm.title.value,
      fullname: profileForm.fullname.value,
      organization: profileForm.organization.value,
      phoneNumber: profileForm.phoneNumber.value,
      address: profileForm.address.value,
    },
  };

  main
    .updateDoc(
      main.doc(main.db, "users", main.auth.currentUser.uid),
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
