// **Helping Algorithms**
// (Not strictly connected with the game or the UI)

// *Facade patterns for third party libraries*

function addAnimatedConfetti(inpObj = {
    particeCount: 150,
    startVelocity: 31,
    spread: 70,
    origin: {
        x: 0.5,
        y: 0.5
    }
}) {
    try {
        confetti({
            particeCount: inpObj.particeCount,
            startVelocity: inpObj.startVelocity,
            spread: inpObj.spread,
            origin: {
                x: inpObj.origin.x,
                y: inpObj.origin.y
            }
        });
    } catch {
        console.error("Confetti function not found. Need to include the confetti library to use this function.");
    }
}

// *Input utilities*

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

// *DOM utilities*

// Function to find the first child of a specific type of an element
function findFirstChildOfType(element, type) {
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        if (child.nodeName.toUpperCase() === type.toUpperCase()) {
            return child;
        }
    }
    return null;
}

// *Search utilities*

const arabicNums = [5000, 4000, 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const romanNums = ['MMMMM', 'MMMM','M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

function advancedSort(list, forceToSortAsRomanNumerals) {
    let isRoman = true;
    if (!forceToSortAsRomanNumerals) {
        list.forEach(ival => {
            for (let letter of ival) {
                if (!romanNums.includes(letter.toUpperCase()) && letter !== '°' && letter !== '.') {
                    isRoman = false;
                }
            }
        });
    }
    if (isRoman) {
        list.forEach(element => {
            list[list.indexOf(element)] = {roman: element, arabic: romanToArabic(element.toUpperCase())};
        });
        list.sort( (num1, num2) => num1.arabic - num2.arabic);
        list.forEach(element => {
            list[list.indexOf(element)] = element.roman;
        });
    } else {
        // Ignore accents
        list.sort( (a, b) => {
            a = removeAccents(a);
            b = removeAccents(b);
            if ([a, b].sort()[0] === a) {
                return -1;
            } else {
                return 1;
            }
        });
    }

    return list;
}

function romanToArabic(romanNum) {
    let currentvalue = 0, nextvalue = 0, allvalue = 0;
    while (romanNum.length > 0) {
        currentvalue = arabicNums[romanNums.indexOf(romanNum[0])];
        nextvalue = arabicNums[romanNums.indexOf(romanNum[1])];
        if (nextvalue > currentvalue) {
            allvalue -= parseInt(currentvalue);
        } else {
            allvalue += parseInt(currentvalue);
        }
        romanNum = romanNum.slice(1, romanNum.length);
    }

    return allvalue;
}

// Converts an arabic numeral (up to 10000) into a roman one
function arabicToRoman(num) {
    num = num.toString();
    if (num > 10000) {
        console.error(`The roman number generator only works up to 10K, ${num} is invalid input.`)
        return "⚠";
    }
    let digit = 0, value = 0;
    let newnum = '', addition = '';
    for (let i = num.length - 1; i > -1; i --) {
        digit = parseInt(num[i]);
        value = digit * (10 ** (num.length - i - 1));
        if (digit) {
            if (arabicNums.includes(value)) {
                addition = romanNums[arabicNums.indexOf(value)];
            } else {
                if (digit < 5) {
                    addition = Array(digit).fill(romanNums[arabicNums.indexOf(value / digit)]).join('');
                } else {
                    addition = romanNums[arabicNums.indexOf(5 * (10 ** (num.length - i - 1)))] + Array(digit - 5).fill(romanNums[arabicNums.indexOf(value / digit)]).join('');
                }
            }
            newnum = addition + newnum;
        } else {
            if (digit !== 0 ) {
                num = removeLetter(i, num);
            }
        }
    }
    return newnum;
}

function replaceSpecialCharacters(text = "", vicaversa = false, nocasechange = false) {
    if (!nocasechange) {
        text = titleCase(text);
    }

    if (vicaversa) {
        return text.replace(/\_/g, "'").replace(/–/g, ' ').replace(/°/g, '.');
    } else {
        return text.replace(/\'/g, '_').replace(/ /g, '–').replace(/\./g, '°');
    }
}

function removeAccents(txt) {
    return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
}

// Function to find an item in a list without minding the accent marks
function findItemWithoutAccentmarks(list, item) {
    for (let i = 0; i < list.length; i++) {
        if (removeAccents(list[i]) === removeAccents(item)) {
            return i;
        }
    }
    return -1;
}

// *Other String utilities*

// Check if a character is a digit
function isCharNumber(c) {
    return typeof c === 'string' && c.length == 1 && c >= '0' && c <= '9';
}

// Function to beautify high distance values
function insertSpacesToNum(int) {
    int = int.toString();
    if(int.length > 3) {
        for(let i = int.length-3; i > 0; i-=3) {
            int = `${int.slice(0, i)}&nbsp;${int.slice(i, int.length)}`;
        }
    }
    return int;
}

// Function for making a string to TitleCase (all initial letters are capitalised)
// Modified version of https://www.freecodecamp.org/news/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27/
function titleCase(str = "") {
    str = str.toLowerCase();
    str = str.split(' ');
    for (let i = 0; i < str.length; i++) {
        let emdash = false;
        if (str[i].includes('–')) {
            str[i] = str[i].split('–');
            emdash = true;
        } else {
            str[i] = str[i].split('-');
        }
        for(let j = 0; j < str[i].length; j++) {
            if (str[i][j].toLowerCase() === "és" || str[i][j].toLocaleLowerCase() === "and") { // Do not capitalise conjunctive words (és = and)
                str[i][j] = str[i][j].toLowerCase();
            } else {
                if (str[i][j].charAt(1) === "'") { // if the case is d'Aosta or smg
                    str[i][j] = str[i][j].slice(0, 2) + str[i][j][2].toUpperCase() + str[i][j].slice(3);
                } else {
                    str[i][j] = str[i][j].charAt(0).toUpperCase() + str[i][j].slice(1);
                }
            }
        }
        if (emdash) {
            str[i] = str[i].join('–');
        } else {
            str[i] = str[i].join('-');
        }
    }
    str = str.join(' ');
    return str;
}

// From https://stackoverflow.com/questions/17267329/converting-unicode-character-to-string-format
function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi, 
           function (match) {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
           });
}

function replaceAbbreviations(txt = "") {
    return txt.replace(/fr\./gi, 'French')
                .replace(/rep\. /gi, 'Republic of ')
                .replace(/rep\./gi, 'Republic')
                .replace(/dem\./gi, 'Democratic')
                .replace(/ pdr/gi, " People's Democratic Republic")
                .replace(/is\./gi, 'Islands')
                .replace(/st\./gi, 'Saint')
                .replace(/eq\./gi, 'Equatorial')
                .replace(/herz\./gi, 'Herzegovina')
                .replace(/vin\./gi, 'Vincent')
                .replace(/gren\./gi, 'the Grenadines')
                .replace(/barb\./gi, 'Barbuda')
                .replace(/u\.s\./gi, 'United States');
}

// *Calculations*

function mergeNumberArrays(arr1, arr2) {
    // Fill up the arrays with 0s if they are not the same length
    if (arr1.length !== arr2.length) {
        const maxLength = Math.max(arr1.length, arr2.length);
        const minLength = Math.min(arr1.length, arr2.length);
        const diff = maxLength - minLength;
        
        if (arr1.length < arr2.length) {
            for (let i = 0; i < diff; i++) {
                arr1.push(0);
            }
        } else {
            for (let i = 0; i < diff; i++) {
                arr2.push(0);
            }
        }
    }

    // Merge the arrays (fills up with floats)
    const mergedArray = [];
    
    for (let i = 0; i < arr1.length; i++) {
        mergedArray.push(parseFloat(arr1[i]) + parseFloat(arr2[i])); // works even if they are strings
    }
    
    return mergedArray;
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

// Fixed () mod () for negative inegers ((-x mod y) != (x mod y))
function normalModulus(a, b) {
    let returnWith;
    if (a < 0) {
        returnWith = b - (Math.abs(a) % b);
    } else {
        returnWith = a % b;
    }
    return returnWith;
}

// Calculating the territory to be guessed
function getRandomCounty() {
    let randomCounty = randomElement(); // Balaton cannot be the solution, but can be guessed
    while (CountyList[randomCounty] === "Balaton" || CountyList[randomCounty] === Solution) {
        randomCounty = randomElement();
    }
    return randomCounty;
}

function randomElement() {
    return Math.floor(Math.random()*(CountyList.length-1));
}

function compressNum(num, depth = 0) {
    return Math.round(num * 10 ** depth) / 10 ** depth;
}

// *Data utilities*

// The getIndexByProperty function is used to find the index of an item in an array based on a specific property name and value. 
// If either of them is not provided, it still returns with the idx of the object which has the provided key among its propertys or given value among its values resp.
function getIndexByProperty(array, propertyName, propertyValue = undefined) {
    for (let i = 0; i < array.length; i++) {
        if (propertyName !== undefined) {
            if (
                (array[i][propertyName] === propertyValue && array[i][propertyName] !== undefined) 
                ||
                (propertyValue === undefined && array[i][propertyName] !== undefined)
            ) {
                return i;
            }
        } else {
            for (let key in array[i]) {
                if (array[i][key] === propertyValue) {
                    return i;
                }
            }
        }
    }
    return -1;
}

// The getWikipediaLink function is used to get the Wikipedia link of a specific county based on the provided county name and language.
function getWikipediaLink(forCounty, lang = Language, onlyArticleName = false) {
    forCounty = replaceAbbreviations(replaceSpecialCharacters(forCounty, true));
    if (gameMap === "Budapest") {
        forCounty = forCounty.toUpperCase();
    }
    let articleName = wikiLinks[forCounty];
    if (articleName == undefined && gameMap !== "Poland" && gameMap !== "Hungary") {
        articleName = forCounty;
    } else {
        try{ articleName = articleName[lang]; } catch {}
        if (articleName == undefined) {
            let endings = {en: "", hu: "", de: ""};
            let beginings = {en: "", hu: "", de: ""};
            if (gameMap === "Budapest") {
                endings = {en: "", hu: "kerület"};
            } else if (gameMap === "Poland") {
                endings = {en: "Voivodeship", hu: "vajdaság"}
            } else {
                if (Round < 4) {
                    endings = {en: "County", hu: "_vármegye", de: ""};
                    beginings = {en: "", hu: "", de: "Komitat_"};
                }
            }
            articleName = `${beginings[lang]}${forCounty}${endings[lang]}`;
        }
    }
    if (onlyArticleName) {
        return articleName;
    } else {
        articleName = articleName.replace(/ /gi, '_');
        return `https://${lang}.wikipedia.org/wiki/${articleName}${(Round === 1) ? `#${translationPiece('geography')}` : ""}`;
    }
}

// *Other Utilities*

function insertToArray(array = new Array(), item, idx = new Number()) {
    let arrayBef = array.slice(0, idx);
    let arrayAft = array.slice(idx, array.length);
    array = arrayBef.concat([item].concat(arrayAft));
    return array;
}

function removeFromArray(array = new Array(), idx = new Number()) {
    let arrayBef = array.slice(0, idx);
    let arrayAft = array.slice(idx + 1, array.length);
    array = arrayBef.concat(arrayAft);
    return array;
}

function removeLetter(idx = new Number(), string = new String()) {
    return string.slice(0, idx) + string.slice(idx + 1, string.length);
}

const urlParams = new URLSearchParams(window.location.search);

function handleURL() {
    let imgFolder = "data/img/";
    if (urlParams.get('map') === 'bundesländer' || urlParams.get('map') === 'germany' || urlParams.get('map') === 'wurstspaetzle') {
        imageOrigin = imgFolder + "Karte_Deutsche_Bundesländer_(Plain).svg";
        gameMap = "Germany";
    } else if (urlParams.get('map') === 'modern' || urlParams.get('map') === 'hungary') {
        imageOrigin = imgFolder + "Hungary_counties_(Plain).svg";
        gameMap = "Hungary";
    } else if (urlParams.get('map') === 'romania' || urlParams.get('map') === 'ciorbaiahnie' || urlParams.get('map') === 'taleland') {
        imageOrigin = imgFolder + "Romania_Counties_(Plain).svg";
        gameMap = "Romania";
    } else if (urlParams.get('map') === 'map' || urlParams.get('map') === 'world') {
        imageOrigin = imgFolder + "world-map.svg";
        gameMap = "World";
    } else if (urlParams.get('map') === 'baguettecroissant' || urlParams.get('map') === 'france') {
        imageOrigin = imgFolder + "Regions_France_(Plain).svg";
        gameMap = "France";
    } else if (urlParams.get('map') === 'bp' || urlParams.get('map') === 'budapest') {
        imageOrigin = imgFolder + "Budapest_Districts.svg";
        gameMap = "Budapest";
    } else if (urlParams.get('map') === 'szeiman' || urlParams.get('map') === 'huncities') {
        imageOrigin = imgFolder + "Szeiman_Városok.svg";
        gameMap = "Cities";
    } else if (urlParams.get('map') === 'pizzapasta' || urlParams.get('map') === 'italy') {
        imageOrigin = imgFolder + "Flag_map_of_Italy_with_regions.svg";
        gameMap = "Italy";
    } else if (urlParams.get('map') === 'poland' || urlParams.get('map') === 'polishedmap') {
        imageOrigin = imgFolder + "Regions_of_Poland.svg";
        gameMap = "Poland";

    // Custom maps
    } else if (urlParams.has('map')) {
        imageOrigin = urlParams.get('map');
        gameMap = "Custom";
    
    // Default map
    } else {
        gameMap = "Original";
    }

    // Set the solution based on the URL
    if (urlParams.has('sol')) {
        Solution = replaceSpecialCharacters(CountyList[findItemWithoutAccentmarks(CountyList, urlParams.get('sol'))]);
    }
}

// Create independent variable (from https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/)
function getIndependentValue(data) {
    return data.map((x) => x);
}

// gets a wikipedia page's image that has the key value in its name
function wikiMediaImageSearch(page, key = "Coa", key2 = "CoA") {
    try {
        let data;
        let wikiXHR = new XMLHttpRequest();
        wikiXHR.open("GET",`https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=images&titles=${page}`,false);
        wikiXHR.onload = (e) => {
            data = JSON.parse(wikiXHR.response);
        };
        wikiXHR.send("");
        data = Object.values(data.query.pages)[0].images;
        console.log(data)
        let img;
        for (img of data) {
            if (img.title.includes(key) || img.title.includes(key2) || img.title.includes(key.toLowerCase()) ||  img.title.includes(key.toLowerCase())) {
                break;
            }
        }
        wikiXHR = new XMLHttpRequest();
        wikiXHR.open("GET",`https://api.wikimedia.org/core/v1/commons/file/${img.title}`,false);
        wikiXHR.onload = (e) => {
            data = JSON.parse(wikiXHR.response);
        };
        wikiXHR.send("");
        return data.thumbnail.url;
    } catch (err) {
        console.error(err);
    }
}