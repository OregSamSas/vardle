// **UI scripts for guesses**
// (mostly functions for the gray stripes evaluating the guesses (called "guesslines"))


// When the form is submitted
function handleGuess() {
    let guessInput = document.querySelector('input[aria-autocomplete="list"]');
    let guess = guessInput.value;
    if (imageOrigin.includes("Budapest") && arabicInSuggestions) {
        guess = arabicToRoman(guess) + ".";
    }
    guess = replaceSpecialCharacters(guess);
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

function placeGuessInput() {
    let template = document.getElementById('tmpl-guessinput').content.firstElementChild.cloneNode(true);
    let insertTo = document.getElementById('guessInput');
    if (insertTo != null) insertTo.appendChild(template);
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
    if (Round === 0) {
        for (let guessNum in Guesses) {
            if (guessNum < num) {
                guessAnalisys(Guesses[guessNum], guessNum);
            }
        }
    }
    window.dispatchEvent(new Event('resize'));
}

// Replaces a gray guess row with an analitics row about the latest guess
function placeAnalisys(count, name, dist, distUnit, dir, percent) {
    count = parseInt(count);
    let guessLine = document.getElementById('guesses').children[4 * count];
    let newLine = document.getElementById('tmpl-guess-analisys').content.cloneNode(true);
    newLine.id = `guess-line${Guesses.length}`;
    let partyEmoji = newLine.children[2].childNodes[1].firstChild;
    try {
        newLine.children[0].childNodes[1].innerHTML = ((imageOrigin.includes("Budapest") && arabicInSuggestions) 
                                                        ? romanToArabic(replaceSpecialCharacters(name, true).toUpperCase().slice(0, name.length-1)) + '.'
                                                        : replaceSpecialCharacters(name, true));
        newLine.children[1].innerHTML = ((Scale == undefined) ? '?' : insertSpacesToNum(dist)) + " " + distUnit;
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
    let finished = false;
    
    // Write out win text
    if (dir === 'yo') {
        finished = true;
        finishedBottom(finishArea, false, guessLine);
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
    }
    // Write out lose text
    else if (count + 1 === numberOfTries) {
        finished = true;
        finishedBottom(finishArea, true, guessLine);
    }

    if (finished) {
        // Cancel rotation when no tries left too
        removeRotation();

        // Show image, if hidden
        showShapeOfTerritory();

        // Buttons for proceeding to later rounds
        if (finishedRounds.length - 1 < Round) {
            finishedRounds.push((Won) ? "won" : "lost");
        } else {
            finishedRounds[Round] = ((Won) ? "won" : "lost");
        }
        buttonEventListeners('rounds');
        if (Round === 0) {
            document.querySelector('#prev-round > svg').style = "filter: grayscale(1)"
        } else if (Round === numberOfRounds) {
            document.querySelector('#next-round > svg').style = "filter: grayscale(1)"
        }
    }

    // Translate newly placed elements
    localisation();

    // Button for showing the map
    buttonEventListeners("show-map");
}

// When finished guessing (either ran out of tries or guessed correctly), the input field is replaced with this thing
function finishedBottom(template, lose = false, guessLine = undefined) {
    let myPlace = removeGuessArea(true);
    myPlace.appendChild(template);
    let wikiname = '';
    if (Round === 0 || Round === 1) {
        wikiname = Solution;
    } else if (Round === 2) {
        wikiname = undefined;
    }
    if (guessLine != undefined) template.childNodes[5].childNodes[5].setAttribute('href', getWikipediaLink(wikiname, Language));
    if (lose) {
        let finishImage = template.childNodes[3].childNodes[3].firstElementChild;
        finishImage.setAttribute('src', 'img/loseMeme.jpg');
        finishImage.setAttribute('alt', '😒');
    }
}

// Remove the input field
function removeGuessArea(isReturn) {
    let guessArea = document.querySelector('.my-2:not(button)');
    guessArea.innerHTML = "";
    if (isReturn) {
        return guessArea;
    }
}

// Evaluates a guess and puts it on the page
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
                distance = Math.floor(distance * ((Scale === undefined) ? 1 : Scale)); // m
                if (sizePercent) {
                    let size0 = metaData.width * metaData.height;
                    let size1 = otherMetaData[myGuess].width * otherMetaData[myGuess].height;
                    accuracy = (normalModulus((size1 - size0), size0) / size0) * 100;
                } else {
                    accuracy = (1 - distance / ((Scale === undefined) ? 1 : Scale) / Furthest.dist)*100;
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