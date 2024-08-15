// **Map showing the location of the territory to be guessed**

function placeMapOnpage(showMap) {
    let map = document.getElementById('helpMap');
    let insertTo = document.getElementById(showMap.getAttribute('maparea-id'));
    if (map != null) {
        // Check if it's already toggled, and the map is displayed => then it hides it
        removeHelpMap();
    } else {
        // Add map on the page
        let mapTemplate = document.querySelector('#mapTemplate > svg').cloneNode(true);
        makeSpaceInSVG(mapTemplate);
        mapTemplate.id = "helpMap";
        insertTo.appendChild(mapTemplate);
        let scale = calculateOriginalSizeOfMap();

        if (Round !== 4 && Round != 5) {
            let allCities = document.querySelector('#helpMap g#settlements');
            if (allCities != null) allCities.remove();
        }

        if(gameMap === "World") {
            mapTemplate.style.margin = "-400px";
        }

        // Animation
        mapTemplate.style.visibility = "hidden";
        setTimeout(() => {
            mapTemplate.style.visibility = "visible";
            mapTemplate.className = "";
        }, 75);

        mapTemplate.style.transform = `scale(${scale * mapZoom})`;
        mapTemplate.style.translate = `${mapTranslate[0]}px ${mapTranslate[1]}px`;
        insertTo.style.height = `${(mapTemplate.height.baseVal.value * 1.1) * scale}px`;
        insertTo.style.maxWidth = `98vw`;
        let solutionCounty = document.querySelector(`#helpMap > g > #${Solution}`);
        solutionCounty.setAttribute('style', 'fill: var(--main-red) !important');
        let solutionCountyText = document.querySelector(`#helpMap > g > #${Solution.toUpperCase()}-txt`);
        if (solutionCountyText !== null) {
            emphasizeMapText(solutionCountyText); 
        }
        if (Round === 2) {
            let farthestCounty = document.querySelector(`#helpMap > g >#${Furthest.name}`);
            farthestCounty.setAttribute('style', 'fill: var(--main-red) !important');
            let farthestCountyText = document.querySelector(`#helpMap > g > #${Furthest.name.toUpperCase()}-txt`);
            if (farthestCountyText !== null) {
                emphasizeMapText(farthestCountyText);
            }
        }
        if (Round === 4 || Round === 5) {
            // Event listeners for the cities
            let allCities = document.querySelectorAll('#helpMap g#settlements circle');
            for (let city of allCities) {
                city.addEventListener('mouseover', (e) => {
                    let popupOnScreen = document.getElementById('popupgroup');
                    if (popupOnScreen == null) {
                        popupOnScreen = document.createElement('g');
                        popupOnScreen.appendChild(document.createElement('div'));
                    }
                    if (popupOnScreen.firstElementChild.id.match(/[^-]*/)[0] !== city.id) {
                        // If the popup is not already the same as the hovered city
                        if (popupOnScreen !== null) {
                            popupOnScreen.remove();
                        }
                        let cityName = replaceSpecialCharacters(city.id, true);
                        let popup = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
                        popup.id = city.id + '-popup';
                        popup.setAttribute('x', e.target.getAttribute("cx"));
                        popup.setAttribute('y', parseFloat(e.target.getAttribute("cy")) - 40);
                        popup.setAttribute('rx', '15');
                        popup.setAttribute('ry', '15');
                        popup.setAttribute('fill', "var(--front-bg)");
                        let popupText = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                        popupText.setAttribute('x', parseFloat(e.target.getAttribute("cx")) + 5);
                        popupText.setAttribute('y', parseFloat(e.target.getAttribute("cy")) - 15);
                        popupText.style.fill = 'var(--text)';
                        const popupWidth = 80 + (cityName.length > 12) * cityName.length; // Width of the popup rectangle
                        const popupHeight = 40; // Height of the popup rectangle
                        popup.setAttribute("width", popupWidth);
                        popup.setAttribute("height", popupHeight);
                        const cityNameLength = cityName.length * 0.6; // Length of the city name
                        const fontSize = Math.max(7, Math.floor(Math.min(popupWidth / cityNameLength, popupHeight - 18))); // Calculate the font size
                        popupText.style.fontSize = `${fontSize}px`; // Set the font size
                        popupText.style.fontWeight = 'bold';
                        if (Cities[getIndexByProperty(Cities, "name", city.id)].capital) {
                            popupText.style.textDecoration = "underline";
                        }
                        popupText.innerHTML = cityName;
                        let popupgroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                        popupgroup.id = 'popupgroup';
                        popupgroup.appendChild(popup);
                        popupgroup.appendChild(popupText);
                        e.target.parentElement.parentElement.appendChild(popupgroup);
                    }
                });
            }
        }

        // Toggle colour button
        let toggleColor = document.getElementById('tmpl-togglecolor').content.firstElementChild.cloneNode(true);
        insertTo.appendChild(toggleColor);
        buttonEventListeners("change-colour");
        if (mapTheme === "colorful") {
            swapMapColour(toggleColor.firstElementChild.firstElementChild, true);
        }

        // Toggle labels button
        let toggleLabels = document.getElementById('tmpl-togglelabels').content.firstElementChild.cloneNode(true);
        insertTo.appendChild(toggleLabels);
        buttonEventListeners("change-labels-visibility");
        if (mapLabelsDefault) {
            toggleLabels.firstElementChild.style.filter = 'grayscale(1)';
        } else {
            toggleMapTexts();
        }

        // Toggle cities button
        if (Round === 4 || Round === 5) {
            let toggleCities = document.getElementById('tmpl-togglecities').content.firstElementChild.cloneNode(true);
            insertTo.appendChild(toggleCities);
            buttonEventListeners("change-cities-visibility");
            if (mapCitiesDefault) {
                toggleCities.firstElementChild.style.filter = 'grayscale(1)';
            } else {
                toggleCitiesOnMap();
            }
        }

        // Zoom buttons
        let zoomInButton = document.getElementById('tmpl-zoom-button').content.firstElementChild.cloneNode(true);
        let zoomOutButton = document.getElementById('tmpl-zoom-button').content.firstElementChild.cloneNode(true);
        let resetZoomButton = document.getElementById('tmpl-zoom-button').content.firstElementChild.cloneNode(true);
        zoomInButton.id = "button-zoom-in";
        zoomOutButton.id = "button-zoom-out";
        resetZoomButton.id = "button-zoom-reset";
        zoomInButton.firstElementChild.firstElementChild.innerHTML = "+";
        zoomOutButton.firstElementChild.firstElementChild.innerHTML = "–";
        resetZoomButton.firstElementChild.firstElementChild.innerHTML = "⨁";
        insertTo.appendChild(zoomInButton);
        insertTo.appendChild(zoomOutButton);
        insertTo.appendChild(resetZoomButton);
        buttonEventListeners("button-zoom-in");
        buttonEventListeners("button-zoom-out");
        buttonEventListeners("button-zoom-reset");

        // Make reset button transparent if the map is already in the default position
        changeZoomOfMap(1);

        // Make the map draggable
        mapTemplate.addEventListener('mousedown', startDrag);
        mapTemplate.addEventListener('touchstart', startDrag);

        function startDrag(event) {
            event.preventDefault();
            let initialX = event.clientX || event.touches[0].clientX;
            let initialY = event.clientY || event.touches[0].clientY;

            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);

            function drag(event) {
                event.preventDefault();
                let currentX = event.clientX || event.touches[0].clientX;
                let currentY = event.clientY || event.touches[0].clientY;
                let deltaX = currentX - initialX;
                let deltaY = currentY - initialY;
                initialX = currentX;
                initialY = currentY;
                updateMapPositionData(mapTemplate);
                deltaX += parseFloat(mapTranslate[0]);
                deltaY += parseFloat(mapTranslate[1]);
                mapTemplate.style.translate = `${deltaX}px ${deltaY}px`;
                updateMapPositionData(mapTemplate);
                changeZoomOfMap(1);
            }

            function stopDrag() {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
            }
        }

        // Update size of the map to fit into the screen
        window.dispatchEvent(new Event('resize'));
    }
}

