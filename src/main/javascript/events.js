// **Events, buttons and inputs**

// Managing main events, like pressing the "Esc" key or changing the viewport
function docEvents() {
    window.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        switch (e.key) {
            case "Escape":
                closeUppermostWindow(true);
        }
    });
    window.addEventListener("keyup", (keyupE) => {
        if (finishedRounds[Round] === "won" || finishedRounds[Round] === "lost") {
            handleKeysForEvent(keyupE, "green arrows");
        }
    });
    window.addEventListener('resize', (e) => {
        let canvas = document.querySelector("#page > canvas");
        let minheight = document.getElementById('mainContent').getBoundingClientRect().height;
        let newPage = document.getElementById('newPage');
        try {
            let height = `${minheight}px`;
            canvas.style.height = height;
            newPage.style.minHeight = height;
        } catch {}
        let insertTo = document.getElementById('mapArea');
        if (insertTo != null) {
            let map = insertTo.firstElementChild;
            if (map != null) {
                let em = parseFloat(getComputedStyle(document.getElementById('midContent')).fontSize);
                let widthToFitInto = 31 * em;
                if (widthToFitInto > window.innerWidth * 0.9) {
                    widthToFitInto = window.innerWidth * 0.9;
                }
                let scale = widthToFitInto / map.width.baseVal.value;
                map.style.transform = `scale(${scale * mapZoom})`;
                insertTo.style.height = `${(map.height.baseVal.value * 1.1) * scale}px`;

                // Move the zoom controls to the bottom right corner
                let numberOfotherButtons = 2;
                insertTo.children[numberOfotherButtons + 1].style.transform = `translate(${widthToFitInto * 0.96}px, ${map.height.baseVal.value * 0.96 * scale - 28}px)`;
                insertTo.children[numberOfotherButtons + 2].style.transform = `translate(${widthToFitInto * 0.96}px, ${map.height.baseVal.value * 0.96 * scale}px)`;
                insertTo.children[numberOfotherButtons + 3].style.transform = `translate(${widthToFitInto * 0.96}px, ${map.height.baseVal.value * 0.96 * scale - 2*28}px)`;
            }
        }
    });
}

// the addCtrlZoomEventForMap function adds event listeners to the map area, by wich the user can zoom in and out by scrolling while holding the "Ctrl" key
function addCtrlZoomEventForMap() {
    let mapArea = document.getElementById('mapArea');
    let existingListener = mapArea.onwheel;
    if (existingListener && existingListener.toString() === mapAreaEventListener.toString()) {
        console.log("The same event listener is already applied to the element.");
    } else {
        mapArea.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                // Remove warning text if it's there
                if (mapArea.children[mapArea.children.length - 1].id === 'warning-text') {
                    mapArea.children[mapArea.children.length - 1].remove();
                }

                // Prevent zooming the whole page
                e.preventDefault();

                // Zoom in or out based on the direction of the scroll
                if (e.deltaY < 0) {
                    changeZoomOfMap(1.25);
                } else {
                    changeZoomOfMap(0.8);
                }
            } else {
                // If there's no warning text on the map, add one
                if (mapArea.children[mapArea.children.length - 1].id !== 'warning-text') {
                    const warningDiv = document.createElement('div');
                    warningDiv.id = "warning-text"
                    warningDiv.className = 'transition-all';
                    warningDiv.style.position = 'absolute';
                    warningDiv.style.left = '2px';
                    warningDiv.style.width = '99.4%';
                    warningDiv.style.height = `${mapArea.offsetHeight - 4}px`;
                    warningDiv.style.backgroundColor = `#${(mainTheme === 'light') ? 'ffffff': '000000'}85`;
                    warningDiv.style.opacity = '1';
                    warningDiv.style.display = 'flex';
                    warningDiv.style.justifyContent = 'center';
                    warningDiv.style.alignItems = 'center';
                    warningDiv.style.fontSize = '20px';
                    warningDiv.setAttribute('ln', 'scroll');

                    mapArea.appendChild(warningDiv);

                    // Remove the warning after 2 seconds
                    removeWarningDivSmoothly(warningDiv);

                    localisation();
                } else {
                    // Show warning text again
                    mapArea.children[mapArea.children.length - 1].style.opacity = '1';

                    // Clear the timeouts
                    window.clearTimeout(timeoutTransition);
                    window.clearTimeout(timeoutDeletion);

                    // Add new timeouts
                    removeWarningDivSmoothly(mapArea.children[mapArea.children.length - 1]);
                }
            }
        });
    }
}

var timeoutTransition = null;
var timeoutDeletion = null;

// Remove a 'transition-all' div smoothly
function removeWarningDivSmoothly(div) {
    timeoutTransition = setTimeout(() => {
        div.style.opacity = '0';

        // Remove the warning div after the transition ends
        timeoutDeletion = setTimeout(() => {
            div.remove();
        }, 1000);
    }, 2000);
}

