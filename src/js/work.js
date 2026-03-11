const containerWorks = document.querySelector(".work-content");
let PROJECTS = [];
let activeFilters = [];

async function init() {
    const res = await fetch("../../public/data/projects.json");
    const data = await res.json();
    PROJECTS = shuffleArray(data.projects);

    renderWorks();
    renderFilters();
}

function shuffleArray(arr) {
    const shuffled = [...arr];
    for(let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled;
}

function renderWorks() {
    containerWorks.innerHTML = "";
    const filtered = activeFilters.length === 0 ? PROJECTS : PROJECTS.filter(p => activeFilters.some(f => p.filters.includes(f)))

    filtered.forEach(work => {
        const item = document.createElement("div");
        item.classList.add("works-item")
        const imagesHTML = (work.images || [])
            .map(src => `
                <div class="media-item">
                <img src="${src}" alt="${work.title}" loading="lazy" />
                </div>
                `)
            .join("");

        const videosHTML = (work.videos || [])
            .map(src => {
                const type = src.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/quicktime";
                return `
                    <div class="media-item">
                    <video controls muted loop playsinline>
                    <source src="${src}" type="${type}">
                    Your browser does not support the video tag.
                    </video>
                    </div>
                    `;
            })
            .join("");

        item.innerHTML = `
                <h3>${work.title}</h3>
                <span class="work-meta year">${work.year}</span>
                <span class="work-meta materials">Materials: ${work.materials.join(", ")} </span>
                <span class="work-meta dims">Dimensions: ${work.dimensions}</span>
                <div class="work-media">
                ${imagesHTML}
                ${videosHTML}
                </div>
                `;
        containerWorks.appendChild(item)

        const imgs = item.querySelectorAll(".work-media img");
        imgs.forEach(img => {
            img.addEventListener("click", () => {
                img.parentElement.classList.toggle("full-page");
            })
        })
    })
}

function renderFilters() {
    const allFilters = shuffleArray([...new Set(PROJECTS.flatMap(p => p.filters))]);
    // console.log(shuffleArray(allFilters))
    const filterContainer = document.querySelector(".filter-content");

    allFilters.forEach(filter => {
        const item = document.createElement("li");
        item.classList.add("filter-item")
        item.innerHTML = `
            <button class="filter-btn">${filter}</button>
        `
        filterContainer.appendChild(item);
        item.addEventListener("click", (e) => markFilter(filter, e.currentTarget.querySelector("button")))
    })
}

function markFilter(filter, el) {
    if(activeFilters.includes(filter)) {
        activeFilters = activeFilters.filter(f => f !== filter);
        el.classList.remove("active")
    } else {
        activeFilters = [];
        document.querySelectorAll(".filter-btn.active").forEach(el => el.classList.remove("active"));
        activeFilters.push(filter);
        el.classList.add("active")
    }

    document.getElementById("filter-all").querySelector("button").classList.remove("active");

    if(activeFilters.length === 0) {
        document.getElementById("filter-all").querySelector("button").classList.add("active")
    }
    renderWorks()
}

document.getElementById("filter-all").addEventListener("click", () => {
    activeFilters = [];
    document.querySelectorAll(".filter-btn.active").forEach(el => el.classList.remove("active"));
    document.getElementById("filter-all").querySelector("button").classList.add("active")
    renderWorks();
})

init();