(() => {
  "use strict";

  if (document.getElementById("pink-roadtrain")) return;

  const style = document.createElement("style");

  style.textContent = `
    #pink-roadtrain {
      position: relative;
      width: 100%;
      height: 115px;
      overflow: hidden;
      margin: 12px 0;
      background: transparent;
      pointer-events: none;
    }

    #pink-roadtrain .road {
      position: absolute;
      bottom: 10px;
      width: 100%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        #b8860b,
        transparent
      );
    }

    #pink-roadtrain .convoy {
      position: absolute;
      bottom: 13px;
      left: 100%;
      display: flex;
      align-items: flex-end;
      width: max-content;
      animation: roadtrain-drive 23s linear infinite;
    }

    #pink-roadtrain .truck {
      position: relative;
      width: 100px;
      height: 55px;
      flex-shrink: 0;
    }

    #pink-roadtrain .cab {
      position: absolute;
      bottom: 13px;
      left: 5px;
      width: 42px;
      height: 38px;
      background: linear-gradient(
        135deg,
        #ffb6dc,
        #ff1493,
        #b90065
      );
      border: 2px solid #ffd6ef;
      border-radius: 12px 7px 3px 3px;
      box-shadow: 0 0 9px #ff149355;
    }

    #pink-roadtrain .window {
      position: absolute;
      top: 7px;
      left: 7px;
      width: 21px;
      height: 13px;
      background: #8dd9ff;
      border: 2px solid silver;
      border-radius: 4px;
    }

    #pink-roadtrain .bonnet {
      position: absolute;
      bottom: 13px;
      left: 44px;
      width: 37px;
      height: 24px;
      background: linear-gradient(
        #ff88cb,
        #ff1493
      );
      border: 2px solid #ddd;
      border-radius: 4px 10px 3px 3px;
    }

    #pink-roadtrain .chassis {
      position: absolute;
      bottom: 10px;
      left: 3px;
      width: 94px;
      height: 7px;
      background: linear-gradient(
        silver,
        #555
      );
      border-radius: 3px;
    }

    #pink-roadtrain .exhaust {
      position: absolute;
      bottom: 42px;
      left: 2px;
      width: 5px;
      height: 22px;
      background: silver;
      border-radius: 3px;
    }

    #pink-roadtrain .smoke {
      position: absolute;
      bottom: 63px;
      left: 0;
      width: 12px;
      height: 12px;
      background: #aaaaaa88;
      border-radius: 50%;
      animation: pink-smoke 2s ease-out infinite;
    }

    #pink-roadtrain .beacon {
      position: absolute;
      bottom: 53px;
      left: 25px;
      width: 10px;
      height: 7px;
      background: orange;
      border-radius: 50% 50% 0 0;
      animation: pink-beacon .6s infinite alternate;
    }

    #pink-roadtrain .headlight {
      position: absolute;
      bottom: 25px;
      left: 79px;
      width: 7px;
      height: 9px;
      background: #fff4b0;
      border-radius: 3px;
    }

    #pink-roadtrain.night .headlight {
      box-shadow:
        0 0 12px 5px #fff6a0,
        0 0 25px 10px #fff6a055;
    }

    #pink-roadtrain .trailer {
      position: relative;
      width: 85px;
      height: 48px;
      margin-left: 12px;
      flex-shrink: 0;
    }

    #pink-roadtrain .tipper {
      position: absolute;
      bottom: 15px;
      left: 0;
      width: 82px;
      height: 29px;
      background: linear-gradient(
        160deg,
        #ffb1dd,
        #ff1493,
        #a80060
      );
      border: 2px solid #ffcae8;
      border-radius: 4px 4px 8px 8px;
      box-sizing: border-box;
      transform: skewX(-5deg);
    }

    #pink-roadtrain .tipper::after {
      content: "";
      position: absolute;
      left: 13px;
      top: 2px;
      width: 2px;
      height: 22px;
      background: #ffd1ed;
      box-shadow:
        18px 0 #ffd1ed,
        36px 0 #ffd1ed,
        54px 0 #ffd1ed;
    }

    #pink-roadtrain .wheel {
      position: absolute;
      bottom: 0;
      width: 16px;
      height: 16px;
      background: #111;
      border: 3px solid #555;
      border-radius: 50%;
      box-sizing: border-box;
      animation: pink-wheel .45s linear infinite;
    }

    #pink-roadtrain .wheel::after {
      content: "";
      position: absolute;
      inset: 3px;
      border: 2px solid silver;
      border-radius: 50%;
    }

    #pink-roadtrain .w1 { left: 18px; }
    #pink-roadtrain .w2 { left: 58px; }

    @keyframes roadtrain-drive {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(calc(-100vw - 600px));
      }
    }

    @keyframes pink-wheel {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pink-beacon {
      from {
        box-shadow: 0 0 2px orange;
      }
      to {
        box-shadow: 0 0 18px 8px orange;
      }
    }

    @keyframes pink-smoke {
      from {
        opacity: .7;
        transform: translate(0,0) scale(.5);
      }
      to {
        opacity: 0;
        transform: translate(-25px,-35px) scale(2);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #pink-roadtrain .convoy,
      #pink-roadtrain .wheel,
      #pink-roadtrain .smoke,
      #pink-roadtrain .beacon {
        animation: none;
      }

      #pink-roadtrain .convoy {
        left: 5px;
      }
    }
  `;

  document.head.appendChild(style);

  const roadtrain = document.createElement("div");
  roadtrain.id = "pink-roadtrain";

  roadtrain.setAttribute(
    "aria-label",
    "Animated pink road train with four side tipper trailers"
  );

  roadtrain.innerHTML = `
    <div class="road"></div>

    <div class="convoy">

      <div class="truck">
        <div class="exhaust"></div>
        <div class="smoke"></div>
        <div class="beacon"></div>
        <div class="cab">
          <div class="window"></div>
        </div>
        <div class="bonnet"></div>
        <div class="chassis"></div>
        <div class="headlight"></div>
        <div class="wheel w1"></div>
        <div class="wheel w2"></div>
      </div>

      ${Array.from({ length: 4 }, () => `
        <div class="trailer">
          <div class="tipper"></div>
          <div class="wheel w1"></div>
          <div class="wheel w2"></div>
        </div>
      `).join("")}

    </div>
  `;

  const hour = new Date().getHours();

  if (hour >= 17 || hour < 5) {
    roadtrain.classList.add("night");
  }

  const headings = [...document.querySelectorAll("h1,h2,h3")];

  const workshop = headings.find(h =>
    /workshop today|incoming workshop/i.test(
      h.textContent
    )
  );

  if (workshop) {
    const section = workshop.closest(
      "section, .card, .panel"
    );

    if (section) {
      section.insertAdjacentElement(
        "afterend",
        roadtrain
      );
    } else {
      workshop.insertAdjacentElement(
        "afterend",
        roadtrain
      );
    }
  } else {
    console.warn(
      "Pink Road Train: Workshop section not found."
    );
  }

})();
