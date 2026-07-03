/* دكان 9 — theme.js */
'use strict';

// ── Sidebar ────────────────────────────────────────────────────
(function () {
  var overlay  = document.getElementById('sidebarOverlay');
  var sidebar  = document.getElementById('sidebar');
  var openBtn  = document.getElementById('mobileOpen');
  var closeBtn = document.getElementById('sidebarClose');

  if (!sidebar) return;

  // Force closed on every page load (fixes language-switch flash)
  sidebar.classList.remove('is-open');
  if (overlay) overlay.classList.remove('is-open');
  document.body.style.overflow = '';

  function openSidebar() {
    sidebar.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    sidebar.focus();
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  }

  if (openBtn)  openBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay)  overlay.addEventListener('click', closeSidebar);

  // Escape key closes
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) closeSidebar();
  });

  // Swipe-to-close on mobile
  var touchStartX = 0;
  sidebar.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  sidebar.addEventListener('touchend', function (e) {
    var diff = e.changedTouches[0].screenX - touchStartX;
    var isRTL = document.documentElement.dir === 'rtl';
    if (!isRTL && diff < -60) closeSidebar();
    if (isRTL  && diff >  60) closeSidebar();
  }, { passive: true });
})();

// ── Cart Count ─────────────────────────────────────────────────
async function updateCartCount() {
  try {
    var res  = await fetch('/cart.js');
    var cart = await res.json();
    var count = cart.item_count;

    // Header cart badge
    document.querySelectorAll('.header__cart-count').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });

    // Sidebar cart badge
    var sbBadge = document.querySelector('.sb__badge');
    if (sbBadge) {
      sbBadge.textContent = count;
      sbBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch (e) {}
}
updateCartCount();

// ── Product Gallery ────────────────────────────────────────────
(function () {
  var mainImg = document.querySelector('.product-gallery__main img');
  var thumbs  = document.querySelectorAll('.product-gallery__thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var src = thumb.dataset.src;
      if (src) { mainImg.src = src; mainImg.srcset = ''; }
      thumbs.forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    });
  });
})();

// ── Option buttons (variant selection) ────────────────────────
(function () {
  document.querySelectorAll('.option-btns').forEach(function (group) {
    group.querySelectorAll('.option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.option-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var inp = document.getElementById('variantId');
        if (inp && btn.dataset.variantId) inp.value = btn.dataset.variantId;
      });
    });
  });
})();

// ── Add to Cart (AJAX) ─────────────────────────────────────────
(function () {
  var form = document.getElementById('addToCartForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = (window.theme_strings && window.theme_strings.adding) || '...';

    try {
      var res = await fetch('/cart/add.js', { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error();
      btn.innerHTML = (window.theme_strings && window.theme_strings.added) || '✓';
      updateCartCount();
      setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
    } catch (err) {
      btn.innerHTML = (window.theme_strings && window.theme_strings.error) || '!';
      setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
    }
  });
})();

// ── Cart Remove ────────────────────────────────────────────────
(function () {
  document.querySelectorAll('.cart-item__remove').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var key = btn.dataset.key;
      if (!key) return;
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      });
      window.location.reload();
    });
  });
})();

// ── Cart Quantity buttons ──────────────────────────────────────
(function () {
  document.querySelectorAll('.cart-qty').forEach(function (wrap) {
    var inp   = wrap.querySelector('.cart-qty__input');
    var minus = wrap.querySelector('[data-action="minus"]');
    var plus  = wrap.querySelector('[data-action="plus"]');
    if (!inp) return;
    minus && minus.addEventListener('click', function () {
      var v = parseInt(inp.value) || 1;
      if (v > 1) { inp.value = v - 1; inp.dispatchEvent(new Event('change')); }
    });
    plus && plus.addEventListener('click', function () {
      inp.value = (parseInt(inp.value) || 1) + 1;
      inp.dispatchEvent(new Event('change'));
    });
  });
})();

// ── Newsletter ─────────────────────────────────────────────────
(function () {
  var form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var msg = document.getElementById('newsletterMsg');
    if (btn) btn.disabled = true;
    try {
      await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (msg) { msg.textContent = (window.theme_strings && window.theme_strings.newsletter_success) || '✓'; msg.style.display = 'block'; }
      form.reset();
    } catch (e) {}
    if (btn) btn.disabled = false;
  });
})();

