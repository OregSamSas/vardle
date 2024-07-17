// **Functions in connection with the language of the interference**

// Sets the language in accordance with browser's preferences
function languageSetup() {
    if (Language == undefined) {
        if ((navigator.language || navigator.userLanguage) === "hu") {
            Language = "hu";
        } else if ((navigator.language || navigator.userLanguage) === "de") {
            Language = "de";
        } else {
            Language = "en";
        }
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

    // Localise finish text
    let finishArea = document.getElementById('finished');
    if (finishArea != null) {
        let finishAreatext = finishArea.childNodes[1].innerHTML
        if (finishedRounds[Round] === "won") {
            let guessescount, triescount;
            if (Round === 3) {
                guessescount = OtherGuesses[Round-1].length;
                triescount = numberOfTriesForImage;
            } else {
                triescount = guesslinesCount;
                if (Round===0) {
                    guessescount = Guesses.length;
                } else {
                    guessescount = OtherGuesses[Round - 1].length;
                }
            }
            if(guessescount === 1) {
                finishAreatext = `${translationPiece('anal1.0')} ${triescount} ${translationPiece('anal1.3')}.`;
            } else {
                finishAreatext = `${translationPiece('anal1.1')} ${guessescount} ${translationPiece('anal1.2')} ${triescount} ${translationPiece('anal1.3')}.`;
            }
        } else {
            if (Round === 0 || Round === 2 || Round === 4) {
                let formattedSolution;
                if (Round === 0) {
                    formattedSolution = ((gameMap === "Budapest") ? ((arabicInSuggestions) ? romanToArabic(solutionText.toUpperCase().slice(0, Solution.length - 1)) + '.' : solutionText.toUpperCase()) : solutionText);
                } else if (Round === 2) {
                    let furthestText = replaceSpecialCharacters(Furthest.name, true);
                    formattedSolution = ((gameMap === "Budapest") ? ((arabicInSuggestions) ? romanToArabic(furthestText.toUpperCase().slice(0, furthestText.length - 1)) + '.' : furthestText.toUpperCase()) : furthestText);
                } else {
                    formattedSolution = replaceSpecialCharacters(Capital, true);
                }
                finishAreatext = `${translationPiece('anal2.1')}&nbsp;${translationPiece('anal2.2')}&nbsp;<i>${formattedSolution}</i>${translationPiece('anal2.3')}.`;
            } else {
                finishAreatext = `${translationPiece('anal2.1')}&nbsp;`;
            }
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

    // Questions for further rounds
    let quest = document.getElementById('border-question');
    if (quest != null) {
        quest.innerHTML = `${translationPiece('borders1')}${translationPiece('borders1.5')} ${closestTerritories.length} ${translationPiece('borders2')} <i>${solutionText}</i> ?`
    }
    quest = document.getElementById('img-question');
    if (quest != null) {
        quest.innerHTML = `${translationPiece('coa1')} <i>${solutionText}</i>?`
    }
    quest = document.getElementById('shape-question');
    if (quest != null) {
        quest.innerHTML = `${translationPiece('shape-q1')} <i>${solutionText}</i> ${translationPiece('shape-q2')}?`
    }
    quest = document.getElementById('farthest-question');
    if (quest != null) {
        quest.innerHTML = `${translationPiece('borders1')} ${translationPiece('farthest')} <i>${solutionText}</i>?`
    }
    quest = document.getElementById('capital-question');
    if (quest != null) {
        quest.innerHTML = `${translationPiece('capital1')} <i>${solutionText}</i> ${translationPiece('capital2')}?`
    }

    // Translate wikipedia link
    updateWikiLinkOnPage();
}

function translationPiece(key, lang) {
    if (lang == undefined || lang == null) lang = Language;
    let returnWith;
    try {
        returnWith = translations[key][lang];
    } catch (error) {
        console.log(`Couldn't find translation for "${key}" in language "${lang}".`);
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