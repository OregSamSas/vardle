// import data from './data.json';
let data = {"directions": "0", "wikilinks": "1"};
dataXHR = new XMLHttpRequest();
dataXHR.open("GET","data.json",false);
// Following line is just to be on the safe side
dataXHR.overrideMimeType("application/json");
dataXHR.onload = (e) => {
    data = JSON.parse(dataXHR.response);
    console.log(data)
};
dataXHR.send("");

// Global variable declaration
const CountyList = [];
const Guesses = [];
const Directions = data.directions;
const wikiLinks = data.wikilinks; // From https://en.wikipedia.org/wiki/Lands_of_the_Crown_of_Saint_Stephen#:~:text=Counties%20of%20the%20Lands%20of%20the%20Crown%20of%20Saint%20Stephen
const numberOfTries = 6;

let metaData = {};
let otherMetaData = {};
let SuggestionList = [];
let Solution;


// function for insert a county to guess
function getCountyImage(id, num) {
    let ratio;
    let allCounties = new XMLHttpRequest();
    allCounties.open("GET","Kingdom_of_Hungary_counties (Plain).svg",false);
    // Following line is just to be on the safe side
    allCounties.overrideMimeType("image/svg+xml");
    allCounties.onload = (e) => {
        document.getElementById(id).appendChild(allCounties.responseXML.documentElement);
    };
    allCounties.send("");
    if(num != undefined) {
        allPaths = document.querySelectorAll('#' + id + ' > svg > g > path');
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
                let biggerSize = metaData.width;
                if (metaData.height > metaData.width) {
                    biggerSize = metaData.height;
                }
                thisPath.setAttribute("d", movePath(thisPath.getAttribute("d"), 0-metaData.x, 0-metaData.y));
                ratio = (Math.floor((180 / biggerSize) * 100000) / 100000).toString()
                thisPath.style.transform = "scale(" + ratio + ")";
            }
        }
        svgImage = document.querySelector('#' + id + ' > svg');
        svgImage.setAttribute("width", metaData.width * parseFloat(ratio));
        svgImage.setAttribute("height", metaData.height * parseFloat(ratio));
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
            str[i][j] = str[i][j].charAt(0).toUpperCase() + str[i][j].slice(1);
        }
        str[i] = str[i].join('-');
    }
    str = str.join(' ');
    return str;
}

// Move path (with relatively set curve commands)
function movePath(path, dx, dy, newx, newy) {
    let char = 2;
    let origCoordinates = ['', ''];
    for(let coo=0;coo<2;coo++) {
        while(path[char] !== " " && path[char] !== ",") {
            origCoordinates[coo] += path[char];
            char ++;
        }
        char ++;
    }
    if(newx == undefined || newy == undefined) {
        path = "M " + (parseFloat(origCoordinates[0]) + dx).toString() + ',' + (parseFloat(origCoordinates[1]) + dy).toString() + ' ' + path.slice(char, path.length);
    } else {
        path = "M " + (newx).toString() + ',' + (newy).toString() + ' ' + path.slice(char, path.length);
    }
    return path;
}

