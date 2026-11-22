(() => {
  'use strict';
  const start = document.getElementById('bcStart');
  const reader = document.getElementById('bcReader');
  if (!start || !reader || document.getElementById('bcMobileControls')) return;
  const panel = document.createElement('div');
  panel.id = 'bcMobileControls';
  panel.style.cssText = 'padding:12px;margin:10px 0;border:1px solid #d4a62d;border-radius:10px;background:#20252b;color:white';
  panel.innerHTML = '<label style="display:block"><input id="bcContinuous" type="checkbox" checked> Continuous scanning</label><label for="bcMobileZoom" style="display:block;margin-top:12px">Camera zoom: <output id="bcZoomValue">1.0x</output></label><input id="bcMobileZoom" type="range" min="1" max="1" value="1" step="0.1" disabled style="width:100%;min-height:42px"><p id="bcMobileStatus" role="status" aria-live="polite">Open camera to scan.</p>';
  reader.after(panel);
  const $ = id => document.getElementById(id);
  let track = null;
  function status(text) { $('bcMobileStatus').textContent = text; }
  async function attachZoom() {
    const video = reader.querySelector('video');
    track = video?.srcObject?.getVideoTracks()?.[0] || null;
    const slider = $('bcMobileZoom');
    slider.disabled = true;
    if (!track?.getCapabilities) { status('Scanning ready. Zoom not supported.'); return; }
    const cap = track.getCapabilities().zoom;
    if (!cap || !Number.isFinite(cap.min) || !Number.isFinite(cap.max) || cap.max <= cap.min) {
      status('Scanning ready. Zoom not supported on this camera.'); return;
    }
    slider.min = cap.min; slider.max = cap.max; slider.step = cap.step || 0.1;
    slider.value = track.getSettings().zoom || cap.min;
    $('bcZoomValue').textContent = Number(slider.value).toFixed(1) + 'x';
    slider.disabled = false;
    status('Scanning ready. Aim at a barcode.');
  }
  $('bcMobileZoom').addEventListener('input', async e => {
    if (!track) return;
    const value = Number(e.target.value);
    try {
      await track.applyConstraints({advanced:[{zoom:value}]});
      $('bcZoomValue').textContent = value.toFixed(1) + 'x';
    } catch { status('Zoom adjustment not supported.'); }
  });
  window.bcMobileUpgrade = {
    continuous: () => $('bcContinuous').checked,
    captured: code => { if (navigator.vibrate) navigator.vibrate(80); status('Captured: ' + code); },
    duplicate: code => status('Duplicate barcode: ' + code),
    ready: () => { setTimeout(attachZoom, 250); },
    stopped: () => { track = null; $('bcMobileZoom').disabled = true; status('Camera stopped.'); }
  };
})();
