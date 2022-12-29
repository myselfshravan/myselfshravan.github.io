/*===== MENU SHOW =====*/
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId);

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
};
showMenu("nav-toggle", "nav-menu");

const toggler = document.querySelector(".menu__toggler");
const menu = document.querySelector(".menu");

/*
 * Toggles on and off the 'active' class on the menu
 * and the toggler button.
 */
toggler.addEventListener("click", () => {
  toggler.classList.toggle("active");
  menu.classList.toggle("active");
});

/*===== REMOVE MENU MOBILE =====*/
const navLink = document.querySelectorAll(".nav__link");

function linkAction() {
  const navMenu = document.getElementById("nav-menu");
  navMenu.classList.remove("show");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*===== SCROLL SECTIONS ACTIVE LINK =====*/
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", scrollActive);

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.add("active");
    } else {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.remove("active");
    }
  });
}

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
  origin: "top",
  distance: "50px",
  duration: 1000,
  reset: true,
});

/*SCROLL HOME*/
sr.reveal(".home__title", {});
sr.reveal(".home__scroll", { delay: 200 });
sr.reveal(".home__img", { origin: "right", delay: 200 });

/*SCROLL ABOUT*/
sr.reveal(".about__img", { origin: "top", delay: 300, reset: false });
sr.reveal(".about__subtitle", { delay: 200 });
sr.reveal(".about__subtitle1", { delay: 250 });
sr.reveal(".text_1", { delay: 400 });
sr.reveal(".text_2", { delay: 400 });
// sr.reveal(".about__text", { delay: 500 });
sr.reveal(".backani", { delay: 500 });
sr.reveal(".abtli", { delay: 400, interval: 50 });
sr.reveal(".social-share-inner-left span.title", { delay: 200 });
sr.reveal(".about__social-icon", { delay: 200, interval: 150 });

/*SCROLL SKILLS*/
sr.reveal(".skills__subtitle", { origin: "top", reset: false });
sr.reveal(".skills__name", {
  origin: "top",
  distance: "15px",
  delay: 50,
  interval: 100,
});
sr.reveal(".skills__name1", { distance: "15px", delay: 50, interval: 80 });
sr.reveal(".skills__img", { delay: 200, reset: false });

/*SCROLL PORTFOLIO*/
sr.reveal(".portfolio__img", { interval: 150 });
sr.reveal(".portfolio__imgt", { interval: 150 });

/*SCROLL CONTACT*/
sr.reveal(".contact__subtitle", {});
sr.reveal(".contact__text", { interval: 200 });
sr.reveal(".contact__text1", { interval: 200 });
sr.reveal(".contact__input", { delay: 400 });
sr.reveal(".contact__button", { delay: 600 });

/* SCROLL EDUCATION */
sr.reveal(".education .box", { interval: 200 });
sr.reveal(".education .box .content .box img .box-container .box .image", {
  delay: 300,
});

var btn = $("#button");

$(window).scroll(function () {
  if ($(window).scrollTop() > 300) {
    btn.addClass("show");
  } else {
    btn.removeClass("show");
  }
});

btn.on("click", function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, "300");
});

// const btntog = document.querySelector(".btn-toggle");
// const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
// btntog.addEventListener("click", function () {
//   if (prefersDarkScheme.matches) {
//     document.body.classList.toggle("light-theme");
//   } else {
//     document.body.classList.toggle("dark-theme");
//   }
// });

const btntog = document.querySelector(".btn-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

const currentTheme = localStorage.getItem("theme");
if (currentTheme == "dark") {
  document.body.classList.toggle("dark-theme");
} else if (currentTheme == "light") {
  document.body.classList.toggle("light-theme");
}

btntog.addEventListener("click", function () {
  if (prefersDarkScheme.matches) {
    document.body.classList.toggle("light-theme");
    var theme = document.body.classList.contains("light-theme")
      ? "light"
      : "dark";
  } else {
    document.body.classList.toggle("dark-theme");
    var theme = document.body.classList.contains("dark-theme")
      ? "dark"
      : "light";
  }
  localStorage.setItem("theme", theme);
});

$(document).ready(function () {
  $(".btn-toggle").click(function () {
    var $this = $(this);
    $this.removeClass("btn-toggle");
    $this.addClass("notliked");
    $count = $(".likes-count");
    $count.text(function (idx, txt) {
      return +txt == 0 ? "\n myselfshravan.github.io/riddle.html \n" : +txt - 1;
    });
  });
});

function validateForm() {
  let x = document.forms["myForm"]["fname"].value;
  if (x != "coffin") {
    alert("You Failed !!!");
    return false;
  }
}
function validateForm2() {
  let x = document.forms["myForm2"]["fname2"].value;
  if (x != "lawsuit") {
    alert("You Failed !!!");
    return false;
  }
}
