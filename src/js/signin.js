// Import centralized Firebase configuration and services
import {
  auth,
  db,
  signInWithEmailAndPassword,
  getDoc,
  doc,
  RecaptchaVerifier,
  PhoneAuthProvider,
} from "../shared/config/firebase.js";
import errorHandler from "../shared/services/errorHandler.js";
import validationService from "../shared/services/validation.js";

const loginForm = document.querySelector("#loginForm");

// Set up validation rules
const validationRules = {
  email: [
    { type: 'required', fieldName: 'Email' },
    { type: 'email' }
  ],
  password: [
    { type: 'required', fieldName: 'Password' }
  ]
};

// Set up real-time validation
validationService.setupRealTimeValidation(loginForm, validationRules);

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  validationService.clearFormErrors(loginForm);
  
  const formData = {
    email: loginForm.email.value,
    password: loginForm.password.value
  };

  // Validate form
  const validation = validationService.validateForm(formData, validationRules);
  if (!validation.isValid) {
    validationService.showFormErrors(loginForm, validation.errors);
    return;
  }

  try {
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    // Sign in the user with email and password
    const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);

    if (cred.user.emailVerified) {
      // Check if multiFactor object is available
      const mfa = cred.user.multiFactor;

      if (mfa && mfa.enrolledFactors.length === 0) {
        // No MFA enrolled, prompt user to set it up
        errorHandler.showError("Please set up multi-factor authentication (MFA) for additional security.");

        try {
          // Set up reCAPTCHA verifier
          const appVerifier = new RecaptchaVerifier(
            "recaptcha-container",
            {
              size: "invisible",
              callback: (response) => {
                console.log("reCAPTCHA verified");
              },
            },
            auth
          );

          const phoneProvider = new PhoneAuthProvider(auth);
          const phoneNumber = window.prompt("Enter your phone number for MFA setup:");

          if (!phoneNumber) {
            errorHandler.showError("Phone number is required for MFA setup.");
            return;
          }

          const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, appVerifier);
          const verificationCode = window.prompt("Enter the verification code you received:");

          if (!verificationCode) {
            errorHandler.showError("Verification code is required.");
            return;
          }

          const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);

          // Enroll the user in MFA
          await cred.user.multiFactor.enroll(phoneCredential, "Primary Phone");

          errorHandler.showSuccess("MFA setup complete. You can now access your account securely.");
        } catch (mfaError) {
          errorHandler.handleAuthError(mfaError);
          return;
        }
      }

      // Proceed to redirect user based on their type
      try {
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));

        if (userDoc.exists) {
          console.log("User document found:", userDoc.data());
          errorHandler.showSuccess("Sign in successful! Redirecting...");
          setTimeout(() => {
            window.location.href = "/home.html";
          }, 1000);
        } else {
          const adminDoc = await getDoc(doc(db, "admins", cred.user.uid));

          if (adminDoc.exists) {
            console.log("Admin document found:", adminDoc.data());
            errorHandler.showSuccess("Admin sign in successful! Redirecting...");
            setTimeout(() => {
              window.location.href = "/adminmain.html";
            }, 1000);
          } else {
            console.log("User type not found. Please contact support.");
            errorHandler.showError("User type not found. Please contact support.");
          }
        }
      } catch (dbError) {
        errorHandler.handleDatabaseError(dbError);
      }
    } else {
      errorHandler.showError("Please verify your email before signing in.");
      console.log("Email not verified:", cred.user.email);
    }
  } catch (error) {
    console.error("Error signing in:", error);
    const userMessage = errorHandler.handleAuthError(error);
    errorHandler.showError(userMessage);
  } finally {
    // Reset button state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Sign In';
    submitBtn.disabled = false;
  }
});
