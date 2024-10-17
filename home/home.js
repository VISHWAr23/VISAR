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
  const navLinks = document.querySelectorAll("nav a");
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const navUl = document.querySelector("nav ul");
  const modal = document.getElementById("modal");
  const sections = document.querySelectorAll("section");

  // Navigation and scroll functionality
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

  // Contact form submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;
      alert(`Thank you, ${name}! Your message has been sent.`);
      e.target.reset();
    });
  }

  // Intersection Observer for section visibility
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

  // Modal functionality
  function showModal(title, content) {
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");

    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modal.style.display = "block";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };

  // Close button functionality
  const closeButton = document.querySelector(".close");
  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  // Fetch and display table cards
  function fetchAndDisplayTableCards() {
    fetch('http://localhost:3000/api/tables')
      .then(response => {
        if (!response.ok) {
          // If response is not OK, log the status and throw an error to catch
          throw new Error(`Server Error: ${response.status}`);
        }
        return response.json();
      })
      .then(tables => {
        const cardContainer = document.querySelector("#timetable .card-container");
        if (cardContainer) {
          cardContainer.innerHTML = ''; // Clear existing cards
          
          tables.forEach(tableName => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => showTableContent(tableName);
            
            card.innerHTML = `
              <h3>${tableName}</h3>
              <p>Click to view details</p>
            `;
            
            cardContainer.appendChild(card);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching tables:', error.message || error);
        showModal('Error', `Failed to fetch examination timetables. Error: ${error.message || 'Please try again later.'}`);
      });
}


  // Show table content
  function showTableContent(tableName) {
    fetch(`http://localhost:3000/api/table/${tableName}`)
      .then(response => response.json())
      .then(data => {
        let content = `<h2>${tableName}</h2>`;
        if (data.length > 0) {
          content += '<table border="1"><tr>';
          // Create table headers
          Object.keys(data[0]).forEach(key => {
            content += `<th>${key}</th>`;
          });
          content += '</tr>';
          // Create table rows
          data.forEach(row => {
            content += '<tr>';
            Object.values(row).forEach(value => {
              content += `<td>${value}</td>`;
            });
            content += '</tr>';
          });
          content += '</table>';
        } else {
          content += '<p>No data available for this table.</p>';
        }
        showModal(tableName, content);
      })
      .catch(error => {
        console.error('Error fetching table content:', error);
        showModal('Error', 'Failed to fetch table content. Please try again later.');
      });
  }

  // Call this function to load the table cards
  fetchAndDisplayTableCards();
});

// Update the showModal function to handle HTML content
function showModal(title, content) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modal.style.display = "block";
}


function showModal(title, content) {
  alert(`${title}\n\n${content}`);
  // In a real application, you would create a more sophisticated modal here
}