function getTranslateValues(transform = false, translateString, transformString) {
    if (transform) {
        let translateXY = transformString.match(/translate\(([^,]+)px, ([^,]+)px\)/);
        if (translateXY == null) {
            return [0, 0, 0];
        } else {
            return translateXY;
        }
    } else {
        let translateXY = translateString.match(/([^,]+)px ([^,]+)px/);
        if (translateXY == null) {
            return [0, 0, 0];
        } else {
            return translateXY;
        }
    }
}

function resetMapPosition() {
    let map = document.getElementById('helpMap');
    mapZoom = 1;
    mapTranslate = [0, 0];
    map.style.transform = `scale(${calculateOriginalSizeOfMap() * mapZoom})`;
    map.style.translate = `0px 0px`;
    changeZoomOfMap(1, true);
}

function removeHelpMap(withTransition = true) {
    let showMap = document.querySelector('a#showMap');
    if (showMap !== null) {
        let map = document.getElementById('helpMap');
        if (map !== null) map.remove();
        let toggleColor = document.getElementById('toggleColoured');
        if (toggleColor !== null) toggleColor.remove();
        let toggleLabels = document.getElementById('toggleLabels');
        if (toggleLabels !== null) toggleLabels.remove();
        let toggleCities = document.getElementById('toggleCities');
        if (toggleCities !== null) toggleCities.remove();
        let zoomInButton = document.getElementById('button-zoom-in');
        if (zoomInButton !== null) zoomInButton.remove();
        let zoomOutButton = document.getElementById('button-zoom-out');
        if (zoomOutButton !== null) zoomOutButton.remove();
        let resetZoomButton = document.getElementById('button-zoom-reset');
        if (resetZoomButton !== null) resetZoomButton.remove();
        let warningText = document.getElementById('warning-text');
        if (warningText !== null) warningText.remove();
        let placeWhereMapIsInserted = document.getElementById(showMap.getAttribute('maparea-id'));
        if (!withTransition) {
            placeWhereMapIsInserted.className = "grid justify-center border-gray-200 border-2 mb-4 mt-4";
        } else if (!placeWhereMapIsInserted.className.includes('transition-all')) {
            placeWhereMapIsInserted.className += " transition-all";
        }
        placeWhereMapIsInserted.style.height = '0';
        try {document.getElementById('style-modification').remove();} catch {}
    }
}

