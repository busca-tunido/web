try {
  if (typeof Element !== 'undefined' && Element.prototype.releasePointerCapture) {
    var originalRelease = Element.prototype.releasePointerCapture;
    Element.prototype.releasePointerCapture = function (pointerId) {
      try {
        if (this.hasPointerCapture(pointerId)) {
          originalRelease.call(this, pointerId);
        }
      } catch (_err) {}
    };
  }
} catch (_e) {}

try {
  var storedTheme = localStorage.getItem('tunido_theme');
  var isDark =
    storedTheme === 'dark' ||
    ((!storedTheme || storedTheme === 'system') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
} catch (_e) {}
