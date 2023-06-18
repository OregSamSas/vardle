// **Functions in connection with the language of the interference**

// Sets the language in accordance with browser's preferences
function languageSetup() {
    if ((navigator.language || navigator.userLanguage) === "hu") {
        Language = "hu";
    } else {
        Language = "en";
    }
}

// Replacing translations
function localisation() {
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
        if (finishedRounds[Round] === "won") {
            if(Guesses.length === 1) {
                finishAreatext = `${translationPiece('anal1.0')} ${numberOfTries} ${translationPiece('anal1.3')}.`;
            } else {
                finishAreatext = `${translationPiece('anal1.1')} ${Guesses.length} ${translationPiece('anal1.2')} ${numberOfTries} ${translationPiece('anal1.3')}.`;
            }
        } else {
            finishAreatext = `${translationPiece('anal2.1')}&nbsp;<i>${((imageOrigin.includes("Budapest")) ? ((arabicInSuggestions) ? romanToArabic(replaceSpecialCharacters(Solution, true).toUpperCase().slice(0, Solution.length - 1)) + '.' : replaceSpecialCharacters(Solution, true).toUpperCase()) : replaceSpecialCharacters(Solution, true))}</i>${translationPiece('anal2.2')}.`;
        }
        finishArea.childNodes[1].innerHTML = finishAreatext;
        finishAreatext =  document.querySelector('#finished > #wonImg > #finish-text').innerHTML;
        if (finishedRounds[Round] === "won") {
            finishAreatext = replaceInnerTextContent(finishAreatext, translationPiece('win'));
        } else {
            finishAreatext = replaceInnerTextContent(finishAreatext, translationPiece('lose'));
        }
        document.querySelector('#finished > #wonImg > #finish-text').innerHTML = finishAreatext;
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