function emphasizeMapText(txtlmnt) {
    try { 
        if (txtlmnt.childElementCount > 0) {
            txtlmnt.children[0].setAttribute('style', 'color: var(--text); font-weight: bolder; font-size: 130%;');
        } else if (txtlmnt != null) txtlmnt.setAttribute('style', 'color: var(--text); font-weight: bolder; font-size: 130%;');
    } catch (err) {console.error(`Something went wrong: ${err}`)}
}

function toggleMapTexts() {
    let mapTextsList = document.querySelectorAll('#helpMap > g > text');
    let toggleLabels = document.getElementById('toggleLabelsButton');
    if (mapTextsList[0] == undefined) {
        let newtext = document.createElement('text');
        try {
            document.querySelector('#helpMap > #textgroup').appendChild(newtext);
        } catch (err) {
            console.error(`Something went wrong: ${err}`);
        }
        mapTextsList = [newtext];

    }
    if(mapTextsList[0].style.display === 'none') {
        // Enable texts
        for (let txt of mapTextsList) {
            txt.style.display = '';
        }
    
        // Make the button grey
        toggleLabels.style.filter = 'grayscale(1)';
    } else {
        // Disable texts
        for (let txt of mapTextsList) {
            txt.style.display = 'none';
        }

        // Make the button normal
        toggleLabels.style.filter = '';
    }
}

