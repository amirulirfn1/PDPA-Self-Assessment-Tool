////////////////////////////MUST HAVE////////////////////////////
const main = require("./main.js");
/////////////////////////////////////////////////////////////////

const resetForm = document.querySelector("#resetForm");

resetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = resetForm.email.value.toLowerCase();

  main
    .sendPasswordResetEmail(main.auth, email)
    .then(() => {
      alert("Reset form has been sent to you! Please check your email.");
      resetForm.reset();
    })
    .catch((error) => {
      alert(error.message);
    });
});
