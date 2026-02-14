// **UI scripts for displaying guesses**
// (mostly functions for the gray stripes evaluating the guesses (called "guesslines"))
// ** And for handling and saving them **

// When the form is submitted
function handleGuess(guessInput = document.querySelector('input[aria-autocomplete="list"]'), test=false) {
    let guess = guessInput.value;
    if (gameMap === "Budapest" && !isNaN(guess) && guess != "") {
        guess = arabicToRoman(guess) + ".";
    }
    console.log(Cities)
    guess = replaceSpecialCharacters(guess);
    if(guess != '') {
        if (Round === 0) {
            if (Guesses.includes(guess)) {
                if (test) {
                    return translationPiece('already');
                } else {
                    window.alert(translationPiece('already'));
                }
            } else if (CountyList.includes(guess)) {
                Guesses.push(guess);
                guessInput.value = "";
                if (test) {
                    return true;
                } else {
                    guessAnalisys(guess);
                }
            } else {
                if (test) {
                    return translationPiece('unknown');
                } else {
                    window.alert(translationPiece('unknown'));
                }
            }
        } else {
            while(OtherGuesses.length < numberOfRounds) {
                OtherGuesses.push([]);
            }
            if (OtherGuesses[Round - 1].includes(guess)) {
                if (test) {
                    return translationPiece('already');
                } else {
                    window.alert(translationPiece('already'));
                }
            } else if ((Round < 3 && CountyList.includes(guess)) || (Round === 4 && Cities.map((x) => x.name).includes(guess)) ) {
                OtherGuesses[Round - 1].push(guess);
                guessInput.value = "";
                if (test) {
                    return true;
                } else {
                    guessAnalisys(guess);
                }
            } else {
                if (test) {
                    return translationPiece('unknown');
                } else {
                    window.alert(translationPiece('unknown'));
                }
            }
        }
    }
}

function placeGuessInput() {
    let guessArea = document.querySelector('#guessInput > .my-2');
    if (guessArea != null) {
        guessArea.remove();
    }
    let template = document.getElementById('tmpl-guessinput');
    if (template != null) {
        if (template.content.firstElementChild != null) {
            template = template.content.firstElementChild.cloneNode(true);
        } else {
            template = template.firstElementChild.cloneNode(true);
        }
    }
    if (Round === 4) {
        let inp = findFirstChildOfType(template.firstElementChild.firstElementChild, 'input');
        if (inp) inp.setAttribute('lnph', 'ph4');
    }
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
                guessAnalisys(OtherGuesses[Round - 1][guessNum], guessNum);
            }
        }
    }
    window.dispatchEvent(new Event('resize'));
}

