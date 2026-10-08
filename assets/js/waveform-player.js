/* TuneTrack — waveform player helper.
   Keeps the waveform hit-area native-button selection/focus behavior clean and
   guarantees the two visual layers exist before catalog-page.js binds playback.
*/
(function () {
  function boot() {
    const hit = document.getElementById('warpWaveHit');
    const waveform = document.getElementById('warpWaveform');
    if (!hit || !waveform) return;

    hit.style.webkitTapHighlightColor = 'transparent';
    hit.style.userSelect = 'none';
    hit.style.webkitUserSelect = 'none';

    if (!document.getElementById('warpWaveBase')) {
      const base = document.createElement('div');
      base.id = 'warpWaveBase';
      waveform.appendChild(base);
    }
    if (!document.getElementById('warpWaveProgress')) {
      const progress = document.createElement('div');
      progress.id = 'warpWaveProgress';
      waveform.appendChild(progress);
    }
    if (!document.getElementById('warpWaveLocator')) {
      const locator = document.createElement('span');
      locator.id = 'warpWaveLocator';
      waveform.appendChild(locator);
    }
    if (!document.getElementById('warpWaveTooltip')) {
      const tooltip = document.createElement('span');
      tooltip.id = 'warpWaveTooltip';
      waveform.appendChild(tooltip);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
