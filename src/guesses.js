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
        if (Round === 0) {
            if (Guesses.includes(guess)) {
                window.alert(translationPiece('already'));
            } else if (CountyList.includes(guess)) {
                Guesses.push(guess);
                guessInput.value = "";
                guessAnalisys(guess);
            } else {
                window.alert(translationPiece('unknown'));
            }
        } else {
            if (OtherGuesses[Round - 1].includes(guess)) {
                window.alert(translationPiece('already'));
            } else if (Round < 3 && CountyList.includes(guess)) {
                OtherGuesses[Round - 1].push(guess);
                guessInput.value = "";
                guessAnalisys(guess);
            } else {
                window.alert(translationPiece('unknown'));
            }
        }
    }
}

function placeGuessInput() {
    let guessArea = document.querySelector('#guessInput > .my-2');
    if (guessArea != null) {
        guessArea.remove();
    }
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

function getGuesslinesCount(forRound = new Number()) {
    guesslinesCount = (((forRound === 3) ? 0 :
                        ((forRound === 2) ? numberOfTries :
                        (forRound === 1) ? closestTerritories.length + parseInt(numberOfTries*0.5) :
                        numberOfTries)));
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
    } else {
        for (let guessNum in OtherGuesses[Round - 1]) {
            if (guessNum < num) {
                console.log(guessNum)
                guessAnalisys(OtherGuesses[Round - 1][guessNum], guessNum);
            }
        }
    }
    window.dispatchEvent(new Event('resize'));
}

// Replaces a gray guess row with an analitics row about the latest guess
function placeAnalisys(count, name, dist, distUnit, dir, percent) {
    count = parseInt(count);
    let modifier = ((Round === 1) ? 2 : 4);
    let guessLine = document.getElementById('guesses').children[modifier * count];
    let newLine = document.getElementById('tmpl-guess-analisys').content.cloneNode(true);

    if (Round === 1) {
        if (dir === 'yes' || dir === 'yo') {
            let correspondingImge = document.querySelector(`#mainImage > div > svg > g > #${name}`);
            correspondingImge.parentElement.parentElement.parentElement.className += " back-green-600"
        }
        newLine.firstElementChild.className += " col-span-6";
        newLine.children[1].remove();
        newLine.children[2].remove();
    }

    // appearing animation
    newLine.childNodes.forEach(line => {
        line.style = "visibility: hidden";
        setTimeout(() => {
            line.style = "";
        }, 10);
    });

    let partyEmoji;
    partyEmoji = newLine.children[((Round === 1) ? 1 : 2)].childNodes[1].firstChild;
    try {
        newLine.children[0].childNodes[1].innerHTML = ((imageOrigin.includes("Budapest") && arabicInSuggestions) 
                                                        ? romanToArabic(replaceSpecialCharacters(name, true).toUpperCase().slice(0, name.length-1)) + '.'
                                                        : replaceSpecialCharacters(name, true));
        if (Round !== 1) newLine.children[1].innerHTML = ((computingMethod.includes("bord") && dist === 0 && dir !== 'yo') ? translationPiece("bord") : ((Scale == undefined) ? '?' : insertSpacesToNum(dist)) + " " + distUnit);
        partyEmoji.setAttribute('alt', Directions[dir].alt);
        partyEmoji.setAttribute('src', 'https://em-content.zobj.net/thumbs/240/twitter/' + Directions[dir].img)
        if (Round !== 1) newLine.children[3].innerHTML = (compressNum(percent, (percent > 90) ? 1 : 0)).toString() + '%';
    } catch (error) {
        console.error(error);
    }
    if (guessLine != undefined) {
        guessLine.after(newLine);
        guessLine.remove();
    }

    // Both needed on wining and on losing as well
    let finished = false;
    
    // Write out win text
    if (dir === 'yo') {
        finished = true;
        let partyEmojiPos = partyEmoji.getBoundingClientRect();
        try {
            // Confetti Animation
            if(!finishedRounds[Round]) { // Display confetti animation only at first
                confetti({
                    particeCount: 150,
                    startVelocity: 31,
                    spread: 70,
                    origin: {
                        x: partyEmojiPos.x / window.innerWidth,
                        y: partyEmojiPos.y / window.innerHeight
                    }
                });
            }
        } catch (err) {console.error(err);}
        Won = true;
    }
    // Write out lose text
    else if (count + 1 === guesslinesCount) {
        Won = false;
        finished = true;
    }

    if (finished) {
        endOfGuessing(Won, guessLine)
    } else {
        localisation();
    }
}

