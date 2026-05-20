// custom cursor
var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
var hasMouseMoved = false;
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

// hide cursor initially, show on first mouse move
cursor.style.opacity = '0';
cursorRing.style.opacity = '0';

var cursorMx = 0, cursorMy = 0, cursorRx = 0, cursorRy = 0;

document.addEventListener('mousemove', function(e) {
  if (!hasMouseMoved) {
    hasMouseMoved = true;
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '1';
  }
  cursorMx = e.clientX;
  cursorMy = e.clientY;
  cursor.style.left = cursorMx + 'px';
  cursor.style.top = cursorMy + 'px';
});

(function animateRing() {
  cursorRx += (cursorMx - cursorRx) * 0.1;
  cursorRy += (cursorMy - cursorRy) * 0.1;
  cursorRing.style.left = cursorRx + 'px';
  cursorRing.style.top = cursorRy + 'px';
  requestAnimationFrame(animateRing);
})();

// hover state for cursor
document.querySelectorAll('a, button, .article-card, .author-card, .testimonial, .perk-item, .cat-btn, .trending-item').forEach(function(el) {
  el.addEventListener('mouseenter', function() {
    cursor.classList.add('is-hover');
    cursorRing.classList.add('is-hover');
  });
  el.addEventListener('mouseleave', function() {
    cursor.classList.remove('is-hover');
    cursorRing.classList.remove('is-hover');
  });
});

// scroll reveal with intersection observer
const io = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });

// animated number counters
document.querySelectorAll('.stat-num').forEach(function(el) {
  var target = parseInt(el.dataset.count);
  var suffix = el.dataset.suffix || '';
  var display = suffix.includes('K')
    ? function(v) { return Math.floor(v / 1000) + 'K+'; }
    : function(v) { return Math.floor(v) + suffix; };

  var numObs = new IntersectionObserver(function(entries) {
    if (!entries[0].isIntersecting) return;
    numObs.disconnect();
    var start = null;
    var dur = 1400;
    requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = display(eased * target);
      if (p < 1) requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  numObs.observe(el);
});

// mobile nav
var hamburger = document.getElementById('hamburger');
var mobileNav = document.getElementById('mobileNav');
var closeNavEl = document.getElementById('closeNav');
hamburger.addEventListener('click', function() { mobileNav.classList.add('open'); });
closeNavEl.addEventListener('click', function(e) { e.stopPropagation(); mobileNav.classList.remove('open'); });
closeNavEl.addEventListener('touchend', function(e) { e.preventDefault(); e.stopPropagation(); mobileNav.classList.remove('open'); });
mobileNav.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() { mobileNav.classList.remove('open'); });
});
// also close when tapping the overlay background
mobileNav.addEventListener('click', function(e) {
  if (e.target === mobileNav) mobileNav.classList.remove('open');
});

// highlight active nav link based on scroll position
var sections = document.querySelectorAll('section[id]');
var navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', function() {
  var current = '';
  sections.forEach(function(s) {
    if (window.scrollY >= s.offsetTop - 80) current = s.id;
  });
  navLinks.forEach(function(a) {
    a.style.background = a.href.includes(current) && current ? 'var(--yellow)' : '';
    a.style.color = a.href.includes(current) && current ? 'var(--black)' : '';
  });
}, { passive: true });


