const containerExh = document.querySelector(".cv-exhibitions");
const containerWork = document.querySelector(".cv-work")

fetch("../../public/data/resume.json")
    .then(res => res.json())
    .then(data => {
        const exhibitionByDate = data.exhibitions.sort((a, b) => b.year - a.year);

        exhibitionByDate.forEach(show => {
            const item = document.createElement("div")
            item.classList.add("exhibition-item");

            const linkMarkup = show.link ? `<a href="${show.link}" target="_blank"><span>See it here</span></a>` : "";

            item.innerHTML = `
                <span>${show.year}</span>
                <span>${show.title}</span>
                <span>${show.location[0]}, ${show.location[1]}</span>
                ${linkMarkup}
                `;

            containerExh.appendChild(item);
        })

        function getStartYear (yearArr) {
            return Number(yearArr[0]);
        }

        function getEndYear(yearArr) {
            const end = yearArr[1] || yearArr[0];
            if(typeof end === "string" && end.toLowerCase() === "present") return 9999;
            return Number(end);
        }

        const workByDate = data.work.sort((a, b) => {
            const endDiff = getEndYear(b.year) - getEndYear(a.year);
            if(endDiff !== 0) return endDiff;

            return getStartYear(b.year) - getStartYear(a.year)
        });

        workByDate.forEach(work => {
            const item = document.createElement("div")
            item.classList.add("work-item");
            const validDate = work.year[1] === undefined ? work.year[0] : `${work.year[0]} - ${work.year[1]}` 

            item.innerHTML = `
                <span>${validDate}</span>
                <span>${work.position}</span>
                <span>${work.programme}</span>
                <span>${work.location[0]}, ${work.location[1]}</span>
                `;
            containerWork.appendChild(item);
        })
        
        console.log(workByDate)
    })

    