function endOfGuessing(win = new Boolean(), guessLine) {
    let finishArea = document.getElementById('tmpl-finish').content.firstElementChild.cloneNode(true);
    finishedBottom(finishArea, !win, guessLine);
    // Cancel rotation when no tries left too
    removeRotation();

    // Buttons for proceeding to later rounds
    if (finishedRounds.length - 1 < Round) {
        finishedRounds.push((win) ? "won" : "lost");
    } else {
        finishedRounds[Round] = ((win) ? "won" : "lost");
    }

    // Show image, if hidden
    showShapeOfTerritory();

    // Translate newly placed elements
    localisation();

    // Button for showing the map
    buttonEventListeners("show-map");
}

// When finished guessing (either ran out of tries or guessed correctly), the input field is replaced with this thing
function finishedBottom(template, lose = false, guessLine = undefined) {
    if (template == "") {
        template = document.getElementById('tmpl-finish').content.firstElementChild.cloneNode(true);
    }
    let myPlace = removeGuessArea(true);
    myPlace.appendChild(template);
    if (guessLine != undefined) {
        updateWikiLinkOnPage(template.childNodes[5].childNodes[5]);
    }
    if (lose) {
        let finishImage = template.childNodes[3].childNodes[3].firstElementChild;
        finishImage.setAttribute('src', 'img/loseMeme.png');
        finishImage.setAttribute('alt', '😒');
    }
    if (Round === 1) {
        let solutionsDiv = document.createElement('div');
        solutionsDiv.className = "flex justify-center flex-col  items-center text-center mt-4 mb-4";
        let textDiv = document.createElement('div');
        textDiv.setAttribute('ln', 'goodansw');
        solutionsDiv.appendChild(textDiv);
        let listDiv = document.createElement('div');
        listDiv.className = "flex gap-2 mb-3 mt-4 justify-center items-center flex-wrap no-translate";
        let listitem;
        for (terr of closestTerritories) {
            listitem = document.createElement('div');
            listitem.innerHTML = replaceSpecialCharacters(terr.name, true);
            listitem.className = "font-bold uppercase rounded border-2 px-3 pt-1 pb-1 rounded-md";
            if (OtherGuesses[0].includes(terr.name)) {
                listitem.className += " back-green-600";
            }
            listDiv.appendChild(listitem);
        }
        solutionsDiv.appendChild(listDiv);
        myPlace.firstElementChild.firstElementChild.after(solutionsDiv);
    }
    if (Round === 3) {
        redesignCoaButtons(true);
    }

    buttonEventListeners('rounds');
    if (Round === 0) {
        document.querySelector('#prev-round > svg').style = "filter: grayscale(1)";
    } else if (Round === numberOfRounds - 1) {
        document.querySelector('#next-round > svg').style = "filter: grayscale(1)";
    }
}

function redesignCoaButtons(finished = false) {
    let imgButtons = document.querySelectorAll('#mainImage > div');
    let button;
    for (let img = 0; img < imgButtons.length; img++) {
        button = imgButtons[img];
        if (finished) button.setAttribute('role', "");
        let n = button.firstElementChild.getAttribute('name');
        if (n === Solution && finished) {
            button.className += " good-img";
        } else  {
            OtherGuesses[Round-1].forEach(element => {
                if (n === coaImages[element].name) {
                    button.className = "wrong-img";
                    if (OtherGuesses[Round-1].indexOf(element) == OtherGuesses[Round-1].length-1) {
                        button.className += " shake";
                    }
                }
            });
        }
    }
}

function updateWikiLinkOnPage(a = document.querySelector('a[href*="wiki"]')) {
    if (a != null) {
        let wikiname = '';
        if (Round < 4) {
            wikiname = Solution;
        } else if (Round === 5) {
            wikiname = undefined;
        }
        a.setAttribute('href', getWikipediaLink(wikiname, Language));
    }
}

// Remove the input field
function removeGuessArea(isReturn) {
    let guessArea = document.querySelector('#guessInput > .my-2');
    guessArea.innerHTML = "";
    if (isReturn) {
        return guessArea;
    }
}

