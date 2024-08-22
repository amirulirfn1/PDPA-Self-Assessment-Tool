const main = require("./main.js");
let userData;

// Get user data and populate form
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "users", user.uid))
      .then((doc) => {
        userData = doc.data();
        document.getElementById("title").value = userData.personalDetails.title;
        document.getElementById("fullname").value =
          userData.personalDetails.fullname;
        document.getElementById("organization").value =
          userData.personalDetails.organization;
        document.getElementById("email").value = userData.personalDetails.email;
        document.getElementById("phoneNumber").value =
          userData.personalDetails.phoneNumber;
        document.getElementById("address").value =
          userData.personalDetails.address;
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    window.location.href = "/signin.html";
  }
});

// Update user data
const profileForm = document.querySelector("#detailsForm");

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const fullname = document.getElementById("fullname").value;
  const organization = document.getElementById("organization").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const address = document.getElementById("address").value;

  main
    .updateDoc(main.doc(main.db, "users", main.auth.currentUser.uid), {
      "personalDetails.title": title,
      "personalDetails.fullname": fullname,
      "personalDetails.organization": organization,
      "personalDetails.phoneNumber": phoneNumber,
      "personalDetails.address": address,
    })
    .then(() => {
      document.getElementById("successMessage").style.display = "block";
    })
    .catch((err) => {
      alert("Error updating profile: " + err.message);
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
