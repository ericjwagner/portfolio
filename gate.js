(function () {
  var overlay = document.getElementById('pwOverlay');
  var dialog = document.getElementById('pwDialog');
  var digits = Array.prototype.slice.call(document.querySelectorAll('.pw-otp-digit'));
  var error = document.getElementById('pwError');
  var cancelBtn = document.getElementById('pwCancel');
  var pendingHref = null;

  function currentValue() {
    return digits.map(function (d) { return d.value; }).join('');
  }

  function clearError() {
    digits.forEach(function (d) { d.classList.remove('is-error'); });
    error.textContent = '';
  }

  function openDialog(href) {
    pendingHref = href;
    digits.forEach(function (d) { d.value = ''; });
    clearError();
    overlay.classList.add('is-open');
    setTimeout(function () { digits[0].focus(); }, 0);
  }

  function closeDialog() {
    overlay.classList.remove('is-open');
    pendingHref = null;
  }

  document.querySelectorAll('[data-protected]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openDialog({ url: link.getAttribute('href'), password: link.getAttribute('data-protected') });
    });
  });

  digits.forEach(function (d, i) {
    d.addEventListener('input', function () {
      d.value = d.value.replace(/[^0-9]/g, '');
      clearError();
      if (d.value && i < digits.length - 1) digits[i + 1].focus();
      if (d.value && i === digits.length - 1) dialog.requestSubmit();
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !d.value && i > 0) digits[i - 1].focus();
      if (e.key === 'ArrowLeft' && i > 0) digits[i - 1].focus();
      if (e.key === 'ArrowRight' && i < digits.length - 1) digits[i + 1].focus();
    });
    d.addEventListener('paste', function (e) {
      e.preventDefault();
      var chars = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').split('');
      digits.forEach(function (dg, j) { dg.value = chars[j] || ''; });
      clearError();
      var next = Math.min(chars.length, digits.length - 1);
      digits[next].focus();
    });
  });

  dialog.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!pendingHref) return;
    if (currentValue() === pendingHref.password) {
      window.location.href = pendingHref.url;
    } else {
      digits.forEach(function (d) { d.classList.add('is-error'); });
      error.textContent = 'Incorrect password.';
      dialog.classList.remove('is-shaking');
      void dialog.offsetWidth;
      dialog.classList.add('is-shaking');
      digits.forEach(function (d) { d.value = ''; });
      digits[0].focus();
    }
  });

  cancelBtn.addEventListener('click', closeDialog);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeDialog();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeDialog();
  });
})();
