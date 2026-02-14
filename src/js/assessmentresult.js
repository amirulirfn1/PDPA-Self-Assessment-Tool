const main = require("./main.js");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadUserDetails(userId) {
  const userDocRef = main.doc(main.db, "users", userId);
  return main.getDoc(userDocRef).then((docSnap) => {
    if (!docSnap.exists()) return null;
    return docSnap.data();
  });
}

function displayResults(score, improvementAreas) {
  const resultContainer = document.getElementById("resultContainer");
  if (!resultContainer) return;

  resultContainer.innerHTML = `
    <h3>Assessment Results</h3>
    <p><strong>Implementation Percentage:</strong> ${Number(score).toFixed(2)}%</p>
    <div class="progress">
      <div class="progress-bar" id="progressBar" style="width: ${Number(score).toFixed(2)}%">
        ${Number(score).toFixed(2)}%
      </div>
    </div>
    <h4>Areas for Improvement:</h4>
  `;

  improvementAreas.forEach((area) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <p><strong>Question:</strong> ${escapeHtml(area.question)}</p>
      <div class="suggestions"><strong>Suggestions:</strong></div>
    `;

    const suggestionList = document.createElement("ul");
    area.suggestions.forEach((suggestion) => {
      const listItem = document.createElement("li");
      listItem.textContent = suggestion;
      suggestionList.appendChild(listItem);
    });
    card.querySelector(".suggestions").appendChild(suggestionList);
    resultContainer.appendChild(card);
  });
}

function hydrateHeader(userData) {
  const personal = userData.personalDetails || {};
  const company = document.getElementById("companyName");
  const userInCharge = document.getElementById("userInCharge");
  const userTitle = document.getElementById("userTitle");
  const userAddress = document.getElementById("userAddress");
  const userEmail = document.getElementById("userEmail");
  const userPhone = document.getElementById("userPhone");
  const reportDate = document.getElementById("reportDate");

  if (company) company.textContent = personal.organization || "-";
  if (userInCharge) userInCharge.textContent = personal.fullname || "-";
  if (userTitle) userTitle.textContent = personal.title || "-";
  if (userAddress) userAddress.textContent = personal.address || "-";
  if (userEmail) userEmail.textContent = personal.email || "-";
  if (userPhone) userPhone.textContent = personal.phoneNumber || "-";
  if (reportDate) reportDate.textContent = new Date().toLocaleDateString();
}

async function loadAssessmentResult(userId) {
  const userData = await loadUserDetails(userId);
  if (!userData) return;

  hydrateHeader(userData);
  const improvementAreaIds = userData?.results?.improvementAreas || [];
  const score = userData?.results?.score || 0;

  const questionPromises = improvementAreaIds.map((questionId) =>
    main.getDoc(main.doc(main.db, "questions", questionId))
  );
  const questionDocs = await Promise.all(questionPromises);
  const improvementAreas = questionDocs
    .filter((docSnap) => docSnap.exists())
    .map((docSnap) => {
      const data = docSnap.data();
      return {
        question: data.question || "No question text available",
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      };
    });

  displayResults(score, improvementAreas);
}

main.onAuthStateChanged(main.auth, (user) => {
  if (!user) {
    window.location.href = "/signin.html";
    return;
  }
  loadAssessmentResult(user.uid).catch((error) => {
    console.error("Failed to load assessment results", error);
  });
});

const signoutBtn = document.querySelector("#signoutbtn");
if (signoutBtn) {
  signoutBtn.addEventListener("click", (e) => {
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
