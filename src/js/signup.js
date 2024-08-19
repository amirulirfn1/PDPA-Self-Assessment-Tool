const main = require("./main.js");

const signupForm = document.querySelector("#signupForm");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("Form submitted");

  const terms = signupForm.terms.checked;
  const title = signupForm.title.value;
  const fullname = signupForm.fullname.value;
  const organization = signupForm.organization.value;
  const email = signupForm.email.value.toLowerCase();
  const phoneNumber = signupForm.phoneNumber.value;
  const address = signupForm.address.value;
  const password = signupForm.password.value;
  const passwordConfirm = signupForm.password2.value;

  let phoneRegEx = /^\d+$/;

  if (!title) {
    alert("Title is missing");
  } else if (!fullname) {
    alert("Name is missing");
  } else if (!organization) {
    alert("Organization name is missing");
  } else if (password !== passwordConfirm) {
    alert("Passwords are not the same");
  } else if (!terms) {
    alert("Please agree to these terms");
  } else if (!phoneRegEx.test(phoneNumber)) {
    alert("Invalid phone number format");
  } else {
    console.log("Creating user with email:", email);
    main
      .createUserWithEmailAndPassword(main.auth, email, password)
      .then((cred) => {
        console.log("User created:", cred.user.uid);
        if (cred.user != null) {
          main
            .setDoc(main.doc(main.db, "users", cred.user.uid), {
              personalDetails: {
                title: title,
                fullname: fullname,
                organization: organization,
                email: email,
                phoneNumber: phoneNumber,
                address: address,
              },
              type: "user",
            })
            .then(() => {
              console.log("Document written in users collection");
              signupForm.reset();
            })
            .catch((err) => {
              console.error("Error writing document:", err);
            });

          main.updateProfile(cred.user, {
            displayName: fullname,
            photoURL:
              "https://firebasestorage.googleapis.com/v0/b/utm-transporter.appspot.com/o/profilePicture%2Fdefault.jpg?alt=media&token=5d309385-bd0e-44fd-b69f-5362d6f8eee6",
          });

          main
            .sendEmailVerification(cred.user)
            .then(() => {
              alert(
                "Account created successfully, please check your email for verification"
              );
              window.location.href = "/signin.html";
            })
            .catch((err) => {
              alert(err.message);
            });
        }
      })
      .catch((err) => {
        console.error("Error creating user:", err);
        alert(err.message);
      });
  }
});