// ---- animation stuff (only if user hasn't disabled motion) ----
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  // cursor trail effect (desktop only)
  if (!isTouchDevice) {
    var trailDots = [];
    var trailPositions = [];
    for (var i = 0; i < 8; i++) {
      var dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      dot.style.opacity = (1 - i * 0.11).toFixed(2);
      dot.style.transform = 'translate(-50%,-50%) scale(' + (1 - i * 0.09).toFixed(2) + ')';
      document.body.appendChild(dot);
      trailDots.push(dot);
      trailPositions.push({ x: 0, y: 0 });
    }
    var trailMx = 0, trailMy = 0;
    document.addEventListener('mousemove', function(e) {
      trailMx = e.clientX;
      trailMy = e.clientY;
    });
    (function animateTrail() {
      trailPositions[0].x += (trailMx - trailPositions[0].x) * 0.35;
      trailPositions[0].y += (trailMy - trailPositions[0].y) * 0.35;
      trailDots[0].style.left = trailPositions[0].x + 'px';
      trailDots[0].style.top = trailPositions[0].y + 'px';
      for (var i = 1; i < 8; i++) {
        trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.35;
        trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.35;
        trailDots[i].style.left = trailPositions[i].x + 'px';
        trailDots[i].style.top = trailPositions[i].y + 'px';
      }
      requestAnimationFrame(animateTrail);
    })();
  }

  // hero parallax on mouse move (desktop only)
  if (!isTouchDevice) {
    var heroShape1 = document.querySelector('.hero-shape-1');
    var heroShape2 = document.querySelector('.hero-shape-2');
    var heroImgWrap = document.querySelector('.hero-img-wrap');
    var parMx = 0, parMy = 0;
    var par1x = 0, par1y = 0, par2x = 0, par2y = 0, par3x = 0, par3y = 0;

    document.addEventListener('mousemove', function(e) {
      parMx = e.clientX - window.innerWidth / 2;
      parMy = e.clientY - window.innerHeight / 2;
    });
    (function animateParallax() {
      par1x += (parMx * 0.02 - par1x) * 0.08;
      par1y += (parMy * 0.02 - par1y) * 0.08;
      par2x += (parMx * -0.03 - par2x) * 0.08;
      par2y += (parMy * -0.03 - par2y) * 0.08;
      par3x += (parMx * 0.015 - par3x) * 0.08;
      par3y += (parMy * 0.015 - par3y) * 0.08;
      if (heroShape1) heroShape1.style.translate = par1x + 'px ' + par1y + 'px';
      if (heroShape2) heroShape2.style.translate = par2x + 'px ' + par2y + 'px';
      if (heroImgWrap) heroImgWrap.style.translate = par3x + 'px ' + par3y + 'px';
      requestAnimationFrame(animateParallax);
    })();
  }

  // stat card bounce on hover
  document.querySelectorAll('.stat-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() { card.classList.add('bouncing'); });
    card.addEventListener('animationend', function() { card.classList.remove('bouncing'); });
  });

  // logo shake on hover
  var navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('mouseenter', function() { navLogo.classList.add('shaking'); });
    navLogo.addEventListener('animationend', function() { navLogo.classList.remove('shaking'); });
  }

  // trending number flip animation
  document.querySelectorAll('.trending-item').forEach(function(item) {
    var num = item.querySelector('.trending-num');
    if (!num) return;
    item.addEventListener('mouseenter', function() { num.classList.add('flipping'); });
    num.addEventListener('animationend', function() { num.classList.remove('flipping'); });
  });

  // perk items stagger in from left
  var perksList = document.querySelector('.perks-list');
  if (perksList) {
    var perkItems = perksList.querySelectorAll('.perk-item');
    perkItems.forEach(function(item, idx) {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-60px)';
      item.style.transitionDelay = (idx * 0.08) + 's';
      item.style.transitionProperty = 'opacity, transform';
      item.style.transitionDuration = '0.6s';
      item.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
    });
    var perksObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          perkItems.forEach(function(item) {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          });
          perksObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    perksObs.observe(perksList);
  }



  // section kicker wiggle when it scrolls into view
  var kickerObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('kicker-entered');
        kickerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-kicker').forEach(function(el) { kickerObs.observe(el); });

  // perk icon spin on hover
  document.querySelectorAll('.perk-item').forEach(function(item) {
    var icon = item.querySelector('.perk-icon');
    if (!icon) return;
    item.addEventListener('mouseenter', function() { icon.classList.add('spinning'); });
    icon.addEventListener('animationend', function() { icon.classList.remove('spinning'); });
  });

  // footer logo typewriter effect
  var footerLogo = document.querySelector('.footer-logo');
  if (footerLogo) {
    var textNode = null;
    footerLogo.childNodes.forEach(function(node) {
      if (node.nodeType === 3 && node.textContent.trim().length > 0) {
        textNode = node;
      }
    });
    if (textNode) {
      var text = textNode.textContent;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char-span';
        span.textContent = text[i];
        span.style.transitionDelay = (i * 0.04) + 's';
        frag.appendChild(span);
      }
      textNode.replaceWith(frag);

      var footerObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            footerLogo.querySelectorAll('.char-span').forEach(function(s) {
              s.classList.add('char-visible');
            });
            footerObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      footerObs.observe(footerLogo);
    }
  }

  // scroll progress bar
  var scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (scrollTop / docHeight) * 100 + '%';
  }, { passive: true });

  // hide scroll indicator after user scrolls
  var scrollIndicator = document.getElementById('scrollIndicator');
  var indicatorHidden = false;
  window.addEventListener('scroll', function() {
    if (!indicatorHidden && window.scrollY > 100) {
      scrollIndicator.classList.add('hidden');
      indicatorHidden = true;
    }
  }, { passive: true });

  // navbar shrinks on scroll
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // glitch effect on hero headline (runs once on load)
  var glitchEl = document.querySelector('.glitch-on-load');
  if (glitchEl) {
    glitchEl.setAttribute('data-text', glitchEl.textContent);
    setTimeout(function() {
      glitchEl.classList.add('glitching');
      setTimeout(function() { glitchEl.classList.remove('glitching'); }, 600);
    }, 800);
  }

  // magnetic buttons - they pull toward cursor (desktop only)
  if (!isTouchDevice) {
    document.querySelectorAll('[data-magnetic]').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });
  }

  // 3d tilt on article cards (desktop only)
  if (!isTouchDevice) {
    document.querySelectorAll('[data-tilt]').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateX = (0.5 - y) * 12;
        var rotateY = (x - 0.5) * 12;
        card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translate(-3px,-3px)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // text scramble effect on article titles
  var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*<>{}[]';
  document.querySelectorAll('[data-scramble]').forEach(function(el) {
    var originalText = el.textContent;
    var isScrambling = false;
    el.addEventListener('mouseenter', function() {
      if (isScrambling) return;
      isScrambling = true;
      var iterations = 0;
      var interval = setInterval(function() {
        el.textContent = originalText.split('').map(function(char, idx) {
          if (idx < iterations) return originalText[idx];
          if (char === ' ') return ' ';
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
        iterations++;
        if (iterations > originalText.length) {
          clearInterval(interval);
          el.textContent = originalText;
          isScrambling = false;
        }
      }, 35);
    });
  });

  // letter by letter reveal on section titles
  document.querySelectorAll('[data-letter-reveal]').forEach(function(title) {
    var children = Array.from(title.childNodes);
    title.innerHTML = '';
    var charIndex = 0;

    children.forEach(function(node) {
      if (node.nodeType === 3) {
        var text = node.textContent;
        for (var i = 0; i < text.length; i++) {
          var span = document.createElement('span');
          span.className = 'letter-reveal-char';
          span.textContent = text[i];
          span.style.transitionDelay = (charIndex * 0.04) + 's';
          title.appendChild(span);
          charIndex++;
        }
      } else {
        var clone = node.cloneNode(false);
        var innerText = node.textContent;
        for (var j = 0; j < innerText.length; j++) {
          var innerSpan = document.createElement('span');
          innerSpan.className = 'letter-reveal-char';
          innerSpan.textContent = innerText[j];
          innerSpan.style.transitionDelay = (charIndex * 0.04) + 's';
          clone.appendChild(innerSpan);
          charIndex++;
        }
        title.appendChild(clone);
      }
    });

    var letterObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.letter-reveal-char').forEach(function(ch) {
            ch.classList.add('revealed');
          });
          letterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    letterObs.observe(title);
  });

  // subtle parallax on sections while scrolling
  var parallaxSections = document.querySelectorAll('#latestArticles, #authors, #community');
  window.addEventListener('scroll', function() {
    parallaxSections.forEach(function(section) {
      var rect = section.getBoundingClientRect();
      var yOffset = rect.top * 0.03;
      section.style.transform = 'translateY(' + yOffset + 'px)';
    });
  }, { passive: true });

}
