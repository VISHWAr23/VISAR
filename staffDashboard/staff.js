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

  let timetable = { subjects: [], examStartDate: null };

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
        ${timetable.subjects.map(
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
        ).join("")}
      </table>
    `;
    subjectListDiv.innerHTML = subjectListHTML;
  }

  function editSubject(index) {
    const subject = timetable.subjects[index];
    document.getElementById("staff-name").value = subject.staffName;
    document.getElementById("subject-name").value = subject.subjectName;
    document.getElementById("staff-email").value = subject.staffEmail;
    document.getElementById("subject-completion").value =
      subject.subjectCompletion;

    timetable.subjects.splice(index, 1);
    displaySubjects();
    generateTimetable();
  }

  function deleteSubject(index) {
    timetable.subjects.splice(index, 1);
    displaySubjects();
    generateTimetable();
  }

  function generateTimetable() {
    if (!timetable.examStartDate) {
      timetableDiv.innerHTML =
        "<p>Please set the exam start date first.</p>";
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

  confirmStoreBtn.addEventListener("click", () => {
    const tableName = tableNameField.value.trim();
    if (tableName) {
      storeInDatabase(tableName);
    } else {
      showModal("Please enter a valid table name.");
    }
  });

  function storeInDatabase(tableName) {
    const dataToStore = JSON.stringify(timetable);

    fetch("http://localhost:3000/api/store-timetables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tableName: tableName,
        data: dataToStore,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => { throw err; });
        }
        return response.json();
      })
      .then((data) => {
        showModal(`Data successfully stored in table: ${tableName}`);
        // Reset the form and go back to the first step
        resetForm();
      })
      .catch((error) => {
        console.error("Error:", error);
        const errorMessage = error.details 
          ? `Error: ${error.error}. Details: ${error.details}`
          : "Error storing data in database. Please try again.";
        showModal(errorMessage);
      });

    tableNameField.value = "";
  }

  function resetForm() {
    timetable = { subjects: [], examStartDate: null };
    document.getElementById("exam-start-section").style.display = "block";
    document.getElementById("subject-input-section").style.display = "none";
    document.getElementById("database-storage-section").style.display = "none";
    subjectListDiv.innerHTML = "";
    timetableDiv.innerHTML = "";
    storeBtn.style.display = "none";
    progressSteps.forEach((step, index) => {
      if (index === 0) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });
  }

  // Make these functions global so they can be called from inline event handlers
  window.editSubject = editSubject;
  window.deleteSubject = deleteSubject;
});