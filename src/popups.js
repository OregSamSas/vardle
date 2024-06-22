
// **General Popup Windows**

function addForeGroundPage(pageName) {
    removeShowMapButton();
    removeHelpMap(false); // remove help map if present for getting an accurate page height
    let canvas = document.createElement('canvas');
    let newPage = document.getElementById(`tmpl-${pageName}`).content.firstElementChild.cloneNode(true);
    let header = document.getElementById('tmpl-header').content.firstElementChild.cloneNode(true);
    let insertTo = document.getElementById('page');
    let minheight = document.getElementById('mainContent').getBoundingClientRect().height;
    header.id = `${pageName}-header`;
    header.firstElementChild.setAttribute('ln', pageName);
    newPage.insertBefore(header, newPage.firstChild);
    canvas.id = "backdrop";
    canvas.style.width = "100vw";
    canvas.style.minHeight = "100vh";
    canvas.style.height = `${minheight}px`;
    canvas.style.backgroundColor = "var(--back-bg)";
    insertTo.appendChild(canvas);
    insertTo.appendChild(newPage);
    newPage.style.minHeight = `${minheight}px`;
    if(pageName === 'settings') {
        addGeneralSettings(newPage.childNodes[2].firstElementChild);
        addGameSpecificSettings(newPage.childNodes[4].childNodes[3]);
    }
    localisation();
    buttonEventListeners('cancel');
}

function closeUppermostWindow(deleteCanvas) {
    let lastContent = document.querySelector("#page > div:last-child");
    if (lastContent.id !== "mainContent") {
        lastContent.remove();
        if (deleteCanvas) try {document.querySelector("#page > canvas").remove()} catch {};
        getGuesslinesCount(Round);
        updateGuessLines(guesslinesCount);
        updateMainCountyImage(!hideShape, rotateShape && !rotationRemoved, !!finishedRounds[Round]);
        if (guesslinesCount <= Guesses.length && Round===0) {
            console.log("FINISHED ALREADY");
            for (let i = 0; i < Guesses.length - guesslinesCount; i++) {
                Guesses.pop();
            }
            endOfGuessing(false);
        }
    }
    saveSettings();
    if (!rotateShape) {
        rotationRemoved = false;
    }
    if (!hideShape) {
        showImageButtonRemoved = false;
    }
}

// **About Page**

function displayAbout() {
    addForeGroundPage('about');
    if (imageOrigin !==  "img/Kingdom_of_Hungary_counties_(Plain).svg" && imageOrigin !== '') {
        mainAboutContent = document.querySelectorAll('#aboutPage > div');
        for (let divToDelete of mainAboutContent) {
            divToDelete.remove();
        }
        let newDiv = document.createElement('div');
        newDiv.className = "ml-3 p-1";
        newDiv.style.paddingTop = "4em";
        newDiv.setAttribute('ln', "custom");
        let page = document.getElementById('aboutPage');
        let newA = document.createElement('a');
        newA.setAttribute('ln', 'goback');
        newA.setAttribute('href', window.location.toString().split('?')[0]);
        newA.style = "flex-grow:1";
        page.firstElementChild.after(newA);
        page.firstElementChild.after(newDiv);
        newA.className = 'ml-3 p-1 text-green-600';
        localisation();
    }
}

// **Statistics**

function reworkStatsPage() {
    // acquire the stats from the cookies, then process them
    let guessDistribution = new Array();
    let areThereStats = false;
    let lastGuessNum = numberOfTries;
    let allGuessNum = 0;
    let allGamesNum = 0;
    let maxGuessValue = 0;
    for (let i = 0; i < 10; i++) {
        if (loadFromCookie(i + 1)) {
            guessDistribution.push(loadFromCookie(i + 1));
            areThereStats = true;
            if (i + 1 > lastGuessNum) {
                lastGuessNum = i + 1;
            }
            if (guessDistribution[i] > maxGuessValue) {
                maxGuessValue = guessDistribution[i];
            }
            allGamesNum += guessDistribution[i];
            allGuessNum += guessDistribution[i] * (i + 1);
        } else {
            guessDistribution.push(0);
        }
        if (loadFromCookie(`lost-${i + 1}`)) {
            allGuessNum += loadFromCookie(`lost-${i + 1}`) * (i + 1);
        }
    }

    let lostGames = loadFromCookie(0);
    allGamesNum += lostGames;

    // Display overall stats
    document.querySelector('[ln="played"] > span').innerHTML = allGamesNum;
    document.querySelector('[ln="won"] > span').innerHTML = allGamesNum - lostGames;
    document.querySelector('[ln="rating"] > span').innerHTML = `${Math.round((allGamesNum - lostGames) / allGamesNum * 100)}%`;
    document.querySelector('[ln="totalguess"] > span').innerHTML = allGuessNum;

    // Display guess distributions
    let guessDistElement = document.getElementById('guess-dist');
    if (areThereStats) {
        let noStats = document.getElementById('nostats-cont');
        if (noStats != null) noStats.remove();

        // Fill up the guess distribution table
        let guessDistTable = findFirstChildOfType(guessDistElement, 'ul');
        let newGuessDistRow;
        let guessDistNumber;
        let guessDistBar;
        let guessDistValue;
        for (let i = 0; i < lastGuessNum; i++) {
            newGuessDistRow = document.createElement('li');
            newGuessDistRow.className = "flex my-2";

            // Creates a number element that represents the number of guesses.
            guessDistNumber = document.createElement('div');
            guessDistNumber.className = "mr-1 font-bold";
            guessDistNumber.innerHTML = i + 1;
            newGuessDistRow.appendChild(guessDistNumber);

            // Creates a bar element that represents the relative distribution of guesses.
            guessDistBar = document.createElement('div');
            guessDistBar.className = "bg-gray-200";
            guessDistBar.style = `flex: 0 1 ${guessDistribution[i] * 100 / maxGuessValue}%;`;
            newGuessDistRow.appendChild(guessDistBar);

            // Creates a text element that shows the absolute distribution of guesses as a number.
            guessDistValue = document.createElement('div');
            guessDistValue.innerHTML = guessDistribution[i];
            guessDistValue.className = "bg-gray-200 px-1";
            newGuessDistRow.appendChild(guessDistValue);

            guessDistTable.appendChild(newGuessDistRow);
        }
    } else {
        guessDistElement.remove();
        document.getElementById('overall-stats').remove();
        document.querySelector('#statsPage > footer').remove();
    }
}