// ── Header scroll shadow ───────────────────────────────────────
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(100,78,187,.15)' : '';
  }, { passive: true });
})();

// ── Product Page: Gallery ──────────────────────────────────────
(function () {
  var mainImg = document.getElementById('pdMainImgEl');
  var thumbs  = document.querySelectorAll('.pd-gallery__thumb');
  var prevBtn = document.getElementById('pdPrev');
  var nextBtn = document.getElementById('pdNext');
  var currentIdx = 0;

  if (!mainImg && !thumbs.length) return;

  function goToIdx(idx) {
    if (!thumbs.length) return;
    if (idx < 0) idx = thumbs.length - 1;
    if (idx >= thumbs.length) idx = 0;
    currentIdx = idx;
    var src = thumbs[idx].dataset.src;
    if (src && mainImg) {
      mainImg.style.opacity = '0';
      mainImg.style.transform = 'scale(0.97)';
      setTimeout(function () {
        mainImg.src = src;
        mainImg.style.opacity = '1';
        mainImg.style.transform = 'scale(1)';
      }, 180);
    }
    thumbs.forEach(function (t) { t.classList.remove('active'); });
    thumbs[idx].classList.add('active');
  }

  if (mainImg) {
    mainImg.style.transition = 'opacity .18s ease, transform .18s ease';
  }

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () { goToIdx(i); });
  });

  prevBtn && prevBtn.addEventListener('click', function () { goToIdx(currentIdx - 1); });
  nextBtn && nextBtn.addEventListener('click', function () { goToIdx(currentIdx + 1); });
})();

// ── Product Page: Variant Selector ────────────────────────────
(function () {
  var variantInput = document.getElementById('variantId');
  var optBtns      = document.querySelectorAll('.pd-opt-btn');
  var priceEl      = document.getElementById('pdPrice');
  var availEl      = document.getElementById('pdAvail');
  var addBtn       = document.getElementById('pdAddBtn');
  var variantDataEl = document.getElementById('pdVariantData');
  if (!variantInput || !optBtns.length || !variantDataEl) return;

  var variants = JSON.parse(variantDataEl.textContent);
  var isAr = document.documentElement.lang === 'ar';

  function getSelectedOptions() {
    var opts = {};
    document.querySelectorAll('.pd-option').forEach(function (group) {
      var active = group.querySelector('.pd-opt-btn.active');
      if (active) opts[active.dataset.option] = active.dataset.value;
    });
    return opts;
  }

  function findVariant(opts) {
    return variants.find(function (v) {
      return v.options.every(function (o, i) {
        return opts[i + 1] === o;
      });
    });
  }

  function updateUI(variant) {
    if (!variant) return;

    // Price
    if (priceEl) {
      var html = '';
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        var pct = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
        html  = '<span class="pd-price-old">' + formatMoney(variant.compare_at_price) + '</span>';
        html += '<span class="pd-price-main pd-price-main--sale">' + formatMoney(variant.price) + '</span>';
        html += '<span class="pd-price-save">' + (isAr ? 'وفّر' : 'Save') + ' ' + formatMoney(variant.compare_at_price - variant.price) + '</span>';
      } else {
        html = '<span class="pd-price-main">' + formatMoney(variant.price) + '</span>';
      }
      priceEl.innerHTML = html;
    }

    // Availability
    if (availEl) {
      availEl.innerHTML = variant.available
        ? '<span class="pd-avail pd-avail--in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>' + (isAr ? 'متوفر في المخزون' : 'In stock') + '</span>'
        : '<span class="pd-avail pd-avail--out">' + (isAr ? 'نفذ المخزون' : 'Out of stock') + '</span>';
    }

    // Add button
    if (addBtn) {
      addBtn.disabled = !variant.available;
      if (!variant.available) {
        addBtn.innerHTML = isAr ? 'نفذ المخزون' : 'Sold Out';
      } else {
        addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' + (isAr ? 'أضف إلى السلة' : 'Add to Cart');
      }
    }

    // Update hidden input
    variantInput.value = variant.id;

    // Update gallery image if variant has image
    if (variant.featured_image) {
      var mainImg = document.getElementById('pdMainImgEl');
      if (mainImg) mainImg.src = variant.featured_image.src;
    }
  }

  function formatMoney(cents) {
    var amount = (cents / 100).toFixed(2);
    return window.Shopify && window.Shopify.currency
      ? amount + ' ' + window.Shopify.currency.active
      : amount;
  }

  optBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.closest('.pd-option');
      group.querySelectorAll('.pd-opt-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Update label
      var label = group.querySelector('.pd-option__label strong');
      if (label) label.textContent = btn.dataset.value;

      var opts = getSelectedOptions();
      var variant = findVariant(opts);
      if (variant) updateUI(variant);
    });
  });
})();

