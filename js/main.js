// ========================================
// Navbar scroll effect
// ========================================

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ========================================
// Mobile nav toggle
// ========================================

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ========================================
// Active nav link highlighting
// ========================================

const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// ========================================
// Scroll-triggered fade-in animations
// ========================================

function initFadeAnimations() {
  const targets = document.querySelectorAll(
    '.about-text, .project-card, .contact-form, .contact-subtitle'
  );

  targets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

initFadeAnimations();

// ========================================
// Contact form submission
// ========================================

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  // Basic validation
  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const message = contactForm.message.value.trim();

  if (!name || !email || !message) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus('Please enter a valid email address.', 'error');
    return;
  }

  // Submit
  submitBtn.disabled = true;
  btnText.hidden = true;
  btnLoading.hidden = false;
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  try {
    const formData = new FormData(contactForm);

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      showStatus('Message sent! I\'ll get back to you soon.', 'success');
      contactForm.reset();
    } else {
      showStatus(data.message || 'Something went wrong. Please try again.', 'error');
    }
  } catch {
    showStatus('Could not send message. Please try again later.', 'error');
  } finally {
    submitBtn.disabled = false;
    btnText.hidden = false;
    btnLoading.hidden = true;
  }
});

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = `form-status ${type}`;
}
