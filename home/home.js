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

function showModal(title, content) {
  alert(`${title}\n\n${content}`);
  // In a real application, you would create a more sophisticated modal here
}