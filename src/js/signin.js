const main = require("./main.js");

const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  try {
    // Sign in the user with email and password
    const cred = await main.signInWithEmailAndPassword(
      main.auth,
      email,
      password
    );

    if (cred.user.emailVerified) {
      // Check if multiFactor object is available
      const mfa = cred.user.multiFactor;

      if (mfa && mfa.enrolledFactors.length === 0) {
        // No MFA enrolled, prompt user to set it up
        alert(
          "Please set up multi-factor authentication (MFA) for additional security."
        );

        // Set up reCAPTCHA verifier
        const appVerifier = new main.RecaptchaVerifier(
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA verified");
            },
          },
          main.auth
        );

        const phoneProvider = new main.PhoneAuthProvider(main.auth);
        const phoneNumber = window.prompt(
          "Enter your phone number for MFA setup:"
        );

        const verificationId = await phoneProvider.verifyPhoneNumber(
          phoneNumber,
          appVerifier
        );
        const verificationCode = window.prompt(
          "Enter the verification code you received:"
        );

        const phoneCredential = main.PhoneAuthProvider.credential(
          verificationId,
          verificationCode
        );

        // Enroll the user in MFA
        await cred.user.multiFactor.enroll(phoneCredential, "Primary Phone");

        alert("MFA setup complete. You can now access your account securely.");
      }

      // Proceed to redirect user based on their type
      const userDoc = await main.getDoc(
        main.doc(main.db, "users", cred.user.uid)
      );

      if (userDoc.exists) {
        console.log("User document found:", userDoc.data());
        window.location.href = "/home.html";
      } else {
        const adminDoc = await main.getDoc(
          main.doc(main.db, "admins", cred.user.uid)
        );

        if (adminDoc.exists) {
          console.log("Admin document found:", adminDoc.data());
          window.location.href = "/adminmain.html";
        } else {
          console.log("User type not found. Please contact support.");
          alert("User type not found. Please contact support.");
        }
      }
    } else {
      alert("Please verify your email before signing in.");
      console.log("Email not verified:", cred.user.email);
    }
  } catch (error) {
    console.error("Error signing in:", error);
    alert(error.message);
  }
});
