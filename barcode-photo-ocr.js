(() => {
  'use strict';
  const init = () => {
    const photo = document.getElementById('bcPhoto');
    const part = document.getElementById('bcPart');
    const desc = document.getElementById('bcDesc');
    if (!photo || !part || !desc || document.getElementById('bcOcrReview')) return;
    const box = document.createElement('section');
    box.id = 'bcOcrReview';
    box.style.cssText = 'border:1px solid #d4a62d;border-radius:10px;padding:12px;margin:12px 0;background:#20252b;color:#fff';
    box.innerHTML = `<strong>📸 Photo label reader (OCR)</strong><p id="bcOcrStatus" role="status" aria-live="polite">Take or select a clear photo of the part label.</p><div id="bcOcrFields" hidden><label for="bcOcrPart">Detected part number</label><input id="bcOcrPart" autocomplete="off"><label for="bcOcrDesc">Detected description</label><input id="bcOcrDesc" autocomplete="off"><button type="button" id="bcOcrApply">Use these details</button><button type="button" id="bcOcrCancel" class="sec">Discard result</button><details><summary>View all recognised text</summary><pre id="bcOcrRaw" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></details></div>`;
    photo.insertAdjacentElement('afterend', box);
    const $ = id => document.getElementById(id);
    let loadPromise;
    function loadOCR() {
      if (window.Tesseract) return Promise.resolve();
      if (!loadPromise) loadPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = resolve;
        s.onerror = () => reject(Error('OCR library could not load. Check internet connection.'));
        document.head.appendChild(s);
      }).catch(err => { loadPromise = null; throw err; });
      return loadPromise;
    }
    function parse(text) {
      const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      const labelled = lines.find(x => /\b(?:part\s*(?:no\.?|number|#)?|p\/?n|item\s*(?:no\.?|number|#)?|sku|product\s*(?:code|no\.?))\b/i.test(x));
      const afterLabel = labelled?.match(/(?:part\s*(?:no\.?|number|#)?|p\/?n|item\s*(?:no\.?|number|#)?|sku|product\s*(?:code|no\.?))\s*[:#-]?\s*([A-Z0-9][A-Z0-9._/-]{2,})/i)?.[1];
      const fallback = lines.flatMap(x => x.match(/\b[A-Z0-9][A-Z0-9._/-]{3,}\b/gi) || []).find(x => /\d/.test(x) && /[A-Z]/i.test(x));
      const candidate = afterLabel || fallback || '';
      const descriptionLine = lines.find(x => /^(?:description|desc|product name|item description)\s*[:#-]\s*\S/i.test(x));
      const description = descriptionLine ? descriptionLine.replace(/^(?:description|desc|product name|item description)\s*[:#-]\s*/i, '') : (lines.find(x => x !== labelled && x !== candidate && /[a-z]{3,}/i.test(x) && x.length >= 8) || '');
      return {candidate:candidate.slice(0,100), description:description.slice(0,200)};
    }
    photo.addEventListener('change', async () => {
      const file = photo.files?.[0];
      if (!file) return;
      $('bcOcrFields').hidden = true;
      if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
        $('bcOcrStatus').textContent = 'Please select an image under 12 MB.';
        return;
      }
      $('bcOcrStatus').textContent = 'Reading label photo...';
      try {
        await loadOCR();
        const result = await window.Tesseract.recognize(file, 'eng');
        const text = result.data?.text || '';
        const parsed = parse(text);
        $('bcOcrPart').value = parsed.candidate;
        $('bcOcrDesc').value = parsed.description;
        $('bcOcrRaw').textContent = text || 'No readable text.';
        $('bcOcrFields').hidden = false;
        $('bcOcrStatus').textContent = parsed.candidate ? 'Review the suggested part number and description before applying.' : 'No clear part number found. Review the recognised text or enter details manually.';
      } catch (err) {
        $('bcOcrStatus').textContent = 'Could not read image: ' + err.message;
      }
    });
    $('bcOcrApply').addEventListener('click', () => {
      const id = $('bcOcrPart').value.trim();
      const description = $('bcOcrDesc').value.trim();
      if (!id) { $('bcOcrStatus').textContent = 'Confirm a part number first.'; return; }
      part.value = id;
      desc.value = description;
      part.dispatchEvent(new Event('change', {bubbles:true}));
      // Preserve the OCR description if the existing change handler fills from a known part.
      if (description) desc.value = description;
      $('bcOcrFields').hidden = true;
      $('bcOcrStatus').textContent = 'Part details populated. Verify against the label, scan barcode, then Save & Next.';
    });
    $('bcOcrCancel').addEventListener('click', () => { $('bcOcrFields').hidden = true; $('bcOcrStatus').textContent = 'Result discarded. Existing form values unchanged.'; });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
