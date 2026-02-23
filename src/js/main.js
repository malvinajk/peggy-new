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

// Positions each title item on the ellipse and updates their appearance based on depth. Also determines which item is active and updates the display card.

function render() {
    // gets all css variables and calculates the radius of the ellipse in pixels
    const cs = getComputedStyle(document.documentElement);
    // vw is 1% of the viewport width, so multiplying by the css variable gives us the radius in pixels
    const vw = window.innerWidth / 100;

    // gets the ellipse radii from css variables and converts them to pixels
    const rx = parseFloat(cs.getPropertyValue('--radius-x')) * vw;
    const ry = parseFloat(cs.getPropertyValue('--radius-y')) * vw;

    // grab all the track items (the project titles) to position them
    const items = track.querySelectorAll('.track-item');


    // start a loop over each title / item and position it based on its index and the current rotation state
    items.forEach((el, i) => {
        // Position angle: 0° starts item 0 at top (12 o'clock)
        // step is how many degrees between each item (360 / number of items)
        // i * step is where the item would be if there was no rotation
        // we subtract the current rotation to rotate the whole thing
        
        const deg = (i * STEP) - state.rotation;
        // convert the angle to radians because math.sin and math.cos use radians, not degrees
        const rad = deg * Math.PI / 180;

        // ellipse math to calculate the x and y position of the item based on the angle and the radii of the ellipse and to scale width and height
        const x = Math.cos(rad) * rx;
        const y = Math.sin(rad) * ry;

        // Tangent angle — makes label follow the curve
        // it is tangent to the ellipse
        // atan2 gives the angle between the horizontal axis and the point rx* sin, ry * cos, the slope of the ellipse at that point
        // multiply by 180 / pi to convert back to degrees and subtract 90 to rotate it so text it's upside on the bottom 
        const tanAngle = Math.atan2(rx * Math.sin(rad), ry * Math.cos(rad))
            * 180 / Math.PI - 90;

        // Depth for opacity (items far away are more transparent)
        // math.sin(rad) ranges from -1 (bottom) to 1 (top)
        // (sin +1) / 2 converts that to 0 -> 1
        // 1- (...) flips it so front / top is small depth, bottom/ back is larger depth
        // opacity then maps that to a reasonable range (0.25 to 0.8)
        // note: changed it back to have greater opacity at the front instead at the back
        const depth = (Math.sin(rad) + 1) / 2;
        const opacity = 0.25 + depth * 0.55;

        // moves the item to its calculated (x, y) position relative to the center.
        // -50% centers the item at its own midpoint
        // rotates it so it follows the curve of the ellipse
        el.style.transform = `
      translate(calc(-50% + ${x}px), calc(-50% + ${y}px))
      rotate(${tanAngle}deg)
        `;
        // applies the opacity for depth effect
        // zIndex ensures that items in front overlap items in back
        el.style.opacity = opacity;
        el.style.zIndex = Math.round(depth * 10);
    });

    // Which item is at 6 o'clock?
    // updates its class "is-active" and calls renderCard to display the current image
    // only runs when the active item changes to avoid unnecessary rendering
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

// gets the item around the circle that is closest to 6 o clock
// rot is the current rotation of the whole ellipse
// the function returns the index of the item closest to the bottom
function getActiveIndex(rot) {
    let targetOffset = 90; // offsetting the wheel to start at the bottom (the staring point is 3 o clock)
    let closest = 0; // which item is currently at the bottom - starts at 0
    let smallestDiff = Infinity; // how far the current closest item is from bottom, infinity means start with a huge number so anything smaller replaces it

    // starts the loop
    for (let i = 0; i < N; i++) { 
        const deg = (i * STEP) - rot - targetOffset; // i * STEP is where the item would be if there were no rotation, subtract rot == where it actually is now. So deg is the current angle of this item relative to the bottom 
        const norm = ((deg % 360) + 360) % 360; // angle cleanup in case it becomes negative or greater than 360. 

        const diff = Math.min(norm, 360 - norm); // this is distance clockwise vs distance anticlockwise and choose the smaller one, this gives the true shortest distance to 6

        // if this item is closer than the previous best, update smallestDiff, update closest
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = i;
        }
    }

    // after checking all items, return the index of the one that was closest to 6
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