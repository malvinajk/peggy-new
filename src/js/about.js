const containerExh = document.querySelector(".cv-exhibitions");
const containerWork = document.querySelector(".cv-work")

fetch("../../public/data/resume.json")
    .then(res => res.json())
    .then(data => {
        const exhibitionByDate = data.exhibitions.sort((a, b) => b.year - a.year);
        const workByDate = data.work.sort((a, b) => b.year - a.year)

        exhibitionByDate.forEach(show => {
            const item = document.createElement("div")
            item.classList.add("exhibition-item");

            const linkMarkup = show.link ? `<a href="${show.link}" target="_blank"><span>See it here</span></a>` : "";

            item.innerHTML = `
                <h3>${show.year}</h3>
                <span>${show.title}</span>
                <span>${show.location[0]}, ${show.location[1]}</span>
                ${linkMarkup}
                `;

            containerExh.appendChild(item);
        })

        workByDate.forEach(work => {
            const item = document.createElement("div")
            item.classList.add("work-item");

            item.innerHTML = `
                <h3>${work.year}</h3>
                <span>${work.position},</span>
                <span>${work.programme}</span>
                <span>${work.degree}</span>
                <span>${work.location[0]}, ${work.location[1]}</span>
                `;
            containerWork.appendChild(item);
        })
        
        console.log(workByDate)
    })

    