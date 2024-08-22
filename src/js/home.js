const main = require("./main.js");

main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    main
      .getDoc(main.doc(main.db, "users", user.uid))
      .then((doc) => {
        const userData = doc.data();
        if (userData && userData.type === "user") {
          // User is a regular user
          console.log("User is signed in and verified.");
        } else {
          // User type not found or not a regular user
          console.log("User type not found or not a regular user.");
          main.signOut(main.auth).then(() => {
            alert("Sign out due to unauthorized access.");
            window.location.href = "/signin.html";
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    // User is not signed in
    window.location.href = "/signin.html";
  }
});

// Sign out functionality
document.addEventListener("DOMContentLoaded", () => {
  const signoutBtn = document.querySelector("#signoutbtn");

  if (signoutBtn) {
    signoutBtn.addEventListener("click", (e) => {
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
});

// Change image functionality for rotating images
document.addEventListener("DOMContentLoaded", function () {
  const images = [
    "..\\img\\cta-bg.jpg",
    "..\\img\\pdpapic2.png",
    "..\\img\\pdpapic3.png",
  ];

  let currentIndex = 0;
  const imageElement = document.querySelector(".change-pic img");

  // Check if the image element exists
  if (imageElement) {
    function changeImage() {
      currentIndex = (currentIndex + 1) % images.length;
      imageElement.src = images[currentIndex];
      imageElement.classList.add("active");
    }

    setInterval(changeImage, 3000); // Change image every 3 seconds
  } else {
    console.error("Image element not found. Ensure the selector is correct.");
  }
});
