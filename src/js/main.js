// ********************* DATA LAYER *************************

const PROJECTS = [
    {
        title: "Bossom",
        image: "../../public/images/landing-imgs/Bossom.jpg",
        year: ""
    },
    {
        title: "Disco Tortoise",
        image: "../../public/images/landing-imgs/Disco-Tortoise.jpg",
        year: "2023"
    },
    {
        title: "Foxy Loxy",
        image: "../../public/images/landing-imgs/Foxy-Loxy.jpg",
        year: "2023"
    },
    {
        title: "Hare in Headlights",
        image: "../../public/images/landing-imgs/Hare-in-Headlights.jpg",
        year: "2023"
    },
    {
        title: "Hay Bale",
        image: "../../public/images/landing-imgs/HayBale.jpg",
        year: "2023"
    },
    {
        title: "Hedgehog",
        image: "../../public/images/landing-imgs/Hedgehog.jpg",
        year: "2023"
    },
    {
        title: "Ick",
        image: "../../public/images/landing-imgs/ick.jpg",
        year: "2023"
    },
    {
        title: "Leggy Peggy",
        image: "../../public/images/landing-imgs/Leggy-Peggy.jpg",
        year: "2023"
    },
    {
        title: "Neon GRRRRR",
        image: "../../public/images/landing-imgs/Neon-GRRRR.jpg",
        year: "2023"
    },
    {
        title: "Oh Dear",
        image: "../../public/images/landing-imgs/Oh-Dear.jpg",
        year: "2023"
    },
    {
        title: "Ruck Sack",
        image: "../../public/images/landing-imgs/Ruck-Sack.jpg",
        year: "2023"
    },
    {
        title: "Urns",
        image: "../../public/images/landing-imgs/Urns.jpg",
        year: "2023"
    }
]

const N = PROJECTS.length;
const STEP = 360 / N;

// ********************* STATE LAYER *************************

let state = {
    rotation: 0,
    targetRotation: 0,
    activeIndex: -1,
};

// ********************** DOM REFERENCES **********************

const scene = document.getElementById("scene");
const track = document.getElementById("track");
const activeDisplay = document.getElementById("activeDisplay");
const centerCard = document.getElementById("centerCard");
const hint = document.getElementById("hint");
const focusZone = document.getElementById("focusZone");

// ********************** RENDERING LAYER **********************

function buildDom () {
    PROJECTS.forEach((project, index) => {
        const el = document.createElement("div");
        el.className = "track-item";
        el.dataset.index = index;
        el.textContent = project.title;
        track.appendChild(el);
    });
}

function render() {
    const cs = getComputedStyle(document.documentElement);
    const vw = window.innerWidth / 100;
    const rx = parseFloat(cs.getPropertyValue('--radius-x')) * vw;
    const ry = parseFloat(cs.getPropertyValue('--radius-y')) * vw;

    const items = track.querySelectorAll('.track-item');

    items.forEach((el, i) => {
        // Position angle: 0° starts item 0 at top (12 o'clock)
        const deg = (i * STEP) - state.rotation - 90;
        const rad = deg * Math.PI / 180;

        const x = Math.cos(rad) * rx;
        const y = Math.sin(rad) * ry;

        // Tangent angle — makes label follow the curve
        const tanAngle = Math.atan2(rx * Math.sin(rad), ry * Math.cos(rad))
            * 180 / Math.PI + 90;

        // Depth for opacity (items far away are more transparent)
        const depth = 1 -((Math.sin(rad) + 1) / 2);
        const opacity = 0.25 + depth * 0.55;

        el.style.transform = `
      translate(calc(-50% + ${x}px), calc(-50% + ${y}px))
      rotate(${tanAngle}deg)
    `;
        el.style.opacity = opacity;
        el.style.zIndex = Math.round(depth * 10);
    });

    // Which item is at 12 o'clock?
    const newActive = getActiveIndex(state.rotation);
    if (newActive !== state.activeIndex) {
        state.activeIndex = newActive;
        items.forEach((el, i) =>
            el.classList.toggle('is-active', i === newActive));
        renderCard(newActive);
    }
}

function renderCard(index) {
    const p = PROJECTS[index];

    activeDisplay.innerHTML = `
    <div class="display-card">
      <img src="${p.image}" alt="${p.title}" loading="lazy">
      <div class="card-footer">
        <div class="card-title">${p.title}</div>
      </div>
    </div>
  `;
}

function getActiveIndex(rot) {
    let closest = 0;
    let smallestDiff = Infinity;

    for (let i = 0; i < N; i++) {
        const deg = (i * STEP) - rot;
        const norm = ((deg % 360) + 360) % 360;

        const diff = Math.min(norm, 360 - norm);

        if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = i;
        }
    }

    return closest;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function tick() {
    const d = state.targetRotation - state.rotation;
    state.rotation = Math.abs(d) > 0.01
        ? lerp(state.rotation, state.targetRotation, 0.09)
        : state.targetRotation;
    render();
    requestAnimationFrame(tick);
}

function onScroll() {
    const top = scene.getBoundingClientRect().top + window.scrollY;
    const height = scene.offsetHeight - window.innerHeight;
    const pct = Math.max(0, Math.min(1, (window.scrollY - top) / height));

    state.targetRotation = pct * -360;
    // if (pct > 0.02) hint.style.opacity = '0';
}

window.addEventListener('scroll', onScroll, { passive: true });

function getCenter() {
    const rect = track.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

const drag = {
    on: false,
    startAngle: 0,
    startRot: 0
};

function dragStart(e) {
    drag.on = true;

    const { x: cx, y: cy } = getCenter();
    const mx = e.touches ? e.touches[0].clientX : e.clientX;
    const my = e.touches ? e.touches[0].clientY : e.clientY;

    drag.startAngle = Math.atan2(my - cy, mx - cx);
    drag.startRot = state.targetRotation;
}
function dragMove(e) {
    if (!drag.on) return;
    if (e.cancelable) e.preventDefault();

    const { x: cx, y: cy } = getCenter();
    const mx = e.touches ? e.touches[0].clientX : e.clientX;
    const my = e.touches ? e.touches[0].clientY : e.clientY;

    const currentAngle = Math.atan2(my - cy, mx - cx);
    const delta = currentAngle - drag.startAngle;

    state.targetRotation = drag.startRot - (delta * 180 / Math.PI);
}
function dragEnd() {
    if (!drag.on) return;
    drag.on = false;
}

console.log(track);
track.addEventListener('mousedown', dragStart);
track.addEventListener('touchstart', dragStart, { passive: true });
window.addEventListener('mousemove', dragMove);
window.addEventListener('touchmove', dragMove, { passive: false });
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);

buildDom();
tick();
onScroll();