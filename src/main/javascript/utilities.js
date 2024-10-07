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
        return false;
    }
}

// *Input utilities*

// Clump function to keep a value between two limits
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


// Function to find the first parent of a specific type of an element
function findFirstParentOfType(element, type) {
    let parent = element.parentNode;
    while (parent) {
        if (parent.nodeName.toUpperCase() === type.toUpperCase()) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return null;
}

function guessInpAndGiveUpBtn() {
    placeGuessInput();
    let giveupbutton = document.getElementById('tmpl-giveup').content.cloneNode(true);
    document.querySelector('#guessInput > .my-2').appendChild(giveupbutton);
    inputEventListeners();
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
            list[list.indexOf(element)] = {roman: element, arabic: romanToArabic(element.toUpperCase().match(/[^°]/gi).join('').match(/[^\.]/gi).join(''))};
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
            if (a === b) {
                return 0;
            } else if ([a, b].sort()[0] === a) {
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
        let i = 0;
        while (arabicNums[romanNums.indexOf(romanNum[i])] === currentvalue) {
            i += 1;
            nextvalue = arabicNums[romanNums.indexOf(romanNum[i])];
        }
        if (nextvalue === undefined) {
            nextvalue = 0;
        }
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
    if (parseFloat(num) > 10000) {
        console.error(`The roman number generator only works up to 10K, ${num} is invalid input.`)
        return "⚠";
    }
    num = num.toString();
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
        // Decode (replace special characters with their original form)
        return text.replace(/\_/g, "'").replace(/–/g, ' ').replace(/°/g, '.');
    } else {
        // Encode (replace special characters with their encoded form)
        return text.replace(/\'/g, '_').replace(/ /g, '–').replace(/\./g, '°');
    }
}

function removeAccents(txt) {
    return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
}

// Function to find an item in a list without minding the accent marks
function findItemWithoutAccentmarks(list, item) {
    for (let i = 0; i < list.length; i++) {
        if (removeAccents(list[i]).toLowerCase() === removeAccents(item).toLocaleLowerCase()) {
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

// Check if a character is a letter
function isChar(c) {
    return typeof c === 'string' && c.length == 1;
}

// Function to beautify high distance values 
// (It cuts further digits than one-tenthousandth and adds spaces to the thousands)
function insertSpacesToNum(int) {
    if (isNaN(int)) {
        return "NaN";
    } else {
        if (parseFloat(int) < 0) {
            newint = -parseFloat(int);
        } else {
            newint = parseFloat(int);
        }
        newint = parseInt(newint).toString();
        if(newint.length > 3) {
            for(let i = newint.length-3; i > 0; i-=3) {
                newint = `${newint.slice(0, i)}&nbsp;${newint.slice(i, newint.length)}`;
            }
        }
        if (parseInt(int) != parseFloat(int)) {
            newint += (compressNum(parseFloat(Math.abs(int)) - (parseInt(Math.abs(int))), 4)).toString().slice(1);
        }
        return newint;
    }
}


// Function for making a string to TitleCase (all initial letters are capitalised)
// Modified version of https://www.freecodecamp.org/news/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27/
function titleCase(str = "") {
    let replacedemdashes = [];
    while (str.includes('-') && str.includes('–')) {
        replacedemdashes.push(str.indexOf('–'));
        str = str.slice(0, replacedemdashes[replacedemdashes.length - 1]) + '-' + str.slice(replacedemdashes[replacedemdashes.length - 1]+1, str.length);
    }
    str = str.toLowerCase();
    str = str.split(' ');
    for (let i = 0; i < str.length; i++) {
        let emdash = false;
        if (str[i].includes('–')) {
            emdash = true;
        }
        // Splits the text at opening parenthesis (the word coming after those should be capitalised), but leaves the opening parenthesis in the text
        if (str[i].includes('(')) {
            str[i] = str[i].split('(');
            // Split removed the "(" character, so we add it back
            for (let j = 0; j < str[i].length-1; j++) {
                str[i][j] += '(';
            }
        } else {
            str[i] = [str[i]];
        }
        let element;
        for (let index = 0; index < str[i].length; index++) {
            element = str[i][index];
            // Wrap out the substrings separated by hyphens next to after element
            let splitWithHypen = element.split(((emdash) ? '–' : '-'))
            for (let j = splitWithHypen.length - 1; j > -1; j--) {
                str[i] = insertToArray(str[i], splitWithHypen[j], index + 1);
            }
            str[i] = removeFromArray(str[i], index); // Delete the original element
            index += splitWithHypen.length - 1; // Skip the elements that were added
        }
        for(let j = 0; j < str[i].length; j++) {
            if (["and", "és", "an", "am", "die", "der", "das", "im"].includes(str[i][j].toLowerCase())) { // Do not capitalise conjunctive words (és = and)
                str[i][j] = str[i][j].toLowerCase();
            } else {
                if (str[i][j].charAt(1) === "'" && (str[i][j].charAt(0).toLowerCase() === 'd' || str[i][j].charAt(0) === 'l')) {
                    // if the case is d'Aosta or l'Homme or smg like that
                    str[i][j] = str[i][j].slice(0, 2) + str[i][j][2].toUpperCase() + str[i][j].slice(3);
                } else if (str[i][j].charAt(0) === "'") {
                    // if the first letter of the word omitted and therefore an apostrophe is at the beginning
                    str[i][j] = str[i][j].charAt(0) + str[i][j].charAt(1).toUpperCase() + str[i][j].slice(2);
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
        str[i] = str[i].replace(/\((–|-)/g, '('); // No need to have emdash or hyphen after "("
    }
    str = str.join(' ');
    replacedemdashes.forEach(pos => {
        str = str.slice(0, pos) + '–' + str.slice(pos+1, str.length);
    });
    return str;
}

// From https://stackoverflow.com/questions/17267329/converting-unicode-character-to-string-format
function unicodeToChar(text) {
    if (!text.includes("U+") && !text.includes("\\u")) {
        return text;
    }
    if (text.includes("U+")) {
        text = text.replace(/U\+/, '\\u');
    }
    text = text.toUpperCase();
    text = text.replace('\\U', '\\u');
    console.log(text);
    return text.replace(/\\u[\dA-F]{4}/gi, 
           function (match) {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
           });
}

function replaceAbbreviations(txt = "") {
    return txt.replace(/fr\./gi, 'French')
                .replace(/rep\. /gi, 'Republic of ')
                .replace(/([a-z])rep\./gi, txt[txt.indexOf("rep.")-1] += 'republic')
                .replace(/rep\./gi, 'Republic')
                .replace(/dem\./gi, 'Democratic')
                .replace(/ pdr/gi, " People's Democratic Republic")
                .replace(/pdr\./gi, "People's Democratic Republic of")
                .replace(/is\./gi, 'Islands')
                .replace(/st\./gi, ((gameMap == "Germany") ? 'Sankt' : 'Saint'))
                .replace(/eq\./gi, 'Equatorial')
                .replace(/herz\./gi, 'Herzegovina')
                .replace(/vin\./gi, 'Vincent')
                .replace(/gren\./gi, 'the Grenadines')
                .replace(/barb\./gi, 'Barbuda')
                .replace(/u\.s\.s\.r\./gi, 'Soviet Union')
                .replace(/u\.s\.a\./gi, 'United States of America')
                .replace(/u\.s\./gi, 'United States')
                .replace(/u\.k\./gi, 'United Kingdom')
                .replace(/u\.a\.e\./gi, 'United Arab Emirates')
                .replace(/am\./gi, 'American')
                .replace(/br\./gi, 'British');
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
    if (!(CountyList.length === 1 && (CountyList[0] === "Balaton" || CountyList[0] === Solution))) {
        if (CountyList.length === 2 && CountyList.includes("Balaton") && CountyList.includes(Solution)) {
            randomCounty = CountyList.indexOf(Solution);
        } else {
            while (CountyList[randomCounty] === "Balaton" || CountyList[randomCounty] === Solution) {
                randomCounty = randomElement();
            }
        }
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
function getIndexByProperty(array, propertyName, propertyValue = undefined, all = false) {
    let returnList  = [];
    if (typeof propertyName === 'object') {
        if (typeof propertyValue !== 'object') {
            propertyValue = new Array(propertyName.length).fill(propertyValue);
        }
    }
    if (typeof propertyValue === 'object') {
        if (typeof propertyName !== 'object') {
            propertyName = new Array(propertyValue.length).fill(propertyName);
        }
    }
    if (array != undefined) {
        for (let i = 0; i < array.length; i++) {
            let numberOfProperties = 1;
            let currPropertyName;
            let currPropertyValue;
            if (typeof propertyName === 'object') {
                numberOfProperties = propertyName.length;
            } else {
                currPropertyName = propertyName;
                currPropertyValue = propertyValue;
            }
            let isCorrectItem = true;
            for (let j = 0; j < numberOfProperties; j++) {
                if (typeof propertyName === 'object') {
                    currPropertyName = propertyName[j];
                    currPropertyValue = propertyValue[j];
                }
                if (currPropertyName !== undefined) {
                    if (!(
                        (array[i][currPropertyName] === currPropertyValue && array[i][currPropertyName] !== undefined) 
                        ||
                        (currPropertyValue === undefined && array[i][currPropertyName] !== undefined)
                    )) {
                        isCorrectItem = false;
                    }
                } else {
                    let thisCorrect = false;
                    for (let key in array[i]) {
                        if (array[i][key] === currPropertyValue) {
                            thisCorrect = true;
                        }
                    }
                    if (!thisCorrect) {
                        isCorrectItem = false;
                    }
                }
            }
            if (isCorrectItem) {
                if (all) {
                    returnList.push(i);
                } else {
                    return i;
                }
            }
        }
    }
    if (returnList.length === 0) {
        return -1;
    } else {
        return returnList;
    }
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
                endings = {en: "", hu: "_kerület", de: "_Budapester_Bezirk"};
            } else if (gameMap === "Poland") {
                endings = {en: "_Voivodeship", hu: "_vajdaság"}
            } else {
                if (Round < 4) {
                    endings = {en: "_County", hu: "_vármegye", de: ""};
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
        return `https://${lang}.wikipedia.org/wiki/${articleName}${(Round === 1) ? `#${translationPiece('geography')}` : ((Round === 5) ? `#${translationPiece('citysect')}` : "")}`;
    }
}

// *Other Utilities*

function insertToArray(array = new Array(), item, idx = new Number()) {
    let arrayBef = array.slice(0, idx);
    let arrayAft = array.slice(idx, array.length);
    array = arrayBef.concat([item].concat(arrayAft));
    return array;
}

function removeFromArray(array = new Array(), idxOrItem) {
    let idx = idxOrItem;
    if (typeof idxOrItem !== 'number') {
        if (typeof idxOrItem === 'object') {
            idx = getIndexByProperty(array, Object.keys(idxOrItem)[0], idxOrItem[Object.keys(idxOrItem)[0]]);
        } else {
            idx = array.indexOf(idxOrItem);
            if (idx < 0) {
                return array;
            }
        }
    }
    let arrayBef = array.slice(0, idx);
    let arrayAft = array.slice(idx + 1, array.length);
    array = arrayBef.concat(arrayAft);
    return array;
}

function removeLetter(idx = new Number(), string = new String()) {
    return string.slice(0, idx) + string.slice(idx + 1, string.length);
}

// Create independent variable (from https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/)
function getIndependentValue(data) {
    return data.map((x) => x);
}

// gets a wikipedia page's image that has the key value in its name
function wikiMediaImageSearch(page, key = "Coa", key2 = "CoA", key3 = "Coat of arms", key4 = "címer") {
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
            if (img.title.includes(key) || img.title.includes(key2) || img.title.includes(key3) || img.title.includes(key4) 
                || img.title.includes(key.toLowerCase()) ||  img.title.includes(key2.toLowerCase()) || img.title.includes(key3.toLowerCase()) || img.title.includes(key4.toLowerCase())) {
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
