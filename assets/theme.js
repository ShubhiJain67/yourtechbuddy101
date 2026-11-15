/* Applies the saved (or system) colour theme before the page paints, so there's no flash.
   Load this in <head> on every page. The toggle button itself lives in ytb.js. */
(function () {
  var t = null;
  try { t = localStorage.getItem('ytb:theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', t);
})();
