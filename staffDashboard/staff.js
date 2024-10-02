document.addEventListener("DOMContentLoaded", () => {
    const examStartForm = document.getElementById("exam-start-form");
    const staffForm = document.getElementById("staff-form");
    const subjectListDiv = document.getElementById("subject-list");
    const timetableDiv = document.getElementById("timetable");
    const createTimetableBtn = document.getElementById("create-timetable");
    const timetableSelector = document.getElementById("timetable-selector");
    const storeDbBtn = document.getElementById("store-db-btn");
    const tableNameInput = document.getElementById("table-name-input");
    const tableNameField = document.getElementById("table-name");
    const confirmStoreBtn = document.getElementById("confirm-store-btn");
    const modal = document.getElementById("modal");
    const modalMessage = document.getElementById("modal-message");
    const closeModal = document.getElementsByClassName("close")[0];

    let timetables = JSON.parse(localStorage.getItem("timetables")) || [
      { subjects: [], examStartDate: null },
    ];
    let currentTimetableIndex = 0;

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

    function displayTimetables() {
      timetableSelector.innerHTML = timetables
        .map(
          (_, index) =>
            `<option value="${index}">Timetable ${index + 1}</option>`
        )
        .join("");
      timetableSelector.value = currentTimetableIndex;
    }

    function getCurrentTimetable() {
      return timetables[currentTimetableIndex];
    }

    function saveCurrentTimetable() {
      timetables[currentTimetableIndex] = getCurrentTimetable();
      localStorage.setItem("timetables", JSON.stringify(timetables));
    }

    examStartForm.addEventListener("submit", (e) => {
      e.preventDefault();
      getCurrentTimetable().examStartDate = new Date(
        document.getElementById("exam-start-date").value
      );
      saveCurrentTimetable();
      showModal("Exam start date set successfully!");
      generateTimetable();
    });

    staffForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const staffName = document.getElementById("staff-name").value;
      const subjectName = document.getElementById("subject-name").value;
      const staffEmail = document.getElementById("staff-email").value;
      const subjectCompletion = parseFloat(
        document.getElementById("subject-completion").value
      );

      getCurrentTimetable().subjects.push({
        staffName,
        subjectName,
        staffEmail,
        subjectCompletion,
      });
      saveCurrentTimetable();
      e.target.reset();

      displaySubjects();
      generateTimetable();
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
    ${getCurrentTimetable()
      .subjects.map(
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

    function editSubject(index) {
      const subject = getCurrentTimetable().subjects[index];
      document.getElementById("staff-name").value = subject.staffName;
      document.getElementById("subject-name").value = subject.subjectName;
      document.getElementById("staff-email").value = subject.staffEmail;
      document.getElementById("subject-completion").value =
        subject.subjectCompletion;

      getCurrentTimetable().subjects.splice(index, 1);
      saveCurrentTimetable();
      displaySubjects();
      generateTimetable();
    }

    function deleteSubject(index) {
      getCurrentTimetable().subjects.splice(index, 1);
      saveCurrentTimetable();
      displaySubjects();
      generateTimetable();
    }

    function generateTimetable() {
      const currentTimetable = getCurrentTimetable();
      if (!currentTimetable.examStartDate) {
        timetableDiv.innerHTML =
          "<p>Please set the exam start date first.</p>";
        return;
      }

      currentTimetable.subjects.sort(
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
      let currentDate = new Date(currentTimetable.examStartDate);

      const timetableHTML = `
  <h3>Exam Timetable</h3>
  <table>
    <tr>
      <th>Date</th>
      <th>Day</th>
      <th>Subject</th>
    </tr>
    ${currentTimetable.subjects
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

    createTimetableBtn.addEventListener("click", () => {
      timetables.push({ subjects: [], examStartDate: null });
      currentTimetableIndex = timetables.length - 1;
      displayTimetables();
      displaySubjects();
      generateTimetable();
    });

    timetableSelector.addEventListener("change", () => {
      currentTimetableIndex = parseInt(timetableSelector.value);
      displaySubjects();
      generateTimetable();
    });

    storeDbBtn.addEventListener("click", () => {
      tableNameInput.style.display = "block";
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
const dataToStore = JSON.stringify(timetables);

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
})
.catch((error) => {
  console.error("Error:", error);
  const errorMessage = error.details 
    ? `Error: ${error.error}. Details: ${error.details}`
    : "Error storing data in database. Please try again.";
  showModal(errorMessage);
});

tableNameField.value = "";
tableNameInput.style.display = "none";
}

    // Make these functions global so they can be called from inline event handlers
    window.editSubject = editSubject;
    window.deleteSubject = deleteSubject;

    // Initial display
    displayTimetables();
    displaySubjects();
    generateTimetable();
  });