// Replaces a gray guess row with an analitics row about the latest guess
function placeAnalisys(count, name, dist, distUnit, dir, percent) {
    count = parseInt(count);
    let modifier = ((Round === 1 || Round === 4) ? 2 : 4);
    let guessLine = document.getElementById('guesses').children[modifier * count];
    let newLine = document.getElementById('tmpl-guess-analisys').content.cloneNode(true);

    if (Round === 1) {
        if (dir === 'yes' || dir === 'yo') {
            let correspondingImge;
            if (swapCoasAndShapes) {
                correspondingImge = document.querySelector(`#mainImage > div > img[name="${name}"]`);
                correspondingImge.parentElement.className += " back-green-600";
            } else {
                correspondingImge = document.querySelector(`#mainImage > div > svg > g > #${name}`);
                correspondingImge.parentElement.parentElement.parentElement.className += " back-green-600"
            }
        }
    }
    if (Round === 1 || Round === 4) {
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
    partyEmoji = newLine.children[((Round === 1 || Round === 4) ? 1 : 2)].childNodes[1].firstChild;
    try {
        newLine.children[0].childNodes[1].innerHTML = ((gameMap === "Budapest" && arabicInSuggestions) 
                                                        ? romanToArabic(replaceSpecialCharacters(name, true).toUpperCase().slice(0, name.length-1)) + '.'
                                                        : replaceSpecialCharacters(name, true));
        if (Round !== 1 && Round !== 4) newLine.children[1].innerHTML = ((computingMethod.includes("bord") && dist === 0 && dir !== 'yo') ? translationPiece("bord") : ((Scale == undefined) ? '?' : insertSpacesToNum(dist)) + " " + distUnit);
        partyEmoji.setAttribute('alt', Directions[dir].alt);
        partyEmoji.setAttribute('src', ((Directions[dir].img.includes("https://")) ? "" : 'https://em-content.zobj.net/thumbs/240/twitter/') + Directions[dir].img)
        if (Round !== 1 && Round !== 4) newLine.children[3].innerHTML = (compressNum(percent, (percent > 90) ? 1 : 0)).toString() + '%';
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
            // Confetti Animation & Result saving to stats
            if(!finishedRounds[Round]) { // Display animation and save result only at first
                addAnimatedConfetti({
                    particeCount: 150,
                    startVelocity: 31,
                    spread: 70,
                    origin: {
                        x: partyEmojiPos.x / window.innerWidth,
                        y: partyEmojiPos.y / window.innerHeight
                    }
                });

                // Save result into a cookie
                let statCount = new Number();
                if (loadFromCookie(Guesses.length) === null) {
                    statCount = 0;
                } else {
                    statCount = loadFromCookie(Guesses.length);
                }
                statCount += 1;
                saveToCookie({[Guesses.length]: statCount});
            }
        } catch (err) {console.error(err);}
        Won = true;
    }
    // Write out lose text
    else if (count + 1 === guesslinesCount) {
        Won = false;
        finished = true;

        // Save loss into a cookie
        if(!finishedRounds[Round]) {
            let statCount = new Number();
            if (loadFromCookie(0) === null) {
                statCount = 0;
            } else {
                statCount = loadFromCookie(0);
            }
            statCount += 1;
            saveToCookie({0: statCount});

            if (loadFromCookie('lost-' + Guesses.length) === null) {
                statCount = 0;
            } else {
                statCount = loadFromCookie('lost-' + Guesses.length);
            }
            statCount += 1;
            saveToCookie({['lost-' + Guesses.length]: statCount});
        }
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
    if (!swapCoasAndShapes) {
        if (Round === 1) {
            for (let terrNum in closestTerritories) {
                showShapeOfTerritory(`imageToGuess${terrNum}`);
            }
        } else {
            showShapeOfTerritory();
        }
    }

    // Translate newly placed elements
    localisation();

    // Button for showing the map
    buttonEventListeners("show-map");
}

// When finished guessing (either ran out of tries or guessed correctly), the input field is replaced with this thing
function finishedBottom(template = "", lose = false, guessLine = undefined) {
    if (template == "") {
        template = document.getElementById('tmpl-finish').content.firstElementChild.cloneNode(true);
    }
    let myPlace = removeGuessArea(true);
    myPlace.appendChild(template);

    // Always update the wikipedia link
    updateWikiLinkOnPage(template.childNodes[5].childNodes[5]);

    if (lose) {
        let finishImage = template.childNodes[3].childNodes[3].firstElementChild;
        finishImage.setAttribute('src', 'data/img/loseMeme.png');
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

    addCtrlZoomEventForMap(); // It only needs to be added once in each round (not evry single time when the map is placed on the page)

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
        if (finished) {
            button.setAttribute('role', "");
        }
        let n = button.getAttribute('name');
        if (n == undefined || n == null) {
            n = button.firstElementChild.getAttribute('name');
        }
        if (n === Solution && finished) {
            button.className += " good-img";
        } else  {
            OtherGuesses[Round-1].forEach(element => {
                if (n === coaImages[element].name) {
                    button.classList.add("wrong-img");
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
        if (Round === 2) {
            wikiname = Furthest.name;
        } else if (Round < 4 || Round === 5) {
            wikiname = Solution;
        } else if (Round === 4) {
            if (Language === "hu" || !Capital.includes("(")) {
                wikiname = Capital.match(/([A-ZÁÉŰŐÚÓÜÖÍ][a-zöüóúőáűéí]*)/)[0];
            } else {
                wikiname = Capital.match(/([A-ZÁÉŰŐÚÓÜÖÍ][a-zöüóúőáűéí]*)[ |–]\((.*)\)/)[2];
            }
        } else {
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
            let solution = (Round === 0) ? Solution : ((Round === 2) ? Furthest.name : ((Round === 4) ? Capital : ""));
            let numofguesses = (Round === 0) ? Guesses.length-1 : OtherGuesses[Round-1].length-1;
            let place = ((specialplace == undefined) ? numofguesses : specialplace);
            if (myGuess === solution) {
                placeAnalisys(place, solution, 0, 'm', 'yo', 100);
            } else {
                if (Round === 4) {
                    if (Cities[getIndexByProperty(Cities, "name", myGuess)].county === Solution) {
                        // The county is right, but the city is wrong
                        placeAnalisys(place, myGuess, 0, '', 'da', 0);
                    } else {
                        placeAnalisys(place, myGuess, 0, '', 'no', 0);
                    }
                } else {
                    let guessPath = document.querySelector("#mapTemplate > svg > g > #" + myGuess);
                    let mainPath = absToRel(document.querySelector("#mapTemplate > svg > g > #" + solution).getAttribute('d'));
                    if (guessPath != undefined) {
                        otherMetaData[myGuess] = trackPath(absToRel(guessPath.getAttribute('d')), {}, mainPath, true, false, true);
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
                            dir = 8; // Special case when they have common borders => closest borders cannot be determined, since there are many border point pairs which have the distance of 0
                        } else {
                            dir = Math.round(dir / 45) % 8; // It can be (e.g. 7.6) rounded up to 8 which equals the 0 direction in fact => %8 is needed
                        }
                    }
                    placeAnalisys(place, (Round === 0) ? Guesses[place] : OtherGuesses[Round-1][place], distance, unit, dirs[dir], accuracy);
                }
            }
        }
    }
}
