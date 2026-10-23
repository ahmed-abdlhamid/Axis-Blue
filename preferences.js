// Apply before first paint; storage may be unavailable when opened as a local file.
document.documentElement.classList.add('js');
try {
  const queryTheme = location.protocol === 'file:' ? new URLSearchParams(location.search).get('theme') : null;
  const saved = queryTheme === 'dark' || queryTheme === 'light' ? queryTheme : localStorage.getItem('axis-theme');
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light'
    ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch {
  document.documentElement.dataset.theme = 'light';
}
