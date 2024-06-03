// **Map showing the location of the territory to be guessed**

function placeMapOnpage(showMap) {
    let map = document.getElementById('helpMap');
    let insertTo = document.getElementById(showMap.getAttribute('maparea-id'));
    if (map == null) { // Check if it's already toggled, and the mp is displayed => then it hides it
        let mapTemplate = document.querySelector('#mapTemplate > svg').cloneNode(true);
        makeSpaceInSVG(mapTemplate);
        mapTemplate.id = "helpMap";
        let em = parseFloat(getComputedStyle(document.getElementById('midContent')).fontSize);
        let scale = 31 * em / mapTemplate.width.baseVal.value;

        if(imageOrigin.includes("world")) {
            mapTemplate.style.margin = "-400px";
        }

            // Animation
            mapTemplate.style.visibility = "hidden";
            setTimeout(() => {
                mapTemplate.style.visibility = "visible";
                mapTemplate.className = "";
            }, 75);

        mapTemplate.style.transform = `scale(${scale})`;
        insertTo.style.height = `${(mapTemplate.height.baseVal.value + 20) * scale}px`;
        insertTo.style.maxWidth = `98vw`;
        insertTo.appendChild(mapTemplate);
        let solutionCounty = document.querySelector(`#helpMap > g > #${Solution}`);
        solutionCounty.setAttribute('style', 'fill: var(--main-red) !important');
        let solutionCountyText = document.querySelector(`#helpMap > g > #${Solution.toUpperCase()}-txt`);
        emphasizeMapText(solutionCountyText);
        if (Round === 2) {
            let farthestCounty = document.querySelector(`#helpMap > g >#${Furthest.name}`);
            farthestCounty.setAttribute('style', 'fill: var(--main-red) !important');
            let farthestCountyText = document.querySelector(`#helpMap > g > #${Furthest.name.toUpperCase()}-txt`);
            emphasizeMapText(farthestCountyText);
        }
        let toggleColor = document.getElementById('tmpl-togglecolor').content.firstElementChild.cloneNode(true);
        insertTo.appendChild(toggleColor);
        buttonEventListeners("change-colour");
        if (mapTheme === "colorful") {
            swapMapColour(toggleColor.firstElementChild.firstElementChild, true);
        }
        window.dispatchEvent(new Event('resize'));
    } else {
        map.remove();
        let toggleColor = document.getElementById('toggleColoured');
        toggleColor.remove();
        insertTo.style.height = '0';
        try {document.getElementById('style-modification').remove();} catch {}
    }
}

function emphasizeMapText(txtlmnt) {
    try { 
        if (txtlmnt.childElementCount > 0) {
            txtlmnt.children[0].setAttribute('style', 'color: var(--text); font-weight: bolder; font-size: 130%;');
        } else if (txtlmnt != null) txtlmnt.setAttribute('style', 'color: var(--text); font-weight: bolder; font-size: 130%;');
    } catch {console.error("Something went wrong.")}
}

function swapMapColour(paletteIcon, forcetrue=false) {
    let modifiedStyles = document.getElementById('style-modification')
    if (forcetrue || modifiedStyles == null) {
        paletteIcon.style.filter = 'grayscale(1)';
    }
    if (modifiedStyles == null) {
        modifiedStyles = document.createElement('style');
        modifiedStyles.id = 'style-modification';
        modifiedStyles.innerHTML = `
            #helpMap > g > path           { fill: #FFFFFF !important; }
            #helpMap > g > path.county_y  { fill: #FFFFC0 !important; }
            #helpMap > g > path.county_r  { fill: #FFC0C0 !important; }
            #helpMap > g > path.county_b  { fill: #C0C0FF !important; }
            #helpMap > g > path.county_g  { fill: #C0FFC0 !important; }
            #helpMap path.water           { fill: #0080FF !important; }
            #helpMap > g > text           { fill: #000 }
            `;
        try {document.querySelector('#helpMap > g > path[style*="var(--red)"]').setAttribute('style', 'fill:var(--toastify-color-error) !important')} catch {}
        document.head.appendChild(modifiedStyles);
    } else {
        if (!forcetrue) {
            modifiedStyles.remove();
            paletteIcon.style.filter = '';
            try {document.querySelector('#helpMap > g > path[style*="var(--toastify-color-error)"]').setAttribute('style', 'fill:var(--red) !important')} catch {}
        }
    }
}