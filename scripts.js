// import data from './data.json';
let data = {"directions": "0", "wikilinks": "1"};
dataXHR = new XMLHttpRequest();
dataXHR.open("GET","data.json",false);
// Following line is just to be on the safe side
dataXHR.overrideMimeType("application/json");
dataXHR.onload = (e) => {
    data = JSON.parse(dataXHR.response);
};
dataXHR.send("");

// Global variable declaration
const CountyList = [];
const Guesses = [];
const Directions = data.directions;
const wikiLinks = data.wikilinks; // From https://en.wikipedia.org/wiki/Lands_of_the_Crown_of_Saint_Stephen#:~:text=Counties%20of%20the%20Lands%20of%20the%20Crown%20of%20Saint%20Stephen
const translations = data.l10n;

let showImageButtonRemoved = false;
let rotationRemoved = false;
let Scale = 1227.3;
let Rotation = 1 - Math.random()*2;
let sizePercent = false;
let numberOfTries = 6;
let hideShape = false;
let rotateShape = false;
let mainTheme;
let mapTheme = "mono";
let distanceUnit = "mixed";
let Language = "hu";
let Furthest = {};
let metaData = {"x": 0, "y": 0, "width": 0, "height": 0, "midx": 0, "midy": 0};
let otherMetaData = metaData;
let SuggestionList = [];
let Won = false;
let Solution;
let imageOrigin = "Kingdom_of_Hungary_counties_(Plain).svg";

// Theme Metadata
const lightThemeArray = data.themes[0];
const darkThemeArray = data.themes[1];

// Get URL params
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get('map') === 'bundesländer') {
    imageOrigin = "Karte_Deutsche_Bundesländer_(Plain).svg";
} else if(urlParams.get('map') === 'modern') {
    imageOrigin = "Hungary_counties_(Plain).svg";
} else if(urlParams.get('map') === 'romania') {
    imageOrigin = "Romania_Counties_(Plain).svg";
} else if (urlParams.has('map')) {
    imageOrigin = urlParams.get('map');
}

// FUNCTION DEFINITIONS

function loadFromLocal() {
    if (load("lang") != null) {
        if (load("lang")) Language = load("lang");
        if (load("theme")) mainTheme = load("theme");
        if (load("tries")) numberOfTries = parseInt(load("tries"));
        if (load("unit")) distanceUnit = load("unit");
        if (load("map")) mapTheme = load("map");
        if (load("hide")) hideShape = (load("hide") === 'true');
        if (load("rotate")) rotateShape = (load("rotate") === 'true');
        if (load("size")) sizePercent = (load("size") === 'true');
    }
}

function load(item) {
    return localStorage.getItem(item);
}

// Sets the theme in accordance with browser's preferences
function initialThemeSetup() {
    let themeEqualDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (themeEqualDark) {
        mainTheme = "dark";
    } else {
        mainTheme = "light";
    }
}

// Sets the language in accordance with browser's preferences
function languageSetup() {
    if ((navigator.language || navigator.userLanguage) === "hu") {
        Language = "hu";
    } else {
        Language = "en";
    }
}

function setThemeTo(theme) {
    if (theme === "dark") {
        for(let varname in darkThemeArray) { // Cycle through the metadata array (object)
            document.documentElement.style.setProperty(`--${varname}`, darkThemeArray[varname]); // replaces the :root variables (--${their names} -> property: ${their vales} -> value) 
        }
    }
    if (theme === "light") {
        for(let varname in lightThemeArray) { // Cycle through the metadata array (object)
            document.documentElement.style.setProperty(`--${varname}`, lightThemeArray[varname]); // replaces the :root variables (--${their names} -> property: ${their vales} -> value) 
        }
    }
}

function titleToId(imageId) {
    let paths = document.querySelectorAll(`#${imageId} > svg > g > path`);
    let newId;
    for (let path of paths) {
        if (path.getAttribute('name') != undefined) {
            newId = path.getAttribute('name');
            path.setAttribute('name', '');
        } else if (path.getAttribute('title') != undefined) {
            newId = path.getAttribute('title');
            path.setAttribute('title', '');
        } else {
            newId = path.id;
        }
        path.id = newId
    }
}

function checkTexts(imageId) {
    let textgroup = document.querySelector(`#${imageId} > svg > g#textgroup`);
    if (textgroup === null || textgroup === undefined) {
        let newtextgroup = document.createElement('g');
        newtextgroup.id = 'textgroup';
    }
}

function pathUnderGroup(imageId) {
    let paths = document.querySelector(`#${imageId} > svg > g > path`);
    if (paths === null || paths === undefined) {
        paths = document.querySelectorAll(`#${imageId} > svg > path`);
        let newgroup = document.createElement('g');
        let newpath;
        for (let thispath of paths) {
            newpath = thispath.cloneNode();
            newgroup.appendChild(newpath);
            thispath.remove();
        }
        document.querySelector(`#${imageId} > svg`).appendChild(newgroup);
    }
}

