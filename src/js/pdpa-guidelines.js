const main = require("./main.js");

/**
 * Legacy compatibility page.
 * Transporter/booking logic was removed because it belonged to another domain
 * and introduced privileged data operations outside PDPA scope.
 */
main.onAuthStateChanged(main.auth, (user) => {
  if (!user) {
    window.location.href = "/signin.html";
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
          window.location.href = "/signin.html";
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  });
}
