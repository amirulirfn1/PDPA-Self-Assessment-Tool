const main = require("./main.js");

const listContainer = document.getElementById("guidelineList");
const contentContainer = document.getElementById("guidelineContent");

function showGuideline(data) {
  if (!contentContainer) return;
  contentContainer.style.display = "block";
  if (listContainer) listContainer.style.display = "none";

  const title = document.getElementById("guidelineTitle");
  const author = document.getElementById("guidelineAuthor");
  const date = document.getElementById("guidelineDate");
  const image = document.getElementById("guidelineImage");
  const body = document.getElementById("guidelineBody");
  const publisher = document.getElementById("guidelinePublisher");

  if (title) title.innerText = data.title || "";
  if (author) author.innerText = data.author || "";
  if (date) date.innerText = data.published || "";
  if (image && data.image) image.src = data.image;
  if (body) body.innerText = data.body || "";
  if (publisher) publisher.innerText = data.publisher || "";
}

function showList(items) {
  if (!listContainer) return;
  listContainer.innerHTML = "";
  if (contentContainer) contentContainer.style.display = "none";

  items.forEach((item) => {
    const link = document.createElement("a");
    link.href = `pdpa-guidelines.html?id=${item.id}`;
    link.textContent = item.title;
    link.className = "btn btn-outline-primary d-block mb-2";
    listContainer.appendChild(link);
  });
}

main.onAuthStateChanged(main.auth, (user) => {
  if (!user) {
    window.location.href = "/signin.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    const docRef = main.doc(main.db, "guidelines", id);
    main.getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        showGuideline(doc.data());
      }
    });
  } else {
    const colRef = main.collection(main.db, "guidelines");
    main.getDocs(colRef).then((snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      showList(items);
    });
  }
});
