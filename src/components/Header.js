/**
 * Reusable Header Component
 * Provides consistent header across all pages
 */

class Header {
  constructor() {
    this.isScrolled = false;
    this.init();
  }

  init() {
    this.createHeader();
    this.setupEventListeners();
    this.setupMobileMenu();
  }

  createHeader() {
    const headerHTML = `
      <header id="header" class="fixed-top">
        <div class="container d-flex align-items-center">
          <h1 class="logo me-auto">
            <a href="home.html">Privacy Policy Pro</a>
          </h1>
          
          <nav id="navbar" class="navbar">
            <ul>
              <li>
                <a class="nav-link scrollto" href="pdpa-guidelines.html">PDPA Act Guidelines</a>
              </li>
              <li>
                <a class="nav-link scrollto" href="assessment.html">Assessment Tool</a>
              </li>
              <li>
                <a class="nav-link scrollto" href="feedback.html">Feedback</a>
              </li>
              <li class="dropdown">
                <a href="#"><span>Account</span> <i class="bi bi-chevron-down"></i></a>
                <ul>
                  <li><a href="profile.html">Profile</a></li>
                  <li><a href="#" id="logoutBtn">Sign Out</a></li>
                </ul>
              </li>
            </ul>
            <i class="bi bi-list mobile-nav-toggle"></i>
          </nav>
        </div>
      </header>
    `;

    // Insert header at the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  }

  setupEventListeners() {
    // Header scroll effect
    const header = document.querySelector('#header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          header.classList.add('header-scrolled');
          this.isScrolled = true;
        } else {
          header.classList.remove('header-scrolled');
          this.isScrolled = false;
        }
      });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleLogout();
      });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('.navbar .scrollto').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          this.scrollToSection(href);
        }
      });
    });
  }

  setupMobileMenu() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('#navbar');

    if (mobileNavToggle && navbar) {
      mobileNavToggle.addEventListener('click', () => {
        navbar.classList.toggle('navbar-mobile');
        mobileNavToggle.classList.toggle('bi-list');
        mobileNavToggle.classList.toggle('bi-x');
      });

      // Close mobile menu when clicking on dropdown items
      document.querySelectorAll('.navbar .dropdown > a').forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
          if (navbar.classList.contains('navbar-mobile')) {
            e.preventDefault();
            dropdown.nextElementSibling.classList.toggle('dropdown-active');
          }
        });
      });
    }
  }

  async handleLogout() {
    try {
      const { signOut, auth } = await import('../shared/config/firebase.js');
      await signOut(auth);
      
      // Show success message
      const { default: errorHandler } = await import('../shared/services/errorHandler.js');
      errorHandler.showSuccess('Successfully signed out');
      
      // Redirect to signin page
      setTimeout(() => {
        window.location.href = '/signin.html';
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      const { default: errorHandler } = await import('../shared/services/errorHandler.js');
      errorHandler.showError('Failed to sign out. Please try again.');
    }
  }

  scrollToSection(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
      const headerHeight = document.querySelector('#header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Update active navigation link
  updateActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPath.split('/').pop()) {
        link.classList.add('active');
      }
    });
  }

  // Show/hide header based on scroll direction
  setupSmartHeader() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const header = document.querySelector('#header');
      
      if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = currentScrollTop;
    });
  }
}

// Export the Header class
export default Header; 