// Function to replace absolute bézier curve commands with relative
function absToRel(path) {
    let char = 0;
    let command = "";
    let pathCoordinates = [];
    let coordinates = ['0', '0', '0', '0', '0', '0', '0', '0']; //x0:last x, y0:last y, x1, y1, x2, y2, x3, y3
    while(char<path.length) {
        command = path[char];
        char += 2;
        if(command === 'C' || command === 'c') {
            if(isCharNumber(command) || command === '-') {
                char += -2;
            }
            coordinates[0] = coordinates[6];
            coordinates[1] = coordinates[7];
            for(let coo=2;coo<8;coo++) {
                coordinates[coo] = '';
                while(path[char] !== " " && path[char] !== ",") {
                        coordinates[coo] += path[char];
                        char ++;
                }
                char ++;
            }
            let originalx = coordinates[6];
            let originaly = coordinates[7];
            if(command === 'C' || command === 'L') {
                for(let i=2;i<8;i++) {
                    coordinates[i] = (Math.round((parseFloat(coordinates[i]) - parseFloat(coordinates[0+i%2]))*1000)/1000).toString();
                }
            }
            pathCoordinates.push(coordinates.slice(2,8));
            coordinates[6] = originalx;
            coordinates[7] = originaly;
        }
        if(command === 'M') {
            coordinates = Array(8).fill('')
            for (let coo=6;coo<8;coo++) { // Insert 'move to()' command's coordinates to the last places (x3, y3), later it will be shifted to the place of x0, y0
                while(path[char] !== " " && path[char] !== ",") {
                    coordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
        }
    }

    char = 0;
    let newpath = '';
    while(path[char] != 'c' && path[char] != 'C') {
        try {newpath += path[char];} catch {console.log(char)}
        char++;
    }
    let i = 0;
    while(i<pathCoordinates.length) {
        newpath += 'c '
        for(let j=0;j<3;j++) {
            newpath += pathCoordinates[i][j*2] + ',' + pathCoordinates[i][j*2+1] + ' '
        }
        i++;
    }
    newpath += 'z';
    return newpath;
}

// Function to go through a path and collect its data
function trackPath(path) {
    let minx, miny, maxx, maxy, x, y, x1, y1, x2, y2, x3, y3, i=0, char=0, t = 0;
    let command = "";
    let origCoordinates = Array(8).fill('');
    while(char < path.length) {
        command = path[char];
        char += 2;
        if(command === 'M') {
            for(let coo=0;coo<2;coo++) {
                while(path[char] !== " " && path[char] !== ",") {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
        }
        if(command === 'c') {
            for(let coo=2;coo<8;coo++) {
                origCoordinates[coo] = '';
                while(path[char] !== " " && path[char] !== "," && char<path.length) {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            // Tracking curve
            x1 = parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[2]);
            y1 = parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[3]);
            x2 = parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[4]);
            y2 = parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[5]);
            x3 = parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[6]);
            y3 = parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[7]);
            t = 0;
            while(t<1) {
                // Formula from https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
                x = ((1-t)**3)*parseFloat(origCoordinates[0]) + 3*((1-t)**2)*t*x1 + 3*(1-t)*(t**2)*x2 + (t**3)*x3;
                y = ((1-t)**3)*parseFloat(origCoordinates[1]) + 3*((1-t)**2)*t*y1 + 3*(1-t)*(t**2)*y2 + (t**3)*y3;
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
                t+=0.1;
            }
            origCoordinates[0] = (parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[6])).toString();
            origCoordinates[1] = (parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[7])).toString();
        }
        i++;
    }
    return {"x": minx*1, "y": miny*1, "width": (maxx - minx), "height": (maxy - miny)}; // length, height, x position, y position
}

// Get all of the county names
getCountyImage('mapTemplate');
AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
for (let thisCounty in AllCountyNames) {
    try {if((AllCountyNames[thisCounty].id != undefined)) {CountyList.push(AllCountyNames[thisCounty].id)}} catch {}
}
let CountyListOrdered = CountyList.sort();

// Insert image of county to guess
guessImage = document.createElement('div');
guessImage.id = 'imageToGuess';
guessImage.className = 'flex items-center';
guessImage.style.height = '210px';
document.getElementById('mainImage').appendChild(guessImage);
console.log(CountyList)
getCountyImage('imageToGuess', getRandomCounty());

