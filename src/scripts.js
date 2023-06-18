// import data from './data.json';
let data = {"directions": "0", "wikilinks": "1"};
dataXHR = new XMLHttpRequest();
dataXHR.open("GET","src/data.json",false);
// Following line is just to be on the safe side
dataXHR.overrideMimeType("application/json");
dataXHR.onload = (e) => {
    data = JSON.parse(dataXHR.response);
};
dataXHR.send("");

// Global variable declaration
const CountyList = [];
const Guesses = [];
let OtherGuesses = [[]];
const Directions = data.directions;
const wikiLinks = data.wikilinks; // From https://en.wikipedia.org/wiki/Lands_of_the_Crown_of_Saint_Stephen#:~:text=Counties%20of%20the%20Lands%20of%20the%20Crown%20of%20Saint%20Stephen
const translations = data.l10n;

// Theme Metadata
const lightThemeArray = data.themes[0];
const darkThemeArray = data.themes[1];

let showImageButtonRemoved = false;
let rotationRemoved = false;
let Scale = undefined;
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
let finishedRounds = [false];
let Solution;
let imageOrigin = "Kingdom_of_Hungary_counties_(Plain).svg";
let Round = 0;
let numberOfRounds = 3;
let arabicInSuggestions = false;
let closestTerritories = Array(10).fill('');

// Get URL params
handleURL();

// FUNCTION DEFINITIONS

// Get all of the county names and place the SVG image
function initialWork() {
    // Theme Setup
    initialThemeSetup();
    setThemeTo(mainTheme);
    
    getCountyImage('mapTemplate');
    let AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
    for (let thisCounty of AllCountyNames) {
        try {
            if((thisCounty.id != undefined)) {
                CountyList.push(thisCounty.id);
            }
        } catch {}
    }
    placeGuessInput();
    getImageMetadata();

    // Insert image of county to guess
    console.log(CountyList);
    placeMainImage();

    if(Won) {
        finishedBottom();
    }
    
    languageSetup();
    loadFromLocal();
    updateMainCountyImage(!hideShape, rotateShape, finishedRounds[Round]);
}

function updateRounds(oldr, newr) {
    console.log()
    if (oldr === 0) {
        let test = document.querySelector("#mainImage > #imageToGuess");
        if (test != null) {
            test.remove();
        }
    }

    Round = newr;

    placeMainImage();
    removeGuessArea();
    if (newr > 0) {
        if (finishedRounds[Round]) {
            finishedBottom(document.getElementById('tmpl-finish').content.firstElementChild.cloneNode(true), finishedRounds[Round] === "lost", true);
            buttonEventListeners('rounds');
            buttonEventListeners('show-map');
        } else if(Round === 1) {
            placeGuessInput();
            inputEventListeners();
        }
        localisation();
    }
    updateGuessLines(numberOfTries);
}

// END OF DEFINITIONS

initialWork();
let CountyListOrdered = CountyList.slice(0, CountyList.length);
CountyListOrdered = advancedSort(CountyListOrdered);
localisation();

// Insert grey lines for guess analysis;
placeGuessLines(numberOfTries);

// Setup event listeners
inputEventListeners();

window.onload = function () {
    Furthest = getFurthest();
}

// Header buttons
buttonEventListeners('about-button');
buttonEventListeners('stats-button');
buttonEventListeners('settings-button');


// Global events
docEvents();
