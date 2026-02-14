import $ from "jquery";
import "../scss/style.scss";
import AOS from "aos";
import Isotope from "isotope-layout";
import Waypoint from "waypoints/lib/noframework.waypoints.min.js";
import GLightbox from "glightbox";
import Swiper from "swiper/bundle";

// Import centralized Firebase configuration
import {
  db,
  auth,
  storage,
  loader,
  usersDB,
  adminsDB,
  bookingDB,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  PhoneAuthProvider,
} from "../shared/config/firebase.js";

// Import collection directly from firebase/firestore
import { collection } from "firebase/firestore";

// Export necessary functions and Firebase objects
export {
  db,
  auth,
  storage,
  collection,
  usersDB,
  adminsDB,
  bookingDB,
  getDoc,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  PhoneAuthProvider,
  loader,
};

// Other application initialization
(function () {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      try {
        return document.querySelector(el);
      } catch (e) {
        console.log(e.message);
      }
    }
  };

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  const scrollto = (el) => {
    let header = select("#header");
    let offset = header.offsetHeight;
    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: "smooth",
    });
  };

  let selectHeader = select("#header");
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add("header-scrolled");
      } else {
        selectHeader.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("load", headerScrolled);
    onscroll(document, headerScrolled);
  }

  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  const preloader = select("#preloader");
  if (preloader) {
    const hidePreloader = () => {
      if (preloader.classList.contains("preloader-hidden")) {
        return;
      }
      preloader.classList.add("preloader-hidden");
      preloader.addEventListener(
        "transitionend",
        () => preloader.remove(),
        { once: true }
      );
      setTimeout(() => {
        if (document.body.contains(preloader)) {
          preloader.remove();
        }
      }, 350);
    };
    window.addEventListener("load", hidePreloader);
    setTimeout(() => {
      if (document.body.contains(preloader)) {
        hidePreloader();
      }
    }, 4000);
  }

  on("click", ".mobile-nav-toggle", function (e) {
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  on(
    "click",
    ".navbar .dropdown > a",
    function (e) {
      if (select("#navbar").classList.contains("navbar-mobile")) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle("dropdown-active");
      }
    },
    true
  );

  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let navbar = select("#navbar");
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    },
    true
  );

  on(
    "click",
    ".portfolio-flters li",
    function (e) {
      e.preventDefault();
      on("click", ".portfolio-flters li", function () {
        this.classList.remove("filter-active");
      });
      this.classList.add("filter-active");

      portfolioIsotope.arrange({
        filter: this.getAttribute("data-filter"),
      });
      portfolioIsotope.on("arrangeComplete", function () {
        AOS.refresh();
      });
    },
    true
  );
})();

window.addEventListener("load", () => {
  AOS.init({
    duration: 1000,
    easing: "ease-in-out",
    once: true,
    mirror: false,
  });
});
