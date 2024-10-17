document.addEventListener("DOMContentLoaded", () => {
  const examStartForm = document.getElementById("exam-start-form");
  const staffForm = document.getElementById("staff-form");
  const subjectListDiv = document.getElementById("subject-list");
  const timetableDiv = document.getElementById("timetable");
  const storeBtn = document.getElementById("store-btn");
  const tableNameInput = document.getElementById("table-name-input");
  const tableNameField = document.getElementById("table-name");
  const confirmStoreBtn = document.getElementById("confirm-store-btn");
  const modal = document.getElementById("modal");
  const modalMessage = document.getElementById("modal-message");
  const closeModal = document.getElementsByClassName("close")[0];
  const progressSteps = document.querySelectorAll(".step");
  const tableSelect = document.getElementById("tableSelect");
  const createForm = document.getElementById("createForm");
  const deleteForm = document.getElementById("deleteForm");
  const toast = document.getElementById("toast");

  let timetable = { subjects: [], examStartDate: null };

  // Show toast message
  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = "block";
  }

  closeModal.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Fetch tables function
  async function fetchTables() {
    try {
      const response = await fetch("http://localhost:3000/api/tables");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tables = await response.json();

      // Clear existing options
      tableSelect.innerHTML = '<option value="">Select a timetable</option>';

      // Add new options
      tables.forEach((table) => {
        const option = document.createElement("option");
        option.value = table;
        option.textContent = table;
        tableSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      showToast("Failed to fetch tables: " + error.message, "error");
    }
  }

  // Call fetchTables initially and after any table modifications
  fetchTables();

  examStartForm.addEventListener("submit", (e) => {
    e.preventDefault();
    timetable.examStartDate = new Date(
      document.getElementById("exam-start-date").value
    );
    showModal("Exam start date set successfully!");
    document.getElementById("exam-start-section").style.display = "none";
    document.getElementById("subject-input-section").style.display = "block";
    progressSteps[0].classList.remove("active");
    progressSteps[1].classList.add("active");
  });

  staffForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const staffName = document.getElementById("staff-name").value;
    const subjectName = document.getElementById("subject-name").value;
    const staffEmail = document.getElementById("staff-email").value;
    const subjectCompletion = parseFloat(
      document.getElementById("subject-completion").value
    );

    timetable.subjects.push({
      staffName,
      subjectName,
      staffEmail,
      subjectCompletion,
    });
    e.target.reset();

    displaySubjects();
    generateTimetable();
    storeBtn.style.display = "block";
  });

  function displaySubjects() {
    const subjectListHTML = `
      <h3>Subject List</h3>
      <table>
        <tr>
          <th>Subject</th>
          <th>Staff</th>
          <th>Email</th>
          <th>Completion</th>
          <th>Actions</th>
        </tr>
        ${timetable.subjects
          .map(
            (subject, index) => `
          <tr>
            <td>${subject.subjectName}</td>
            <td>${subject.staffName}</td>
            <td>${subject.staffEmail}</td>
            <td>${subject.subjectCompletion}%</td>
            <td>
              <button class="edit-delete-btn" onclick="editSubject(${index})">Edit</button>
              <button class="edit-delete-btn" onclick="deleteSubject(${index})">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </table>
    `;
    subjectListDiv.innerHTML = subjectListHTML;
  }

  function generateTimetable() {
    if (!timetable.examStartDate) {
      timetableDiv.innerHTML = "<p>Please set the exam start date first.</p>";
      return;
    }

    timetable.subjects.sort(
      (a, b) => b.subjectCompletion - a.subjectCompletion
    );

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let currentDate = new Date(timetable.examStartDate);

    const timetableHTML = `
      <h3>Exam Timetable</h3>
      <table>
        <tr>
          <th>Date</th>
          <th>Day</th>
          <th>Subject</th>
        </tr>
        ${timetable.subjects
          .map((subject) => {
            while (currentDate.getDay() === 0) {
              currentDate.setDate(currentDate.getDate() + 1);
            }
            const examDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
            return `
            <tr>
              <td>${examDate.toDateString()}</td>
              <td>${days[examDate.getDay()]}</td>
              <td>${subject.subjectName}</td>
            </tr>
          `;
          })
          .join("")}
      </table>
    `;
    timetableDiv.innerHTML = timetableHTML;
  }

  storeBtn.addEventListener("click", () => {
    document.getElementById("subject-input-section").style.display = "none";
    document.getElementById("database-storage-section").style.display = "block";
    progressSteps[1].classList.remove("active");
    progressSteps[2].classList.add("active");
  });

  confirmStoreBtn.addEventListener("click", async () => {
    const tableName = tableNameField.value.trim();
    if (!tableName) {
      showModal("Please enter a valid table name.");
      return;
    }

    try {
      await storeInDatabase(tableName);
      showModal(`Data successfully stored in table: ${tableName}`);
      resetForm();
      fetchTables(); // Refresh the table list after storing
    } catch (error) {
      const dataToStore = JSON.stringify(timetable);
      console.log(dataToStore);
      console.error("Error storing data:", error);
      showModal("Error storing data in database. Please try again.");
    }
  });

  async function storeInDatabase(tableName) {
    const dataToStore = JSON.stringify(timetable);
    console.log(dataToStore);
    const response = await fetch("http://localhost:3000/api/store-timetables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tableName: tableName,
        data: dataToStore,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || "Failed to store data");
    }

    return response.json();
  }

  function resetForm() {
    timetable = { subjects: [], examStartDate: null };
    document.getElementById("exam-start-section").style.display = "block";
    document.getElementById("subject-input-section").style.display = "none";
    document.getElementById("database-storage-section").style.display = "none";
    subjectListDiv.innerHTML = "";
    timetableDiv.innerHTML = "";
    storeBtn.style.display = "none";
    tableNameField.value = "";
    progressSteps.forEach((step, index) => {
      if (index === 0) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });
  }

  deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tableName = tableSelect.value;
    
    if (!tableName) {
      showToast("Please select a timetable", "error");
      return;
    }

    try {
      const submitButton = deleteForm.querySelector("button");
      submitButton.disabled = true;
      submitButton.textContent = "Deleting...";
      submitButton.classList.add("loading");

      const response = await fetch(`http://localhost:3000/api/delete-timetable`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tableName: tableName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete timetable');
      }

      // Clear the selection
      tableSelect.value = "";
      
      // Refresh the table list
      await fetchTables();
      
      showToast(`Timetable "${tableName}" deleted successfully`, "success");
    } catch (error) {
      console.error("Delete error:", error);
      showToast(error.message || "Failed to delete timetable", "error");
    } finally {
      const submitButton = deleteForm.querySelector("button");
      submitButton.disabled = false;
      submitButton.textContent = "Delete";
      submitButton.classList.remove("loading");
    }
  });

  // Make these functions global so they can be called from inline event handlers
  window.editSubject = editSubject;
  window.deleteSubject = deleteSubject;

  function editSubject(index) {
    const subject = timetable.subjects[index];
    document.getElementById("staff-name").value = subject.staffName;
    document.getElementById("subject-name").value = subject.subjectName;
    document.getElementById("staff-email").value = subject.staffEmail;
    document.getElementById("subject-completion").value = subject.subjectCompletion;

    timetable.subjects.splice(index, 1);
    displaySubjects();
    generateTimetable();
  }

  function deleteSubject(index) {
    timetable.subjects.splice(index, 1);
    displaySubjects();
    generateTimetable();
  }
});

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastContent = document.querySelector('.toast-content');
  
  if (!toast || !toastContent) {
      console.error('Toast elements not found in the DOM');
      return;
  }

  // Set the message
  toastContent.textContent = message;

  // Add appropriate class for styling
  toast.className = `toast ${type}`;

  // Show the toast
  toast.classList.remove('hidden');

  // Hide after 3 seconds
  setTimeout(() => {
      toast.classList.add('hidden');
  }, 3000);
}

// Your form submission code
document.getElementById('staffForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
      const formData = new FormData(e.target);
      const staffName = formData.get('staffName');
      const subjectName = formData.get('subjectName');
      const staffEmail = formData.get('staffEmail');
      const subjectCompletion = parseFloat(formData.get('subjectCompletion'));
      const examStartDate = formData.get('examStartDate');

      const data = {
          subjects: [{
              staffName,
              subjectName,
              staffEmail,
              subjectCompletion
          }],
          examStartDate: new Date(examStartDate).toISOString()
      };

      const response = await fetch('/api/store-exam-data', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
          showToast('Data submitted successfully!', 'success');
          e.target.reset(); // Reset form
      } else {
          showToast(result.error || 'Error submitting data', 'error');
      }
  } catch (error) {
      console.error('Error:', error);
      showToast('An error occurred while submitting the data', 'error');
  }
});