// Evaluates a guess and puts it on the page
function guessAnalisys(myGuess, specialplace) {
    if (CountyList.includes(myGuess)) console.log(getWikipediaLink(myGuess, Language));
    if (((Round === 0) ? Guesses.length : OtherGuesses[Round - 1].length) < guesslinesCount + 1) {
        if (Round === 1) {
            let solution = 0;
            for (let i of closestTerritories) {
                if (i != undefined) {
                    if (i.name === myGuess) {
                        solution = 1;
                    }
                }
            }
            let place = parseInt((specialplace == undefined) ? OtherGuesses[0].length - 1 : specialplace);
            let solved = 0;
            for (let item = 0; item < place + 1; item ++) {
                for (let j of closestTerritories) {
                    if (j != undefined) {
                        if (j.name === OtherGuesses[0][item]) {
                            solved += 1;
                        }
                    }
                }
            }
            if (solved === closestTerritories.length) {
                placeAnalisys(place, myGuess, 0, '', 'yo', 0);
            } else if (solution) {
                placeAnalisys(place, myGuess, 0, '', 'yes', 0);
            } else {
                placeAnalisys(place, myGuess, 0, '', 'no', 0);
            }
        } else {
            let solution = (Round === 0) ? Solution : ((Round === 2) ? Furthest.name : "");
            let numofguesses = (Round === 0) ? Guesses.length-1 : OtherGuesses[Round-1].length-1;
            if (myGuess === solution) {
                placeAnalisys(numofguesses, solution, 0, 'm', 'yo', 100);
            } else {
                let guessPath = document.querySelector("#mapTemplate > svg > g > #" + myGuess);
                let mainPath = absToRel(document.querySelector("#mapTemplate > svg > g > #" + solution).getAttribute('d'));
                if (guessPath != undefined) {
                    otherMetaData[myGuess] = trackPath(absToRel(guessPath.getAttribute('d')), {}, mainPath, true);
                    console.log(otherMetaData[myGuess])
                } else {
                    otherMetaData[myGuess] = {midx: 0, midy: 0};
                }
                let dir = 0;
                let dirs = ['nn', 'nw', 'ww', 'sw', 'ss', 'se', 'ee', 'ne', '?'];
                let midx0 = metaData.midx;
                let midy0 = metaData.midy;
                let midx1 = otherMetaData[myGuess].midx;
                let midy1 = otherMetaData[myGuess].midy;
                let distance;
                if (computingMethod === "borders" || computingMethod === "bord+cent") {
                    distance = otherMetaData[myGuess]["closest-border"];
                } else {
                    distance = distanceOf(midx0, midy0, midx1, midy1);
                }
                let unit = "m";
                let accuracy = 0;
                if (guessPath != "") {
                    distance = Math.floor(distance * ((Scale === undefined) ? 1 : Scale)); // m
                    if (sizePercent) {
                        let size0 = parseInt(metaData.width * metaData.height);
                        let size1 = parseInt(otherMetaData[myGuess].width * otherMetaData[myGuess].height);
                        accuracy = (normalModulus((size1 - size0), size0) / size0) * 100;
                    } else {
                        if ((computingMethod === "borders" || computingMethod === "bord+cent") && distance === 0) {
                            accuracy = 99.9;
                        } else {
                            accuracy = (1 - distance / ((Scale === undefined) ? 1 : Scale) / Furthest.dist)*100;
                        }
                    }
                    if ((distance > 99999 && distanceUnit === "mixed") || distanceUnit === "km") {
                        unit = "km";
                        distance = Math.floor(distance / 1000); // km
                    }
                    if (distanceUnit === "miles") {
                        unit = translationPiece('miles');
                        distance = Math.floor(distance * 0.00062137); // miles
                    }
                    if (computingMethod === "borders") {
                        if (distance > 0) {
                            dir = otherMetaData[myGuess].dir;
                        }
                    } else {
                        dir = getDirOfVector(midx0, midy0, midx1, midy1);
                    }
                    if (computingMethod === "borders" && distance === 0) {
                        dir = 8;
                    } else {
                        dir = Math.round(dir / 45) % 8; // It can be (e.g. 7.6) rounded up to 8 which does not included in the following list => %8 is needed
                    }
                }
                let place = ((specialplace == undefined) ? numofguesses : specialplace);
                placeAnalisys(place, (Round === 0) ? Guesses[place] : OtherGuesses[Round-1][place], distance, unit, dirs[dir], accuracy);
            }
        }
    }
}