// function for insert a county to guess
function getCountyImage(id, num) {
    let ratio;
    let placeToInsert = document.getElementById(id);
    let allCounties = new XMLHttpRequest();
    allCounties.open("GET", imageOrigin, false);
    // Following line is just to be on the safe side
    allCounties.overrideMimeType("image/svg+xml");
    allCounties.onload = (e) => {
        try {
            placeToInsert.appendChild(allCounties.responseXML.documentElement);
        } catch {
            allCounties.open("GET", "Kingdom_of_Hungary_counties_(Plain).svg", false);
            allCounties.onload = (e) => {
                placeToInsert.appendChild(allCounties.responseXML.documentElement);
            }
            allCounties.send("");
        }
    };
    allCounties.send("");
    pathUnderGroup(id);
    titleToId(id);
    checkTexts(id);
    if(num != undefined) {
        let allPaths = document.querySelectorAll('#' + id + ' > svg > g > path');
        for (thisPath of allPaths) {
            if(thisPath.id != CountyList[num]) {
                try {thisPath.remove();} catch {};
            } else {
                Solution = thisPath.id;
                thisPath.setAttribute("d", absToRel(thisPath.getAttribute("d")));
                metaData = trackPath(thisPath.getAttribute("d"));
                if(metaData.height === 0) {
                    metaData.height = 120;
                    metaData.width = 120;
                }
                let biggerSize = Math.sqrt(metaData.width ** 2 + metaData.height ** 2);
                thisPath.setAttribute("d", movePath(thisPath.getAttribute("d"), 0-metaData.x, 0-metaData.y));
                ratio = (Math.floor((180 / biggerSize) * 100000) / 100000).toString();
                thisPath.style.transform = `scale(${ratio})`;
            }
        }

        // Resize SVG
        svgImage = document.querySelector('#' + id + ' > svg');
        svgImage.setAttribute("width", metaData.width * parseFloat(ratio));
        svgImage.setAttribute("height", metaData.height * parseFloat(ratio));

        // Rotate image if desired
        if (rotateShape) {
            rotateSVG(svgImage, Rotation, placeToInsert);
        }

        // Remove text
        document.querySelector(`#${id} > svg > #textgroup`).remove();
    }
}

function rotateSVG(svg, rotation, imagePlace) {
    svg.style.transform = `rotate(${rotation}turn)`;
    svg.style["transition-duration"] = ".7s";
    svg.style['transition-property'] = "all";
    svg.style['transition-timing-function'] = "cubic-bezier(.4,0,.2,1)";

    // Place button for cancelling it
    let cancelButton = document.getElementById('tmpl-cancel-rotation').content.firstElementChild.cloneNode(true);
    imagePlace.after(cancelButton);
    cancelButton.addEventListener('click', (e) => {
        removeRotation();
        rotationRemoved = true;
    });

}

// Cancel Rotation for county image
function removeRotation(notForEver) {
    let rotationButton = document.getElementById('cancel-rot');
    if (notForEver) {
        if (rotationButton != null && rotationButton != undefined) rotationButton.style.display = "none";
    } else {
        if (rotationButton != null && rotationButton != undefined) rotationButton.remove();
        document.querySelector('#imageToGuess > svg').style.transform = "";
    }
}

// Check if a character is a digit
function isCharNumber(c) {
    return typeof c === 'string' && c.length == 1 && c >= '0' && c <= '9';
}

// Function for making a string to TitleCase (all initial letters are capitalised)
// Modified version of https://www.freecodecamp.org/news/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27/
function titleCase(str) {
    str = str.toLowerCase();
    str = str.split(' ');
    for (let i = 0; i < str.length; i++) {
        str[i] = str[i].split('-');
        for(let j = 0; j < str[i].length; j++) {
            if (str[i][j].toLowerCase() === "és") { // Do not capitalise the conjunctive word "és" (meaning and)
                str[i][j] = str[i][j].toLowerCase();
            } else {
                str[i][j] = str[i][j].charAt(0).toUpperCase() + str[i][j].slice(1);
            }
        }
        str[i] = str[i].join('-');
    }
    str = str.join(' ');
    return str;
}

// Move path (having only relatively set curve commands)
function movePath(path, dx, dy, newx, newy) {
    let char = 2;
    let origCoordinates = ['', ''];
    for (let coo=0; coo<2; coo++) {
        while (path[char] !== " " && path[char] !== ",") {
            origCoordinates[coo] += path[char];
            char ++;
        }
        char ++;
    }
    if (newx == undefined || newy == undefined) {
        path = "M " + (parseFloat(origCoordinates[0]) + dx).toString() + ',' + (parseFloat(origCoordinates[1]) + dy).toString() + ' ' + path.slice(char, path.length); // Relative moving (move it by a vector (dx, dy))
    } else {
        path = "M " + (newx).toString() + ',' + (newy).toString() + ' ' + path.slice(char, path.length); // Move to an absolute position
    }
    return path;
}

