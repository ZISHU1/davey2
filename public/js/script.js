// Initialize AOS (with fade-up on scroll down and up)
AOS.init({ duration: 800, once: false });

// --- THEME SYSTEM ---
function setTheme(mode) {
  document.body.classList.toggle('light', mode === 'light');
  localStorage.setItem('theme', mode);
  document.getElementById('themeBtn').innerHTML = mode === 'light'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light');
  setTheme(isLight ? 'dark' : 'light');
}

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', () => {
  // Theme setup
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
  document.body.classList.add('loaded');

  // Blog Live Search
  const input = document.getElementById('searchInput');
  const posts = document.querySelectorAll('.blog-item');
  if (input) {
    input.addEventListener('input', () => {
      const val = input.value.toLowerCase();
      posts.forEach(post => {
        const match = post.dataset.title.includes(val) || post.dataset.content.includes(val);
        post.style.display = match ? 'block' : 'none';
      });
    });
  }

  // Gallery
  const gallery = document.getElementById('gallery');
  if (gallery) {
    const categories = ['landscapes', 'people', 'urban', 'nature'];
    for (let i = 1; i <= 100; i++) {
      const cat = categories[i % categories.length];
      const link = document.createElement('a');
      link.href = `https://picsum.photos/seed/${cat + i}/1200/800`;
      link.className = 'glightbox';
      link.setAttribute('data-gallery', 'portfolio');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.dataset.category = cat;
      img.dataset.aos = 'fade-up';
      img.src = `https://picsum.photos/seed/${cat + i}/400/300`;
      img.alt = cat;

      link.appendChild(img);
      gallery.appendChild(link);
    }

    // Filtering
    document.querySelectorAll('.filters button').forEach(btn => {
      btn.onclick = () => {
        document.querySelector('.filters .active')?.classList.remove('active');
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('#gallery a').forEach(a => {
          const img = a.querySelector('img');
          a.style.display = (filter === 'all' || img.dataset.category === filter) ? 'block' : 'none';
        });
      };
    });

    // GLightbox
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ touchNavigation: true, loop: true });
    }
  }
});

// Scroll-to-top button
window.onscroll = () => {
  document.getElementById('topBtn').style.display =
    window.scrollY > 300 ? 'block' : 'none';
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Slider scroll
function scrollSlider(direction) {
  const slider = document.getElementById('cardSlider');
  if (!slider) return;
  const card = slider.querySelector('.card');
  const style = getComputedStyle(slider);
  const gap = parseInt(style.columnGap || style.gap) || 16;
  const cardWidth = card.offsetWidth + gap;
  slider.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}

// Mobile navigation toggle
function navToggle() {
  document.getElementById('mainNav').classList.toggle('show');
}

// Preloader fade-out
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => preloader.remove(), 500);
  }
});

function navToggle() {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('show');
}

function scrollSlider(direction) {
  const slider = document.getElementById('cardSlider');
  const cards = slider.querySelectorAll('.card');
  const cardWidth = cards[0].offsetWidth + 16;

  if (direction === 1) {
    slider.appendChild(cards[0]);
  } else {
    slider.prepend(cards[cards.length - 1]);
  }

  slider.scrollTo({ left: 0, behavior: 'instant' });
}

document.addEventListener('DOMContentLoaded', () => {
  const slider    = document.getElementById('slider');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  let isDragging  = false;
  let startX      = 0;
  let scrollLeft = 0;
  let autoSlide;

  // Arrow buttons scroll by one slide width
  const slideWidth = () => slider.querySelector('.slide').offsetWidth + parseFloat(getComputedStyle(slider).gap);

  function slideBy(direction) {
    slider.scrollBy({ left: direction * slideWidth(), behavior: 'smooth' });
    resetAutoSlide();
  }
  prevBtn.addEventListener('click', () => slideBy(-1));
  nextBtn.addEventListener('click', () => slideBy(1));

  // Swipe support
  slider.addEventListener('pointerdown', e => {
    isDragging = true;
    slider.style.scrollBehavior = 'auto';
    startX = e.clientX;
    scrollLeft = slider.scrollLeft;
    clearInterval(autoSlide);
  });
  slider.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    slider.scrollLeft = scrollLeft - dx;
  });
  slider.addEventListener('pointerup', () => {
    isDragging = false;
    snapToClosest();
    slider.style.scrollBehavior = 'smooth';
    resetAutoSlide();
  });
  slider.addEventListener('pointerleave', () => {
    if (isDragging) {
      isDragging = false;
      snapToClosest();
      slider.style.scrollBehavior = 'smooth';
      resetAutoSlide();
    }
  });

  // Snap to closest slide
  function snapToClosest() {
    const slideW = slideWidth();
    const idx = Math.round(slider.scrollLeft / slideW);
    slider.scrollTo({ left: idx * slideW, behavior: 'smooth' });
  }

  // Auto-slide
  function startAutoSlide() {
    autoSlide = setInterval(() => slideBy(1), 5000);
  }
  function resetAutoSlide() {
    clearInterval(autoSlide);
    startAutoSlide();
  }
  startAutoSlide();
});
