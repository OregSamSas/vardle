// **Main Thread**

// import data from './data.json';
let data = {"directions": "0", "wikilinks": "1"};
dataXHR = new XMLHttpRequest();
dataXHR.open("GET","data/data.json",false);
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
const wikiLinks = data.wikilinks; // From https://en.wikipedia.org/wiki/Lands_of_the_Crown_of_Saint_Stephen#:~:text=Subdivisions, and above from the table: Counties of the Lands of the Crown of Saint Stephen
const translations = data.l10n;

// Theme Metadata
const lightThemeArray = data.themes[0];
const darkThemeArray = data.themes[1];

let rotationRemoved = false;
let Scale = undefined;
let Rotation = 1 - Math.random() * 2;
let sizePercent = false;
let numberOfTries = 6;
let numberOfTriesForImage = 2;
let hideShape = false;
let rotateShape = false;
let sysTheme;
let mainTheme = "system";
let mapTheme = "mono";
let mapLabelsDefault = true;
let mapCitiesDefault = true;
let distanceUnit = "mixed";
let Language;
let Furthest = {};
let metaData = {"x": 0, "y": 0, "width": 0, "height": 0, "midx": 0, "midy": 0, "closest-border": 0, "dir": 0};
let otherMetaData = metaData;
let SuggestionList = [];
let Won = false;
let finishedRounds = [false];
let Solution = "";
let imageOrigin = "";
let gameMap = "Original";
let Round = 0;
let numberOfRounds = 3;
let arabicInSuggestions = false; // Setting for showing Arabic numerals in suggestions for district numbers
let closestTerritories = Array(20).fill('');
let computingMethod = "centre";
let guesslinesCount = 0;
let coaImages = Array(6).fill('');
let solutionPath = "";
let solutionText = "";
let showImageButtonRemoved = Array(numberOfRounds).fill(false);
let showImageButtonsRemoved = [];
let swapCoasAndShapes = false;
let Cities = [];
let Capital = "";
let currentCity = "";
let countyCities = [];
let pinCorrectSize = 16;

// Help map variables
let mapZoom = 1;
let mapTranslate = [0, 0];

let OtherGuesses = [];

// FUNCTION DEFINITIONS

// Get all of the county names and place the SVG image
function initialWork() {
    loadFromLocal();
    getGuesslinesCount(Round);

    // Which map to play with
    loadMapFromURL();
    if (gameMap === "Original" || gameMap === "Hungary") {
        numberOfRounds = 4 + (gameMap === "Original") * 2;
    } else {
        swapCoasAndShapes = false;
        data.settings.gameplay.pop();
    }
    for (let i = 0; i < numberOfRounds; i++) {
        OtherGuesses.push([]);
    }
    
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
    getURLSolution();
    if (Solution == "" || Solution == undefined) {
        Solution = CountyList[getRandomCounty()];
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
    updateMainCountyImage(!hideShape, rotateShape, !!finishedRounds[Round]);

}

function updateRounds(oldr, newr) {
    getGuesslinesCount(newr);

    if (oldr === 0 || oldr === 3 || oldr === 4 || oldr === 5) {
        let test = document.querySelectorAll("#mainImage > *");
        for (let lmnt of test) {
            if (lmnt != null) {
                lmnt.remove();
            }
        }
    }

    Round = newr;

    if (newr === 4 && Capital == "") {
        Capital = Cities[getIndexByProperty(Cities, ["county", "capital"], [Solution, true])].name
    }

    let maincontent = document.getElementById('midContent');
    if (oldr === 1 || oldr === 3 || oldr === 2 || oldr === 4 || oldr === 5) {
        while (maincontent.firstElementChild.id !== "mainImage") {
            maincontent.firstElementChild.remove();
        }
        maincontent.firstElementChild.innerHTML = "";
    }
    if (newr === 0 || newr === 2 || newr === 4 || newr === 5) {
        maincontent.firstElementChild.style = `height:${(newr === 5) ? 240 : 210}px`;
        maincontent.firstElementChild.className = "flex justify-center items-center";
    }
    if (newr === 1 || newr === 3) {
        // make the main img container fit to the whole grid
        let imgarea = document.getElementById('mainImage');
        imgarea.className = "flex items-center gap-2 mb-4 flex-wrap justify-center";
        imgarea.style = "";
    }

    removeGuessArea();
    placeMainImage();
    updateMainCountyImage(!hideShape, rotateShape, !!finishedRounds[Round], oldr !== newr);
    let finishTemplate = document.getElementById('tmpl-finish').content.firstElementChild.cloneNode(true);
    if (finishedRounds[Round]) {
        finishedBottom(finishTemplate, finishedRounds[Round] === "lost", true);
        buttonEventListeners('show-map');
    } else if (Round === 1) {
        if (closestTerritories.length === 0) {
            finishedRounds[1] = "won";
            finishedBottom(finishTemplate);
        } else {
            guessInpAndGiveUpBtn();
        }
    } else if (Round === 2) {
        if (Furthest.length === 0) {
            finishedRounds[2] = "won";
            finishedBottom(finishTemplate);
        } else {
            guessInpAndGiveUpBtn();
        }
    } else if (Round === 3) {
        if (OtherGuesses[Round-1].length > 0) {
            redesignCoaButtons(false);
        }
    } else if (Round === 4) {
        guessInpAndGiveUpBtn();
    }
    localisation();
    if (Round === 5) {
        placePins();
    } else {
        updateGuessLines(guesslinesCount);
    }
}

// END OF DEFINITIONS


// MAIN CODE
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
    getCoaImages();
    loadCoaImages();
    // Header buttons
    buttonEventListeners('about-button');
    buttonEventListeners('stats-button');
    buttonEventListeners('settings-button');
    
    // Global events
    docEvents();

    getURLRound();
    if (Round !== 0) {
        updateRounds(0, Round);
    }
}

// END OF MAIN 