function getRandomCounty() {
    let randomCounty = CountyList.indexOf('Balaton'); // Balaton cannot be the solution, but can be guessed
    while (CountyList[randomCounty] === "Balaton") {
        randomCounty = Math.floor(Math.random()*(CountyList.length-1));
    }
    return randomCounty
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
                    if (e.isComposing || e.keyCode === 229) {
                        return;
                    }
                    if (e.keyCode === 27 && e.key === "Escape") {
                        input.blur();
                    }
                    if (e.keyCode === 13 && e.key === "Enter") {
                        let selected = null;
                        try { selected = findSelectedCountyItem(input).firstChild.innerHTML; } catch{}
                        if (selected != null) {
                            listItemClicked(input.id, selected);
                        } else {
                            handleGuess();
                        }
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
                });
            }
        } catch {}
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
    countyItem.setAttribute('aria-selected', true);
    countyItem.className = 'font-bold';
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
    let guessLine = document.getElementById('guesses').children[3*(Guesses.length-1)+count];
    let newLine = document.getElementById('tmpl-guess-analisys').content.cloneNode(true);
    newLine.id = `guess-line${Guesses.length}`;
    newLine.children[0].childNodes[1].innerHTML = name;
    newLine.children[1].innerHTML = insertSpacesToNum(dist) + " " + distUnit;
    newLine.children[2].childNodes[1].firstChild.setAttribute('alt', Directions[dir].alt);
    newLine.children[2].childNodes[1].firstChild.setAttribute('src', 'https://em-content.zobj.net/thumbs/240/twitter/' + Directions[dir].img)
    newLine.children[3].innerHTML = (Math.round(percent)).toString() + '%';
    guessLine.after(newLine);
    guessLine.remove();

    // Write out win text
    if (dir === 'yo') {
        let myPlace = removeGuessArea(true);
        let winPlace = document.getElementById('tmpl-win').content.firstElementChild.cloneNode(true);
        myPlace.appendChild(winPlace);
        if(Guesses.length === 1) {
            winPlace.childNodes[1].innerHTML = `You guessed correctly at first out of ${numberOfTries} tries.`;
        } else {
            winPlace.childNodes[1].innerHTML = `You guessed correctly in ${Guesses.length} guesses out of ${numberOfTries} tries.`;
        }
        winPlace.childNodes[3].childNodes[1].innerHTML += 'win!!!';
        winPlace.childNodes[5].childNodes[3].setAttribute('href', `https://en.wikipedia.org/wiki/${wikiLinks[name]}`);
    }

    // Write out lose text
    if (Guesses.length === numberOfTries) {
        let myPlace = removeGuessArea(true);
        let losePlace = document.getElementById('tmpl-lose').content.firstElementChild.cloneNode(true);
        myPlace.appendChild(losePlace);
        losePlace.childNodes[1].innerHTML = `You didn't get it this time. It was ${Solution}.`;
    }
}

function removeGuessArea(isReturn) {
    let guessArea = document.querySelector('.my-2');
    guessArea.innerHTML = "";
    if (isReturn) {
        return guessArea;
    }
}

function guessAnalisys(myGuess) {
    if (Guesses.length < numberOfTries + 1) {
        if (myGuess === Solution) {
            placeAnalisys(Guesses.length-1, Solution, 0, 'm', 'yo', 100);
        } else {
            let guessPath = document.querySelector("#mapTemplate > svg > g > #" + myGuess);
            otherMetaData[myGuess] = trackPath(absToRel(guessPath.getAttribute('d')));
            let midx0 = metaData.x + metaData.width/2;
            let midy0 = metaData.y + metaData.height/2;
            let midx1 = otherMetaData[myGuess].x + otherMetaData[myGuess].width/2;
            let midy1 = otherMetaData[myGuess].y + otherMetaData[myGuess].height/2;
            let distance = distanceOf(midx0, midy0, midx1, midy1);
            let unit = "m";
            distance = Math.floor(distance * 1227.3); // m
            let accuracy = (1 - distance / 858000)*100;
            if (distance > 99999) {
                unit = "km";
                distance = Math.floor(distance / 1000); // km
            }
            let dir = getDirOfVector(midx0, midy0, midx1, midy1);
            dir = Math.round(dir / 45);
            let dirs = ['nn', 'nw', 'ww', 'sw', 'ss', 'se', 'ee', 'ne'];
            placeAnalisys(Guesses.length-1, Guesses[Guesses.length-1], distance, unit, dirs[dir], accuracy);
        }
    }
}

// When the form is submitted
function handleGuess() {
    let guessInput = document.querySelector('input[aria-autocomplete="list"]');
    let guess = titleCase(guessInput.value);
    if(guess != '') {
        if (Guesses.includes(guess)) {
            window.alert('Already guessed.')
        } else if (CountyList.includes(guess)) {
            Guesses.push(guess);
            guessInput.value = "";
            guessAnalisys(guess);
        } else {
            window.alert('Unknown Territory.');
        }
    }
}

// For accuracy calculations
function getFurthest() {
    return 0; 
}

// Setup event listeners
inputEventListeners();

getFurthest()