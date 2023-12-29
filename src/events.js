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
                let scale = 31 * em;
                if (scale > window.innerWidth * 0.9) {
                    scale = window.innerWidth * 0.9;
                }
                map.style.transform = `scale(${scale / map.width.baseVal.value})`;
                insertTo.style.height = `${map.getBoundingClientRect().height * 1.1}px`;
            }
        }
    });
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