// ── Product Page: Qty buttons ─────────────────────────────────
(function () {
  var inp   = document.querySelector('.pd-qty__input');
  var minus = document.querySelector('.pd-qty__btn[data-action="minus"]');
  var plus  = document.querySelector('.pd-qty__btn[data-action="plus"]');
  if (!inp) return;
  minus && minus.addEventListener('click', function () {
    var v = parseInt(inp.value) || 1;
    if (v > 1) inp.value = v - 1;
  });
  plus && plus.addEventListener('click', function () {
    inp.value = (parseInt(inp.value) || 1) + 1;
  });
})();

// ── Product Page: AJAX Add to Cart ───────────────────────────
(function () {
  var form    = document.getElementById('addToCartForm');
  var notice  = document.getElementById('pdCartNotice');
  var addBtn  = document.getElementById('pdAddBtn');
  if (!form || !addBtn) return;

  var isAr = document.documentElement.lang === 'ar';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var orig = addBtn.innerHTML;
    addBtn.disabled = true;
    addBtn.innerHTML = isAr ? '⏳ جاري الإضافة...' : '⏳ Adding...';

    try {
      var res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error();

      addBtn.innerHTML = '✓ ' + (isAr ? 'تمت الإضافة' : 'Added!');
      addBtn.style.background = '#059669';

      if (notice) {
        notice.className = 'pd-cart-notice pd-cart-notice--success';
        notice.textContent = isAr
          ? '✓ تمت إضافة المنتج للسلة بنجاح'
          : '✓ Product added to cart successfully';
        notice.style.display = 'block';
      }
      updateCartCount();

      setTimeout(function () {
        addBtn.innerHTML = orig;
        addBtn.disabled  = false;
        addBtn.style.background = '';
        if (notice) notice.style.display = 'none';
      }, 3000);

    } catch (err) {
      if (notice) {
        notice.className = 'pd-cart-notice pd-cart-notice--error';
        notice.textContent = isAr ? '⚠️ حدث خطأ، حاول مجدداً' : '⚠️ Something went wrong, please try again';
        notice.style.display = 'block';
      }
      addBtn.innerHTML = orig;
      addBtn.disabled  = false;
    }
  });
})();

// ── Product Page: Accordion ───────────────────────────────────
(function () {
  var btn  = document.getElementById('pdDescBtn');
  var body = document.getElementById('pdDescBody');
  if (!btn || !body) return;

  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    if (expanded) {
      body.classList.add('closed');
    } else {
      body.classList.remove('closed');
    }
  });
})();

// ── Product Page: Copy link ───────────────────────────────────
(function () {
  var copyBtn = document.querySelector('.pd-share__copy');
  if (!copyBtn) return;
  copyBtn.addEventListener('click', function () {
    var url = copyBtn.dataset.url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function () {
          copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        }, 2000);
      });
    }
  });
})();

// ── Collection: Grid toggle ───────────────────────────────────
(function () {
  var btns = document.querySelectorAll('.coll-view-btn');
  var grid = document.getElementById('collGrid');
  if (!btns.length || !grid) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cols = btn.dataset.cols;
      grid.className = 'coll-grid cols-' + cols;
    });
  });
})();

// ── Quick add from product card ───────────────────────────────
(function () {
  document.querySelectorAll('.pcard__quick-form').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn  = form.querySelector('.pcard__quick-btn');
      var orig = btn.innerHTML;
      var isAr = document.documentElement.lang === 'ar';
      btn.disabled = true;
      btn.innerHTML = isAr ? '⏳' : '⏳';
      try {
        var res = await fetch('/cart/add.js', { method: 'POST', body: new FormData(form) });
        if (!res.ok) throw new Error();
        btn.innerHTML = '✓';
        updateCartCount();
        setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
      } catch (err) {
        btn.innerHTML = '!';
        setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
      }
    });
  });
})();
