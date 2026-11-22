(() => {
  'use strict';
  if (document.getElementById('pink-roadtrain')) return;
  const css = document.createElement('style');
  css.textContent = `
    #pink-roadtrain { position:relative; height:125px; width:100%; overflow:hidden; pointer-events:none; margin:0; background:transparent; }
    #pink-roadtrain .ultra-quad-convoy { position:absolute; height:120px; width:max-content; left:100%; bottom:0; animation:ultra-quad-drive 28s linear infinite; }
    #pink-roadtrain .ultra-quad-convoy img { display:block; height:120px; width:auto; max-width:none; }
    #pink-roadtrain .ultra-quad-beacon { position:absolute; top:0; left:12%; width:5px; height:5px; background:#ffbf32; border-radius:50%; animation:ultra-quad-flash .65s steps(2,end) infinite; }
    #pink-roadtrain.night .ultra-quad-beacon { box-shadow:0 0 9px 5px #ffb21c; }
    @keyframes ultra-quad-drive { from { transform:translateX(0); } to { transform:translateX(calc(-100% - 100vw)); } }
    @keyframes ultra-quad-flash { 0%,49% { opacity:1; box-shadow:0 0 8px 3px #ffb21c; } 50%,100% { opacity:.25; box-shadow:none; } }
    @media (prefers-reduced-motion:reduce) { #pink-roadtrain .ultra-quad-convoy { animation:none; left:0; } #pink-roadtrain .ultra-quad-beacon {animation:none;} }
  `;
  document.head.appendChild(css);
  const root = document.createElement('div');
  root.id = 'pink-roadtrain';
  root.setAttribute('role','img');
  root.setAttribute('aria-label','Animated pink Kenworth-style Ultra Quad road train with four side-tipper trailers');
  const convoy = document.createElement('div');
  convoy.className = 'ultra-quad-convoy';
  const img = document.createElement('img');
  img.src = 'pink-ultra-quad.png';
  img.alt = '';
  const beacon = document.createElement('span');
  beacon.className = 'ultra-quad-beacon';
  convoy.append(img);
  root.appendChild(convoy);
  const hour = new Date().getHours();
  if (hour >= 17 || hour < 5) root.classList.add('night');
  const container = document.getElementById('roadtrain-animation-container');
  if (container) {
    container.appendChild(root);
  } else {
    const heading = [...document.querySelectorAll('h1,h2,h3,h4')].find(h => /incoming workshop|workshop today/i.test(h.textContent||''));
    const section = heading?.closest('section,.card,.panel');
    if (section) section.insertAdjacentElement('afterend',root);
    else console.warn('Pink Ultra Quad: workshop container not found.');
  }
})();