// Function to replace absolute bézier curve commands with relative
function absToRel(path) {
    let char = 0;
    let command = "";
    let pathCommands = [];
    let pathCoordinates = [];
    let coordinates = Array(8).fill(''); //x0:last x, y0:last y, x1, y1, x2, y2, x3, y3
    while (char < path.length) {
        command = path[char];
        if ("chtqlmvz".includes(command.toLocaleLowerCase())) {
            char += 2;
        } else {
            command = 'l';
        }
        if (command.toLocaleLowerCase() === 'z') {
            pathCoordinates.push(['']);
        } else {
            coordinates[0] = coordinates[6];
            coordinates[1] = coordinates[7];
            let originalx;
            let originaly;
            let startPos = (('mhql'.includes(command.toLocaleLowerCase())) ? 6 : ((command.toLocaleLowerCase() === 'v') ? 7 : 2));
            let coordinatesNum = ((command.toLocaleLowerCase() === 'h') ? 7 : 8);
            for (let coo = startPos; coo < coordinatesNum; coo ++) {
                coordinates[coo] = '';
                while (path[char] !== " " && path[char] !== "," && char < path.length) {
                    coordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            if (command.toLocaleLowerCase() === 'h') {
                if (command === 'H') {
                    coordinates[7] = coordinates[1];
                } else {
                    coordinates[7] = '0';
                }
            }
            if (command.toLocaleLowerCase() === 'v') {
                if (command === 'V') {
                    coordinates[6] = coordinates[0];
                } else {
                    coordinates[0] = '0';
                }
            }
            originalx = coordinates[6];
            originaly = coordinates[7];
            if(command === 'C' || command === 'L' || command === 'H' || command === 'V') {
                for(let i = startPos; i < coordinatesNum; i++) {
                    coordinates[i] = (Math.round((parseFloat(coordinates[i]) - parseFloat(coordinates[i % 2])) * 1000) / 1000).toString();
                }
            }
            pathCoordinates.push(coordinates.slice(startPos, coordinatesNum));
            if (command === command.toLocaleLowerCase()) {
                coordinates[6] = (parseFloat(coordinates[0]) + originalx).toString();
                coordinates[7] = (parseFloat(coordinates[1]) + originaly).toString();
            } else {
                coordinates[6] = originalx;
                coordinates[7] = originaly;
            }
        }
        pathCommands.push((command === 'M') ? 'M' : command.toLocaleLowerCase());
    }
    let newpath = '';
    let i = 0;
    while (i < pathCoordinates.length) {
        command = pathCommands[i];
        if (command === 'z' && i === pathCoordinates.length - 1) {
            newpath += 'z';
        } else {
            newpath += command + ' ';
            for (let j = 0; j < pathCoordinates[i].length / 2; j++) {
                if (command === 'z') {
                    break;
                } else if (command === 'h' || command === 'v') {
                    newpath += pathCoordinates[i][j*2] + ' ';
                } else {
                    newpath += pathCoordinates[i][j*2] + ',' + pathCoordinates[i][j*2+1] + ' ';
                }
            }
        }
        i++;
    }
    return newpath;
}

// Function to follow through a path and collect its data
function trackPath(path) {
    let minx, miny, maxx, maxy, x, y, x0, y0, x1, y1, x2, y2, x3, y3, i=0, char=0, t = 0;
    let command = "";
    let origCoordinates = Array(8).fill('');
    while (char < path.length) {
        command = path[char];
        char += 2;
        if (command === 'z' && path[char] === 'm') {
            command = 'l';
            char += 2;
        }
        if (command === 'M' || command === 'm') {
            x0 = 0;
            y0 = 0;
            if (command === 'm') {
                x0 = origCoordinates[0];
                y0 = origCoordinates[1];
            }
            for (let coo = 0; coo < 2; coo++) {
                while (path[char] !== " " && path[char] !== ",") {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            origCoordinates[0] = (x0 + parseFloat(origCoordinates[0])).toString();
            origCoordinates[1] = (y0 + parseFloat(origCoordinates[1])).toString();
        }
        if ("cqlvh".includes(command)) {
            origCoordinates[2] = '0';
            origCoordinates[3] = '0';
            let type = ((command === 'c') ? "cubic" : ((command === 'q') ? "quadratic" : "linear"));
            let startPos = ((command === 'v') ? 3 : 2);
            let endPos = ((command === 'c') ? 8 : ((command === 'q') ? 6 : ((command === 'h') ? 3 : 4)));
            for (let coo = startPos; coo < endPos; coo++) {
                origCoordinates[coo] = '';
                while (path[char] !== " " && path[char] !== "," && char < path.length) {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            origCoordinates[6] = origCoordinates[endPos - ((endPos === 3) ? 1 : 2)];
            origCoordinates[7] = origCoordinates[endPos - ((endPos === 3) ? 0 : 1)];
            // Tracking curve
            x0 = parseFloat(origCoordinates[0]);
            y0 = parseFloat(origCoordinates[1]);
            x1 = x0 + parseFloat(origCoordinates[2]);
            y1 = y0 + parseFloat(origCoordinates[3]);
            if (type !== "linear") {
                x2 = x0 + parseFloat(origCoordinates[4]);
                y2 = y0 + parseFloat(origCoordinates[5]);
                if (type !== "quadratic") {
                    x3 = x0 + parseFloat(origCoordinates[6]);
                    y3 = y0 + parseFloat(origCoordinates[7]);
                }
            }
            t = 0;
            while (t < 1) {
                // Formula from https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
                if (type === "linear") {
                    x = (1-t)*x0 + t*x1;
                    y = (1-t)*y0 + t*y1;
                } else if (type === "quadratic") {
                    x = ((1-t)**2)*x0 + 2*(1-t)*t*x1 + (t**2)*x2;
                    x = ((1-t)**2)*y0 + 2*(1-t)*t*y1 + (t**2)*y2;
                } else {
                    x = ((1-t)**3)*x0 + 3*((1-t)**2)*t*x1 + 3*(1-t)*(t**2)*x2 + (t**3)*x3;
                    y = ((1-t)**3)*y0 + 3*((1-t)**2)*t*y1 + 3*(1-t)*(t**2)*y2 + (t**3)*y3;
                }
                if(x < minx || i === 1) {
                    minx = x;
                }
                if(x > maxx || i === 1) {
                    maxx = x;
                }
                if(y < miny || i === 1) {
                    miny = y;
                }
                if(y > maxy || i === 1) {
                    maxy = y;
                }
                t += 0.1;
            }
            origCoordinates[0] = (x0 + parseFloat(origCoordinates[6])).toString();
            origCoordinates[1] = (y0 + parseFloat(origCoordinates[7])).toString();
        }
        i++;
    }
    return {"x": minx*1, "y": miny*1, "width": (maxx - minx), "height": (maxy - miny), "midx": (minx + maxx) / 2, "midy": (miny + maxy) / 2}; // x position,  y position,length, height, middle point coordinates
}

function getRandomCounty() {
    let randomCounty = randomElement(); // Balaton cannot be the solution, but can be guessed
    while (CountyList[randomCounty] === "Balaton") {
        randomCounty = randomElement();
    }
    return randomCounty;
}

function randomElement() {
    return Math.floor(Math.random()*(CountyList.length-1));
}

function placeGuessLines(num) {
    let insertTo = document.getElementById('guesses');
    for (let i = 0; i < num; i++) {
        insertTo.appendChild(document.getElementById('tmpl-guessline').content.firstElementChild.cloneNode(true));
    }

}

function updateGuessLines(num) {
    let insertTo = document.getElementById('guesses');
    insertTo.innerHTML = "";
    placeGuessLines(num);
    for (let guessNum in Guesses) {
        if (guessNum < num) {
            guessAnalisys(Guesses[guessNum], guessNum);
        }
    }
    window.dispatchEvent(new Event('resize'));
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
    if (e.keyCode === 38 || e.keyCode === 40) { // Up-down arrow navigation in list
        e.preventDefault();
        let oldSelected = findSelectedCountyItem(input).firstChild.innerHTML;
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
}

// Creates he Suggestion List
function insertAutoList(inputPlace) {
    SuggestionList = [];
    let completeList = document.getElementById(inputPlace.getAttribute('aria-controls'));
    let countiesElement = createCountiesElement();
    completeList.appendChild(countiesElement);
    let inputValue = inputPlace.value;
    for (let county=0; county<CountyListOrdered.length; county++) {
        if (CountyListOrdered[county].toUpperCase().includes(inputValue.toUpperCase())) { // Fullfills search keyword (important to have the same letter case)
            SuggestionList.push(CountyListOrdered[county]);
            let countyElement = createCountyElement(countiesElement.childElementCount, inputPlace.id, CountyListOrdered[county], completeList.id);
            countiesElement.appendChild(countyElement);
        }
    }
}

// Creates the Suggestions list element for Counties
function createCountiesElement() {
    return document.getElementById('tmpl-county-suggestions').content.firstElementChild.cloneNode(true);
}

// Creates an item of the Counties Suggestion list
function createCountyElement(elementIndex, MyInputId, CountyName, countySuggContId) {
    let element = document.getElementById('tmpl-county-suggestion-piece').content.firstElementChild.cloneNode(true);
    element.setAttribute('aria-selected', elementIndex === 0);
    if (elementIndex === 0) {
        element.className  = 'font-bold';
    }
    element.id = `county--${elementIndex}`;
    element.setAttribute('data-suggestion-idx', elementIndex);

    element.addEventListener('mouseover', (e) => {
        listItemHovered(element, countySuggContId);
    });
    element.addEventListener('mousedown', (e) => {
        listItemClicked(MyInputId, CountyName);
    });

    let divText = document.createElement('div');
    divText.className = 'm-0.5 bg-white p-1 cursor-pointer uppercase';
    divText.innerHTML = CountyName;
    element.appendChild(divText);
    return element;
}

function listItemHovered(countyItem, countyItemsId) {
    let allCountyItems = document.querySelectorAll('#' + countyItemsId + ' > ul > li');
    // Replace others that shouldn't be hovered anymore
    for (let hoverToDelete of allCountyItems) {
        try {
            hoverToDelete.setAttribute('aria-selected', false);
            hoverToDelete.className = '';
        } catch {}
    }
    if (countyItem !== "none") {
        countyItem.setAttribute('aria-selected', true);
        countyItem.className = 'font-bold';
    }
}

// Triggers when a list item from the Counties Suggestion List becomes selected
function listItemClicked(inputid, newValue) {
    let oldInput = document.getElementById(inputid)
    let newInput = document.createElement('input');
    newInput.id = inputid;
    newInput.type = oldInput.type;
    newInput.className = oldInput.className;
    newInput.setAttribute('autocomplete', oldInput.getAttribute('autocomplete'));
    newInput.setAttribute('aria-autocomplete', oldInput.getAttribute('aria-autocomplete'));
    newInput.setAttribute('aria-controls', oldInput.getAttribute('aria-controls'));
    newInput.setAttribute('placeholder', oldInput.getAttribute('placeholder'));
    newInput.setAttribute('value', newValue.toUpperCase());
    oldInput.after(newInput);
    oldInput.remove();
    newInput.focus();
    newInput.setSelectionRange(newInput.value.length,newInput.value.length);
    inputEventListeners();
}

// Returns with the DOM element of the selected list item
function findSelectedCountyItem(inp) {
    let listId = document.getElementById(inp.getAttribute('aria-controls')).id;
    return document.querySelector(`#${listId} > ul > li[aria-selected="true"]`);
}

// Returns with the DOM element with the desired county name
function selectCountyItem(inp, value) {
    let listId = document.getElementById(inp.getAttribute('aria-controls')).id;
    let allItems = document.querySelectorAll(`#${listId} > ul > li`);
    let searchedItem;
    for (thisItem of allItems) {
        try {
            if (thisItem.firstChild.innerHTML.toUpperCase() === value.toUpperCase()) {
                searchedItem = thisItem;
            }
        } catch {}
    }
    return searchedItem;
}

// Removes the Suggestion list for a specified input
function removeAllCountyElement(inp) {
    let completeList = document.getElementById(inp.getAttribute('aria-controls'));
    completeList.innerHTML = "";
}

// Refresh the suggestions while typing
function refreshCountiesElement(inp) {
    removeAllCountyElement(inp);
    insertAutoList(inp);
}

// Function to butify high distance values
function insertSpacesToNum(int) {
    int = int.toString();
    if(int.length > 3) {
        for(let i = int.length-3; i > 0; i-=3) {
            int = `${int.slice(0, i)}&nbsp;${int.slice(i, int.length)}`;
        }
    }
    return int;
}

function distanceOf(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

// Calculates the angle in degrees (in integer) of a given (with start- and endpoint) vector and the y axis
function getDirOfVector(x1, y1, x2, y2) { // In degrees
    let dir;
    if (y2 < y1) {
        dir = ((Math.floor(Math.atan((x2-x1) / (y2-y1)) * 180 / Math.PI) + 180) + 360) % 360;
    } else {
        dir = (Math.floor(Math.atan((x2-x1) / (y2-y1)) * 180 / Math.PI) + 360) % 360;
    }
    return dir;
}

// Replaces a gray guess row with an analitics row about the latest guess
function placeAnalisys(count, name, dist, distUnit, dir, percent) {
    count = parseInt(count);
    let guessLine = document.getElementById('guesses').children[4 * count];
    let newLine = document.getElementById('tmpl-guess-analisys').content.cloneNode(true);
    newLine.id = `guess-line${Guesses.length}`;
    let partyEmoji = newLine.children[2].childNodes[1].firstChild;
    try {
        newLine.children[0].childNodes[1].innerHTML = name;
        newLine.children[1].innerHTML = insertSpacesToNum(dist) + " " + distUnit;
        partyEmoji.setAttribute('alt', Directions[dir].alt);
        partyEmoji.setAttribute('src', 'https://em-content.zobj.net/thumbs/240/twitter/' + Directions[dir].img)
        newLine.children[3].innerHTML = (Math.round(percent)).toString() + '%';
    } catch (error) {
        console.error(error);
    }
    if (guessLine != undefined) {
        guessLine.after(newLine);
        guessLine.remove();
    }

    // Both needed on wining and on losing as well
    let finishArea = document.getElementById('tmpl-finish').content.firstElementChild.cloneNode(true);
    if (guessLine != undefined) finishArea.childNodes[5].childNodes[5].setAttribute('href', getWikipediaLink(Solution, Language));
    
    // Write out win text
    if (dir === 'yo') {
        let myPlace = removeGuessArea(true);
        myPlace.appendChild(finishArea);
        let partyEmojiPos = partyEmoji.getBoundingClientRect();
        try {
            // Confetti Animation
            if(!Won) confetti({
                particeCount: 150,
                startVelocity: 30,
                spread: 80,
                origin: {
                    x: partyEmojiPos.x / window.innerWidth,
                    y: partyEmojiPos.y / window.innerHeight
                }
            });
        } catch {}
        Won = true;

        // Cancel rotation when it's already guessed
        removeRotation();
    }
    // Write out lose text
    else if (count + 1 === numberOfTries) {
        let myPlace = removeGuessArea(true);
        myPlace.appendChild(finishArea);
        let finishImage = finishArea.childNodes[3].childNodes[1].firstElementChild;
        finishImage.setAttribute('src', 'loseMeme.jpg');
        finishImage.setAttribute('alt', '😒');

        // Cancel rotation when no tries left too
        removeRotation();
    }

    // Translate newly placed elements
    localalisation();

    // Button for showing the map
    buttonEventListeners("show-map");
}

function getWikipediaLink(forCounty, lang) {
    let articleName = wikiLinks[forCounty];
    if (articleName == undefined) {
        articleName = forCounty;
    } else {
        articleName = articleName[lang];
        if (articleName == undefined) {
            let endings = {en: "County", hu: "vármegye"};
            articleName = `${forCounty}_${endings[lang]}`;
        }
    }
    return `https://${lang}.wikipedia.org/wiki/${articleName}`;
}

function removeGuessArea(isReturn) {
    let guessArea = document.querySelector('.my-2');
    guessArea.innerHTML = "";
    if (isReturn) {
        return guessArea;
    }
}

function guessAnalisys(myGuess, specialplace) {
    if (CountyList.includes(myGuess)) console.log(getWikipediaLink(myGuess, Language));
    if (Guesses.length < numberOfTries + 1) {
        if (myGuess === Solution) {
            placeAnalisys(Guesses.length-1, Solution, 0, 'm', 'yo', 100);
        } else {
            let guessPath = document.querySelector("#mapTemplate > svg > g > #" + myGuess);
            if (guessPath != undefined) {
                otherMetaData[myGuess] = trackPath(absToRel(guessPath.getAttribute('d')));
            } else {
                otherMetaData[myGuess] = {midx: 0, midy: 0};
            }
            let dir = 0;
            let dirs = ['nn', 'nw', 'ww', 'sw', 'ss', 'se', 'ee', 'ne'];
            let midx0 = metaData.midx;
            let midy0 = metaData.midy;
            let midx1 = otherMetaData[myGuess].midx;
            let midy1 = otherMetaData[myGuess].midy;
            let distance = distanceOf(midx0, midy0, midx1, midy1);
            let unit = "m";
            let accuracy = 0;
            if (guessPath != "") {
                distance = Math.floor(distance * Scale); // m
                if (sizePercent) {
                    let size0 = metaData.width * metaData.height;
                    let size1 = otherMetaData[myGuess].width * otherMetaData[myGuess].height;
                    accuracy = (normalModulus((size1 - size0), size0) / size0) * 100;
                } else {
                    accuracy = (1 - distance / Scale / Furthest.dist)*100;
                }
                if ((distance > 99999 && distanceUnit === "mixed") || distanceUnit === "km") {
                    unit = "km";
                    distance = Math.floor(distance / 1000); // km
                }
                if (distanceUnit === "miles") {
                    unit = translationPiece('miles');
                    distance = Math.floor(distance * 0.00062137); // miles
                }
                dir = getDirOfVector(midx0, midy0, midx1, midy1);
                dir = Math.round(dir / 45) % 8; // It can be (e.g. 7.6) rounded up to 8 which does not included in the following list => %8 is needed
            }
            let place = ((specialplace == undefined) ? Guesses.length - 1 : specialplace);
            placeAnalisys(place, Guesses[place], distance, unit, dirs[dir], accuracy);
        }
    }
}

function normalModulus(a, b) {
    let returnWith;
    if (a < 0) {
        returnWith = b - (Math.abs(a) % b);
    } else {
        returnWith = a % b;
    }
    return returnWith;
}

// When the form is submitted
function handleGuess() {
    let guessInput = document.querySelector('input[aria-autocomplete="list"]');
    let guess = titleCase(guessInput.value);
    if(guess != '') {
        if (Guesses.includes(guess)) {
            window.alert(translationPiece('already'));
        } else if (CountyList.includes(guess)) {
            Guesses.push(guess);
            guessInput.value = "";
            guessAnalisys(guess);
        } else {
            window.alert(translationPiece('unknown'));
        }
    }
}

function buttonEventListeners(button) {
    // Show Map button after finishing guessing
    if (button === "show-map") {
        let showMap = document.querySelector('a[role="button"]');
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
}

function closeUppermostWindow(deleteCanvas) {
    let lastContent = document.querySelector("#page > div:last-child");
    if (lastContent.id !== "mainContent") {
        lastContent.remove();
        if (deleteCanvas) try {document.querySelector("#page > canvas").remove()} catch {};
        updateGuessLines(numberOfTries);
        updateMainCountyImage(!hideShape, rotateShape && !rotationRemoved, Won || Guesses.length >= numberOfTries);
    }
    saveSettings();
    if (!rotateShape) {
        rotationRemoved = false;
    }
    if (!hideShape) {
        showImageButtonRemoved = false;
    }
}

function saveSettings() {
    localStorage.setItem("lang", Language);
    localStorage.setItem("theme", mainTheme);
    localStorage.setItem("tries", numberOfTries);
    localStorage.setItem("unit", distanceUnit);
    localStorage.setItem("map", mapTheme);
    localStorage.setItem("hide", hideShape);
    localStorage.setItem("rotate", rotateShape);
    localStorage.setItem("size", sizePercent);
}

function updateMainCountyImage(show, rotate, finished = false) {
    if (rotate && !finished) {
        let rotationButton = document.getElementById('cancel-rot')
        if (rotationButton == undefined) {
            rotateSVG(
                document.querySelector('#imageToGuess > svg'),
                Rotation,
                document.getElementById('imageToGuess')
            );
            localalisation();
        } else {
            rotationButton.style.display = "";
        }
    } else {
        if (!finished) {
            removeRotation()
        }
    }
    if (show) {
        document.getElementById('imageToGuess').style.display = "";
        document.getElementById('imageToGuess').style.transform = "";
        removeShowMapButton();
    } else {
        if (!showImageButtonRemoved) {
            removeRotation(true);
            document.getElementById('imageToGuess').style.display = "none";
            addShowMapButton();
        }
    }
}

function addShowMapButton() {
    let button = document.getElementById('tmpl-showmap').content.firstElementChild.cloneNode(true);
    let image = document.getElementById('mainImage')
    image.appendChild(button);
    image.firstElementChild.style.transform = "scale(0)";
    localalisation();
    button.addEventListener('click', (e) => {
        document.getElementById('imageToGuess').style.display = "";
        image.firstElementChild.style.transform = "";
        removeShowMapButton();
        showImageButtonRemoved = true;
    });
}

function removeShowMapButton() {
    try {document.getElementById('showmap-button').remove();} catch {};
}

function placeMapOnpage(showMap) {
    let map = document.getElementById('helpMap');
    let insertTo = document.getElementById(showMap.getAttribute('maparea-id'));
    if (map == null) { // Check if it's already toggled, and the mp is displayed => then it hides it
        let mapTemplate = document.querySelector('#mapTemplate > svg').cloneNode(true);
        mapTemplate.id = "helpMap";
        let em = parseFloat(getComputedStyle(document.getElementById('midContent')).fontSize);
        let scale = 31 * em / mapTemplate.width.baseVal.value;
        insertTo.style.height = `${(mapTemplate.height.baseVal.value + 20) * scale}px`;
        insertTo.style.maxWidth = `98vw`;
        mapTemplate.style.transform = `scale(${scale})`;
        insertTo.appendChild(mapTemplate);
        let solutionCounty = document.querySelector(`#helpMap > g > #${Solution}`);
        solutionCounty.style.fill = 'var(--red)';
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
        document.getElementById('style-modification').remove();
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
            #helpMap > g > path           { fill: #FFFFFF; }
            #helpMap > g > path.county_y  { fill: #FFFFC0; }
            #helpMap > g > path.county_r  { fill: #FFC0C0; }
            #helpMap > g > path.county_b  { fill: #C0C0FF; }
            #helpMap > g > path.county_g  { fill: #C0FFC0; }
            #helpMap > g > path.water     { fill: #0080FF; }
            #helpMap > g > text           { fill: #000}
            #helpMap > g > path[style*="var(--red)"] { fill: var(--toastify-color-error) !important;}
            `;
        document.head.appendChild(modifiedStyles);
    } else {
        if (!forcetrue) {
            modifiedStyles.remove();
            paletteIcon.style.filter = '';
        }
    }
}

// For accuracy calculations
function getFurthest() {
    let furthestCounty = "";
    let furthestDist = 0;
    let AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
    let tempDist;
    let tempData;
    for (let examinedCounty of AllCountyNames) {
        tempData = trackPath(absToRel(examinedCounty.getAttribute('d')));
        tempDist = distanceOf(metaData.midx, metaData.midy, tempData.midx, tempData.midy);
        if (tempDist > furthestDist) {
            furthestDist = tempDist;
            furthestCounty = examinedCounty.id;
        }
    }
    return {"name": furthestCounty, "dist": furthestDist};
}

// Get all of the county names and place the SVG image
function initialWork() {
    getCountyImage('mapTemplate');
    let AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
    for (let thisCounty of AllCountyNames) {
        try {if((thisCounty.id != undefined)) {CountyList.push(thisCounty.id)}} catch {}
    }
    getImageMetadata();

    // Insert image of county to guess
    guessImage = document.createElement('div');
    guessImage.id = 'imageToGuess';
    guessImage.className = 'flex items-center justify-center w-full';
    document.getElementById('mainImage').appendChild(guessImage);
    console.log(CountyList);
    getCountyImage('imageToGuess', getRandomCounty());

    // Theme Setup
    initialThemeSetup();
    languageSetup();
    loadFromLocal();
    setThemeTo(mainTheme);
    updateMainCountyImage(!hideShape, rotateShape, Won || Guesses.length >= numberOfTries);
}

function getImageMetadata() {
    try {
        let placeholders = document.querySelectorAll("[placeholder]");
        let meta = document.querySelector("#mapMetadata");
        let newPlaceholder = meta.getAttribute('placeholder');
        if (newPlaceholder == null) {
            newPlaceholder = 'ph2';
        }
        for (let placeholder of placeholders) {
            placeholder.setAttribute('lnph', newPlaceholder);
        }
        Scale = parseFloat(meta.getAttribute('scale'));
    } catch (error) {
        console.log('Could not find metadata.');
        console.error(error);
    }
}

// Replacing translations
function localalisation() {
    // localise inner contents
    let allToTranslate = document.querySelectorAll('[ln]');
    let keyName;
    let translation;
    for (let toTranslate of allToTranslate) {
        keyName = toTranslate.getAttribute('ln');
        translation = translationPiece(keyName);
        if (!toTranslate.innerHTML.includes(translation)) { // If not yet translated
            toTranslate.innerHTML = replaceInnerTextContent(toTranslate.innerHTML, translation);
        }
    }

    // Localise placeholders (= "ph")
    allToTranslate = document.querySelectorAll('[lnph]');
    for (let toTranslate of allToTranslate) {
        keyName = toTranslate.getAttribute('lnph');
        toTranslate.setAttribute('placeholder', translationPiece(keyName));
    }

    // Localise title attributes
    allToTranslate = document.querySelectorAll('[lnt]');
    for (let titleToTranslate of allToTranslate) {
        keyName = titleToTranslate.getAttribute('lnt');
        titleToTranslate.setAttribute('title', translationPiece(keyName));
    }

    // Loclise finish text
    let finishArea = document.getElementById('finished');
    if (finishArea != null) {
        let finishAreatext = finishArea.childNodes[1].innerHTML
        if (Won) {
            if(Guesses.length === 1) {
                finishAreatext = `${translationPiece('anal1.0')} ${numberOfTries} ${translationPiece('anal1.3')}.`;
            } else {
                finishAreatext = `${translationPiece('anal1.1')} ${Guesses.length} ${translationPiece('anal1.2')} ${numberOfTries} ${translationPiece('anal1.3')}.`;
            }
        } else {
            finishAreatext = `${translationPiece('anal2.1')}&nbsp;<i>${Solution}</i>${translationPiece('anal2.2')}.`;
        }
        finishArea.childNodes[1].innerHTML = finishAreatext;
        finishAreatext = finishArea.childNodes[3].childNodes[1].innerHTML;
        if (Won) {
            finishAreatext = replaceInnerTextContent(finishAreatext, translationPiece('win'));
        } else {
            finishAreatext = replaceInnerTextContent(finishAreatext, translationPiece('lose'));
        }
        finishArea.childNodes[3].childNodes[1].innerHTML = finishAreatext;
    }
}

function translationPiece(key, lang) {
    if (lang == undefined || lang == null) lang = Language;
    let returnWith;
    try {
        returnWith = translations[key][lang];
    } catch (error) {
        console.log(`Couldn't find translation for "${key}" in language "${lang}".`)
    }
    return returnWith;
}

function replaceInnerTextContent(elementContent, text) {
    if (elementContent == "") {
        elementContent = text;
    } else {
        let innerContent = elementContent.split('>');
        innerContent[innerContent.length - 1] = text;
        elementContent = innerContent.join('>');
    }
    return elementContent;
}

// **Settings**
function displaySettings() {
    addForeGroundPage('settings');
}

function displayStats() {
    addForeGroundPage('stats');
}

function displayAbout() {
    addForeGroundPage('about');
    if (imageOrigin !==  "Kingdom_of_Hungary_counties (Plain).svg") {
        mainAboutContent = document.querySelectorAll('#aboutPage > div');
        for (let divToDelete of mainAboutContent) {
            divToDelete.remove();
        }
        let newDiv = document.createElement('div');
        newDiv.className = "ml-3 p-1";
        newDiv.style.paddingTop = "4em";
        newDiv.setAttribute('ln', "custom");
        let page = document.getElementById('aboutPage');
        page.appendChild(newDiv);
        let newA = document.createElement('a');
        newA.setAttribute('ln', 'goback');
        newA.setAttribute('href', window.location.toString().split('?')[0])
        page.appendChild(newA);
        newA.className = 'ml-3 p-1 text-green-600';
        localalisation();
    }
}

function addForeGroundPage(pageName) {
    removeShowMapButton();
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
    localalisation();
    buttonEventListeners('cancel');
}

function addGameSpecificSettings(parent) {
    let gameSpecific = data.settings.gameplay;
    for (let setting of gameSpecific) {
        addSetting(parent, setting.type, setting.name, ((setting.type == "number") ? setting.range : null))
    }
}

function addGeneralSettings(toParent) {
    let generalSettings = data.settings.general;
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
    }
    handleSetting(selectArea, id, type, options);
}

function forceNumIntoRange(num, min, max) {
    num = parseInt(num);
    if (isNaN(num) || num < min) {
        num = min;
    }
    if (num > max) {
        num = max;
    }
    return num;
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
                localalisation();
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
        }
    });
}

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
            let em = parseFloat(getComputedStyle(document.getElementById('midContent')).fontSize);
            let scale = 31 * em;
            if (scale > window.innerWidth * 0.9) {
                scale = window.innerWidth * 0.9;
            }
            map.style.transform = `scale(${scale / map.width.baseVal.value})`;
            insertTo.style.height = `${map.getBoundingClientRect().height * 1.1}px`;
        }
    });
}

// END OF DEFINITIONS

initialWork();
let CountyListOrdered = CountyList.slice(0, CountyList.length);
CountyListOrdered = CountyListOrdered.sort();
localalisation();

// Insert grey lines for guess analysises;
placeGuessLines(numberOfTries);

// Setup event listeners
inputEventListeners();

Furthest = getFurthest();

// Header buttons
buttonEventListeners('about-button');
buttonEventListeners('stats-button');
buttonEventListeners('settings-button');


// Global events
docEvents();