function deleteStats() {
    for (let i = -1; i < 10; i++) {
        deleteCookie(i + 1);
        if (i > -1) {
            deleteCookie(`lost-${i + 1}`);
        }
    }
}

function displayStats() {
    addForeGroundPage('stats');
    reworkStatsPage();
}

// **Settings**

function saveSettings() {
    saveToLoc("lang", Language);
    saveToLoc("theme", mainTheme);
    saveToLoc("tries", numberOfTries);
    saveToLoc("unit", distanceUnit);
    saveToLoc("map", mapTheme);
    saveToLoc("hide", hideShape);
    saveToLoc("rotate", rotateShape);
    saveToLoc("size", sizePercent);
    saveToLoc("usearabicnums", arabicInSuggestions);
    saveToLoc("borders", computingMethod);
}

function displaySettings() {
    addForeGroundPage('settings');
}

function addGameSpecificSettings(parent) {
    let gameSpecific = data.settings.gameplay;
    for (let setting of gameSpecific) {
        addSetting(parent, ((setting.type === "opt") ? "select" : setting.type), setting.name, ((setting.type == "number") ? setting.range : setting.options))
    }
}

function addGeneralSettings(toParent) {
    let generalSettings = getIndependentValue(data.settings.general);
    if (imageOrigin.includes("Budapest")) {
        generalSettings.push({ "name": "arabicNums", "type": "checkbox"})
    }
    for (let setting of generalSettings) {
        addSetting(toParent, ((setting.type === "opt") ? "select" : setting.type), setting.name, setting.options);
    }
}

function addSetting(parent, type = "select", id, options) {
    let setting = document.getElementById('tmpl-setting-' + type).content.firstElementChild.cloneNode(true);
    parent.appendChild(setting);
    let selectArea = setting.firstElementChild;
    let label = setting.childNodes[3];
    label.setAttribute('for', label.getAttribute('for') + id);
    label.setAttribute('ln', label.getAttribute('for'));
    selectArea.id += id;
    if (type === "select") {
        let optionElement;
        for (let option of options) {
            optionElement = selectArea.firstElementChild;
            optionElement.setAttribute('ln', option);
            optionElement.setAttribute('value', option);
            if (options.indexOf(option) < options.length - 1) {
                optionElement.after(optionElement.cloneNode());
            }
        }
        for (let item of selectArea.options) {
            if (id === "distanceUnit" && item.value === distanceUnit) {
                item.selected = true;
            }
            if (id === "languageSelection" && item.value === Language) {
                item.selected = true;
            }
            if (id === "themeSelection" && item.value === mainTheme) {
                item.selected = true;
            }
            if (id === "mapColouring" && item.value === mapTheme) {
                item.selected = true;
            }
            if (id === "distCalc" && item.value === computingMethod) {
                item.selected = true;
            }
        }
    } else {
        if (id === "numberOfTries") {
            selectArea.value = numberOfTries;
        }
        if (id === "hideImage") {
            selectArea.checked = hideShape;
        }
        if (id === "rotateImage") {
            selectArea.checked = rotateShape;
        }
        if (id === "sizePercent") {
            selectArea.checked = sizePercent;
        }
        if (id === "arabicNums") {
            selectArea.checked = arabicInSuggestions;
        }
    }
    handleSetting(selectArea, id, type, options);
}

function handleSetting(settingElement, variable, type, additional) {
    settingElement.addEventListener('change', (e) => {
        let optionList;
        let selectedVal;
        if (type === "select") {
            optionList = settingElement.options;
            selectedVal = optionList[optionList.selectedIndex].value;
        } else if (type === "checkbox") {
            selectedVal = settingElement.checked;
        } else {
            if (type === "number") {
                settingElement.value = forceNumIntoRange(settingElement.value, additional[0], additional[1]);
            }
            selectedVal = settingElement.value;
        }
        switch (variable) {
            case "languageSelection":
                Language = selectedVal;
                localisation();
                break;
            case "distanceUnit":
                distanceUnit = selectedVal;
                break;
            case "themeSelection":
                mainTheme = selectedVal;
                setThemeTo(mainTheme);
                break;
            case "mapColouring":
                mapTheme = selectedVal;
                break;
            case "numberOfTries":
                numberOfTries = selectedVal;
                break;
            case "hideImage":
                hideShape = selectedVal;
                break;
            case "rotateImage":
                rotateShape = selectedVal;
                break;
            case "sizePercent":
                sizePercent = selectedVal;
                break;
            case "arabicNums":
                arabicInSuggestions = selectedVal;
                break;
            case "distCalc":
                computingMethod = selectedVal;
                break;
        }
    });
}