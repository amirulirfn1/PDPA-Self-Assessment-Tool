const main = require("./main.js");

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

// Fetch users and populate the table
const fetchUsers = () => {
  main
    .getDocs(main.collection(main.db, "users"))
    .then((querySnapshot) => {
      const usersTable = document.querySelector("#usersTable tbody");
      usersTable.innerHTML = ""; // Clear existing rows

      querySnapshot.forEach((doc) => {
        const user = doc.data().personalDetails;
        const row = document.createElement("tr");

        row.innerHTML = `
          <td data-label="Title">${user.title}</td>
          <td data-label="Full Name">${user.fullname}</td>
          <td data-label="Email">${user.email}</td>
          <td data-label="Organization">${user.organization}</td>
          <td data-label="Phone Number">${user.phoneNumber}</td>
          <td data-label="Address">${user.address}</td>
          <td data-label="Action">
            <button class="btn edit-btn" data-id="${doc.id}">Edit</button>
            <button class="btn delete-btn" data-id="${doc.id}">Delete</button>
          </td>
        `;

        usersTable.appendChild(row);
      });

      // Attach event listeners to edit buttons
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const userId = e.target.dataset.id;
          showEditUserForm(userId);
        });
      });

      // Attach event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const userId = e.target.dataset.id;
          deleteUser(userId);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching users: ", error);
    });
};

// Show the edit user form with the current user data
const showEditUserForm = (userId) => {
  main
    .getDoc(main.doc(main.db, "users", userId))
    .then((doc) => {
      const user = doc.data().personalDetails;
      document.querySelector("#editTitle").value = user.title || "";
      document.querySelector("#editFullName").value = user.fullname || "";
      document.querySelector("#editEmail").value = user.email || "";
      document.querySelector("#editOrganization").value =
        user.organization || "";
      document.querySelector("#editPhoneNumber").value = user.phoneNumber || "";
      document.querySelector("#editAddress").value = user.address || "";
      document.querySelector("#editUserId").value = userId;

      document.querySelector("#editUserFormContainer").style.display = "block";
    })
    .catch((error) => {
      console.error("Error getting user details: ", error);
    });
};

// Update user data in Firestore
const updateUser = (userId, updatedData) => {
  main
    .updateDoc(main.doc(main.db, "users", userId), {
      personalDetails: updatedData,
    })
    .then(() => {
      alert("User updated successfully");
      document.querySelector("#editUserFormContainer").style.display = "none";
      fetchUsers();
    })
    .catch((error) => {
      console.error("Error updating user: ", error);
    });
};

// Delete user from Firestore
const deleteUser = (userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    main
      .deleteDoc(main.doc(main.db, "users", userId))
      .then(() => {
        alert("User deleted successfully");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error deleting user: ", error);
      });
  }
};

// Handle form submission for editing user details
const editUserForm = document.querySelector("#editUserForm");
editUserForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedData = {
    title: editUserForm.editTitle.value,
    fullname: editUserForm.editFullName.value,
    email: editUserForm.editEmail.value,
    organization: editUserForm.editOrganization.value,
    phoneNumber: editUserForm.editPhoneNumber.value,
    address: editUserForm.editAddress.value,
  };
  const userId = editUserForm.editUserId.value;

  updateUser(userId, updatedData);
});

// Handle cancel edit button click
const cancelEditBtn = document.querySelector("#cancelEdit");
cancelEditBtn.addEventListener("click", () => {
  document.querySelector("#editUserFormContainer").style.display = "none";
});

// Check authentication state and fetch users
main.onAuthStateChanged(main.auth, (user) => {
  if (user) {
    fetchUsers();
  } else {
    window.location.href = "/signin.html";
  }
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