function toggleCitiesOnMap() {
    let cities = document.querySelector('#helpMap g#settlements');
    let toggleCities = document.getElementById('toggleCitiesButton');
    if (cities == null) {
        let citiesGroup = document.createElement('g');
        citiesGroup.id = 'settlements';
        document.querySelector('#helpMap').appendChild(citiesGroup);
        cities = citiesGroup;
    }
    if (cities.style.display === 'none') {
        // Enable cities
        cities.style.display = '';

        // Make the button grey
        toggleCities.style.filter = 'grayscale(1)';
    } else {
        // Disable cities
        cities.style.display = 'none';

        // Remove popup if there is one
        try {
            document.getElementById('popupgroup').remove();
        } catch {}

        // Make the button normal
        toggleCities.style.filter = '';
    }
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

function calculateOriginalSizeOfMap() {
    let em = parseFloat(getComputedStyle(document.getElementById('midContent')).fontSize);
    let helpMap = document.getElementById('helpMap');
    helpMap.style.transform = 'scale(1)';
    return 31 * em / helpMap.width.baseVal.value;
}

// It takes into account the translation defined in the transform attribute as well, though that method to translate is abandoned
function updateMapPositionData(maplmnt = document.getElementById('helpMap')) {
    mapTranslate = mergeNumberArrays(getTranslateValues(false, maplmnt.style.translate).slice(1), getTranslateValues(true, "", maplmnt.style.transform).slice(1));
    maplmnt.style.transform = `translate(0px, 0px) scale(${maplmnt.style.transform.match(/scale\(([^)]+)\)/)[1]})`;
}

// Changes the zoom of the map by the given ratio and position it to be zoomed into the center of the screen
function changeZoomOfMap(ratio, forceResetingStyles = false) {
    if (ratio !== 1 || forceResetingStyles) {
        let zoomInButton = document.getElementById('button-zoom-in');
        if (mapZoom * ratio * ratio > 6) { // If the map is already zoomed in to the maximum
            zoomInButton.style.opacity = "0.5";
            zoomInButton.firstElementChild.classList.add('inactive-button');
        } else if (zoomInButton.style.opacity === "0.5") {
            zoomInButton.style.opacity = "1";
            zoomInButton.firstElementChild.classList.remove('inactive-button');
        }
        let zoomOutButton = document.getElementById('button-zoom-out');
        if (mapZoom * ratio * ratio < 0.5) { // If the map is already zoomed out to the maximum
            zoomOutButton.style.opacity = "0.5";
            zoomOutButton.firstElementChild.classList.add('inactive-button');
        } else if (zoomOutButton.style.opacity === "0.5") {
            zoomOutButton.style.opacity = "1";
            zoomOutButton.firstElementChild.classList.remove('inactive-button');
        }
    }
    if (Math.abs(mapZoom - 1) < 0.01) {
        mapZoom = 1;
    }
    let map = document.getElementById('helpMap');
    if (mapZoom * ratio <= 6 && mapZoom * ratio >= 0.5) {
        updateMapPositionData(map);
        mapZoom *= ratio;
        map.style.transform = `scale(${calculateOriginalSizeOfMap() * mapZoom})`;
        map.style.translate = `${mapTranslate[0] * ratio}px ${mapTranslate[1] * ratio}px`;
    }
    let resetZoomButton = document.getElementById('button-zoom-reset');
    if (mapZoom === 1 && mapTranslate[0] === 0 && mapTranslate[1] === 0) { // If the map is already in the default position
        resetZoomButton.style.opacity = "0.5";
        resetZoomButton.firstElementChild.classList.add('inactive-button');
    } else if (resetZoomButton.style.opacity === "0.5") {
        resetZoomButton.style.opacity = "1";
        resetZoomButton.firstElementChild.classList.remove('inactive-button');
    }
}