// Bundle event listeners to the input field
function inputEventListeners() {
    let allInputs = document.querySelectorAll('input[aria-autocomplete="list"]');
    for (let input of allInputs) {
        try{
            if (input.getAttribute('aria-autocomplete')) {
                input.addEventListener('focusin', (e) => {
                    insertAutoList(input);
                });
                input.addEventListener('focusout', (e) => {
                    removeAllCountyElement(input);
                });
                input.addEventListener('input', (e) => {
                    refreshCountiesElement(input);
                });
                input.addEventListener('keydown', (e) => {
                    handleKeysForEvent(e, input);
                });
            }
        } catch {}
    }
}

function handleKeysForEvent(e, input) {
    if (e.isComposing || e.keyCode === 229) {
        return;
    }
    if (input !== "green arrows") {
        switch(e.key) {
            case "Escape":
                input.blur();
                break;
            case "Enter":
                let selected = null;
                try { selected = findSelectedCountyItem(input).firstChild.innerHTML; } catch{}
                if (selected != null) {
                    listItemClicked(input.id, selected);
                    removeAllCountyElement(input);
                } else {
                    handleGuess();
                }
                break;
        }
    }
    if (e.keyCode === 38 || e.keyCode === 40) { // Up-down arrow navigation in list
        e.preventDefault();
        let oldSelected = replaceSpecialCharacters(findSelectedCountyItem(input).firstChild.innerHTML);
        let change;
        if (e.keyCode === 38) {
            change = -1;
        } else {
            change = 1;
        }
        let oldpos = SuggestionList.indexOf(oldSelected)
        let newSelected;
        if (oldpos === 0 && change === -1) {
            newSelected = SuggestionList[SuggestionList.length-1];
        } else if (oldpos === SuggestionList.length-1 && change === 1) {
            newSelected = SuggestionList[0];
        } else {
            newSelected = SuggestionList[oldpos+change];
        }
        let neededElement = selectCountyItem(input, newSelected);
        neededElement.scrollIntoView();
        listItemHovered(neededElement, input.getAttribute('aria-controls'));
    }
    if ((e.keyCode === 37 || e.keyCode === 39) && input == "green arrows") {
        if (document.activeElement == document.body) {
            switch (e.keyCode) {
                case 37:
                    if (Round > 0) {
                        updateRounds(Round, Round - 1)
                    }
                    break;
                case 39:
                    if (Round < numberOfRounds -1) {
                        updateRounds(Round, Round + 1)
                    }
                    break;
            }
        }
    }
}

// Bundles events to several buttons
function buttonEventListeners(button = "") {
    // Show Map button after finishing guessing
    if (button === "show-map") {
        let showMap = document.querySelector('a#showMap');
        if (showMap != null) {
            showMap.addEventListener('click', (e) => {
                placeMapOnpage(showMap);
            });
        }
    }

    // Palette icon in the right corner of the map
    if (button === "change-colour") {
        let paletteIcon = document.querySelector('button#toggleColoureButton');
        if (paletteIcon != null) {
            paletteIcon.addEventListener('click', (e) => {
                swapMapColour(paletteIcon.firstElementChild);
            });
        }
    }

    // Speech bubble icon in the right corner of the map
    if (button === "change-labels-visibility") {
        let speechBubbleIcon = document.querySelector('button#toggleLabelsButton');
        if (speechBubbleIcon != null) {
            speechBubbleIcon.addEventListener('click', (e) => {
                toggleMapTexts();
            });
        }
    }

    // Zoom in and out buttons
    if (button.includes("button-zoom")) {
        let zoomButton = document.getElementById(button);
        if (zoomButton != null) {
            zoomButton.addEventListener('click', (e) => {
                if (button.includes('reset')) {
                    resetMapPosition();
                } else {
                    changeZoomOfMap((button.includes('in')) ? 1.25 : 0.8);
                }
            });
        }
    }

    // Settings (cog) icon
    if (button === "settings-button") {
        let cogIcon = document.getElementById(button);
        if (cogIcon != null) {
            cogIcon.addEventListener('click', (e) => {
                displaySettings();
            });
        }
    }

    // About (question mark) icon
    if (button === "about-button") {
        let about = document.getElementById(button);
        if (about != null) {
            about.addEventListener('click', (e) => {
                displayAbout();
            });
        }
    }

    // Statistics (chart) icon
    if (button === "stats-button") {
        let stats = document.getElementById(button);
        if (stats != null) {
            stats.addEventListener('click', (e) => {
                displayStats();
            });
        }
    }

    // Cancel button
    if (button === "cancel") {
        let xmark = document.getElementById('cancel');
        if (xmark != null) {
            xmark.addEventListener('click', (e) => {
                closeUppermostWindow(true);
            });
        }
    }

    // Next/Previous round buttons
    if (button === "rounds") {
        let arrows = document.querySelectorAll('#wonImg > span > svg');
        if (arrows[0] != null && Round !== 0) {
            arrows[0].addEventListener('click', (e) => {
                updateRounds(Round, Round - 1);
            });
        }
        if (arrows[1] != null && Round !== numberOfRounds - 1) {
            arrows[1].addEventListener('click', (e) => {
                updateRounds(Round, Round + 1);
            });
        }
    }
}