(() => {
  "use strict";

  function installRoadTrain() {
    if (document.getElementById("pink-roadtrain")) return;

    const heading = [...document.querySelectorAll("h1,h2,h3,h4")]
      .find(h => /incoming workshop|workshop today/i.test(h.textContent));

    if (!heading) {
      console.warn("Workshop section not found");
      return;
    }

    const section = heading.closest("section, .card, .panel");

    if (!section) return;

    const container = document.createElement("div");
    container.id = "roadtrain-animation-container";
    container.style.cssText =
      "width:100%;height:230px;overflow:hidden;position:relative;margin:12px 0;pointer-events:none;";

    section.insertAdjacentElement("afterend", container);

    const script = document.createElement("script");
    script.src = "pink-roadtrain.js";
    script.onload = () => {
      const train = document.getElementById("pink-roadtrain");
      if (train) {
        container.appendChild(train);
        train.style.margin = "0";
      }
    };
    document.body.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installRoadTrain);
  } else {
    installRoadTrain();
  }
})();
