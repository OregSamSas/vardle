// **Functions for the suggestion, or the guess-options list**

// Creates the Suggestion List
function insertAutoList(inputPlace, orderedNameList = CountyListOrdered) {
    SuggestionList = [];

    // making the UI
    let completeList = document.getElementById(inputPlace.getAttribute('aria-controls'));
    let countiesElement = createCountiesElement();
    completeList.appendChild(countiesElement);
    let inputValue = inputPlace.value;

    // Selecting relevant names
    let searchIn, searchKey, searchAlternative;

    if (gameMap === "Budapest") {
        if (parseInt(inputValue)) {
            inputValue = arabicToRoman(parseInt(inputValue));
        }
    }
    searchKey = replaceSpecialCharacters(removeAccents(inputValue));
    for (let county=0; county<orderedNameList.length; county++) { // Priority
        searchIn = removeAccents(orderedNameList[county].slice(0, inputValue.length));
        if (searchIn.includes(searchKey)) { // First the ones that starts with it
            addSuggestion(orderedNameList[county], countiesElement, inputPlace.id, orderedNameList[county], completeList.id)
        }
    }

    searchKey = replaceSpecialCharacters(inputValue, false, true).toLowerCase();
    for (let county=0; county<orderedNameList.length; county++) {
        searchIn = removeAccents(orderedNameList[county].toLowerCase());
        searchAlternative = orderedNameList[county].toLowerCase();
        if (!SuggestionList.includes(orderedNameList[county])) {
            if (searchIn.includes(searchKey) || searchAlternative.includes(searchKey)) { // Fullfills search keyword (important to have the same letter case)
                    addSuggestion(orderedNameList[county], countiesElement, inputPlace.id, orderedNameList[county], completeList.id)
            } else {
                searchIn = replaceSpecialCharacters(replaceAbbreviations(replaceSpecialCharacters(searchIn, true))).toLocaleLowerCase(); // Check if the search key is without abbreviations
                if (searchIn.includes(searchKey)) {
                    addSuggestion(orderedNameList[county], countiesElement, inputPlace.id, orderedNameList[county], completeList.id)
                }
            }
        }
    }
}

function addSuggestion(suggestion, countiesElement, inputID, countyID, suggestionListID) {
        SuggestionList.push(suggestion);
        let countyElement = createCountyElement(countiesElement.childElementCount, inputID, countyID, suggestionListID);
        countiesElement.appendChild(countyElement);
}

// Creates the Suggestions list element for Counties
function createCountiesElement() {
    return document.getElementById('tmpl-county-suggestions').content.firstElementChild.cloneNode(true);
}

// Creates an item of the Counties Suggestion list
function createCountyElement(elementIndex, MyInputId, CountyName, countySuggContId) {
    CountyName = replaceSpecialCharacters(CountyName, true);
    if (gameMap === "Budapest" && arabicInSuggestions) {
        CountyName = romanToArabic(CountyName.toUpperCase().slice(0, CountyName.length - 1)) + '.';
    }
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
    divText.className = 'm-0.5 bg-white p-1 cursor-pointer transition-all trans05 uppercase';
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
            if (replaceSpecialCharacters(thisItem.firstChild.innerHTML) === titleCase(value)) {
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
    insertAutoList(inp, (Round === 4) ? Cities.map((x) => x.name).sort(): CountyListOrdered);
}
