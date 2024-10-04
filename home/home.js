const navLinks = document.querySelectorAll("nav a");
const dropdownBtn = document.querySelector(".dropdown-btn");
const navUl = document.querySelector("nav ul");
const modal = document.getElementById("modal");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    if (window.innerWidth <= 600) {
      navUl.classList.remove("show");
    }
  });
});

dropdownBtn.addEventListener("click", () => {
  navUl.classList.toggle("show");
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  alert(`Thank you, ${name}! Your message has been sent.`);
  e.target.reset();
});


window.addEventListener("scroll", () => {
  let current = "";
  document.querySelectorAll("section").forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").substring(1) === current) {
      link.classList.add("active");
    }
  });
});

function showModal(title, content) {
  document.getElementById("modalTitle").innerHTML = title;
  document.getElementById("modalContent").innerHTML = content;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const nav = document.querySelector("nav ul");

  dropdownBtn.addEventListener("click", () => {
    nav.classList.toggle("show");
  });

  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav ul li a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - sectionHeight / 3) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").slice(1) === current) {
        link.classList.add("active");
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".section-content").forEach((section) => {
    observer.observe(section);
  });

});
fetchTimetableNames();

function showModal(title, content) {
  alert(`${title}\n\n${content}`);
  // In a real application, you would create a more sophisticated modal here
}

function fetchTimetableNames() {
  fetch("http://localhost:3000/api/timetable-names")
    .then(response => response.json())
    .then(data => {
      const cardContainer = document.querySelector("#timetable .card-container");
      cardContainer.innerHTML = ""; // Clear existing cards

      data.forEach(tableName => {
        const card = createTimetableCard(tableName);
        cardContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error fetching timetable names:", error);
      showModal("Error", "Failed to fetch timetable data. Please try again later.");
    });
}

function createTimetableCard(tableName) {
  const card = document.createElement("div");
  card.className = "card";
  card.onclick = () => fetchAndDisplayFullTimetable(tableName);

  const title = document.createElement("h3");
  title.textContent = tableName;

  card.appendChild(title);
  return card;
}

function fetchAndDisplayFullTimetable(tableName) {
  fetch(`http://localhost:3000/api/timetable/${encodeURIComponent(tableName)}`)
    .then(response => response.json())
    .then(data => {
      displayFullTimetable(tableName, data);
    })
    .catch(error => {
      console.error("Error fetching full timetable:", error);
      showModal("Error", "Failed to fetch timetable data. Please try again later.");
    });
}

function displayFullTimetable(tableName, timetableData) {
  let content = `<h2>${tableName}</h2><table><tr><th>Date</th><th>Subject</th><th>Staff</th><th>Email</th><th>Completion</th></tr>`;
  
  timetableData.forEach(entry => {
    content += `<tr>
      <td>${new Date(entry.exam_start_date).toDateString()}</td>
      <td>${entry.subject_name}</td>
      <td>${entry.staff_name}</td>
      <td>${entry.staff_email}</td>
      <td>${entry.subject_completion}%</td>
    </tr>`;
  });
  
  content += '</table>';
  
  showModal(tableName, content);
}

// Update the showModal function to handle HTML content
function showModal(title, content) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modal.style.display = "block";
}
