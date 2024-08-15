// **Functions for the image of the solution**

function placeMainImage() {
    if (Round === 0 || Round === 4) {
        if (Round === 4) {
            placeQuestion('capital');
        }
        createGuessImage('imageToGuess', CountyList.indexOf(Solution));
        if (swapCoasAndShapes) {
            let main = document.getElementById('imageToGuess');
            main.firstElementChild.remove();
            createCoaImg(main, Solution);
        }
    } else if (Round === 1) {
        placeQuestion('border');
        for (let neighbour of closestTerritories) {
            if (neighbour != undefined) {
                if (swapCoasAndShapes) {
                    let appendTo = document.createElement('div');
                    appendTo.id = `imageToGuess${closestTerritories.indexOf(neighbour)}`;
                    let main = document.getElementById('mainImage');
                    main.appendChild(appendTo);
                    main.style.display = "grid";
                    main.style.gridTemplateColumns = "30% 30% 30%";
                    createCoaImg(appendTo, neighbour.name);
                    appendTo.firstElementChild.style.height = "auto";
                } else {
                    createGuessImage(`imageToGuess${closestTerritories.indexOf(neighbour)}`, CountyList.indexOf(neighbour.name))
                }
            }
        }
        localisation();
    } else if (Round === 2) {
        placeQuestion('farthest');
        if (swapCoasAndShapes) {
            createGuessImage('imageToGuess', undefined, true);
            let main = document.getElementById('imageToGuess');
            createCoaImg(main, Furthest.name);
        } else {
            createGuessImage("imageToGuess", CountyList.indexOf(Furthest.name));
        }
    } else if (Round === 3) {
        if (swapCoasAndShapes) {
            placeQuestion('shape');
        } else {
            placeQuestion('img');
        }
        let img, lmnt, div, 
        main = document.getElementById('mainImage');
        let cachedImgs = document.getElementById('loaded-coatofarms').children;
        try {
            for (let i = 0; i < cachedImgs.length; i++) {
                lmnt = cachedImgs[i];
                if (swapCoasAndShapes) {
                    createGuessImage(`imageToGuess${i}`, CountyList.indexOf(lmnt.name));
                    div = document.getElementById(`imageToGuess${i}`);
                    div.setAttribute('name', lmnt.name);
                } else {
                    div = document.createElement('div');
                    img = lmnt.cloneNode(false);
                    main.style.display = "grid";
                    main.style.gridTemplateColumns = "30% 30% 30%";
                    main.appendChild(div);
                    createCoaImg(div, undefined);
                    div.appendChild(img);
                }
                div.setAttribute('role', "button");
                div.addEventListener('click', (e) => {
                    if (finishedRounds[Round] == undefined) {
                        if (OtherGuesses[Round - 1] == undefined) {
                            OtherGuesses[Round - 1] = [];
                        }
                        let myname = e.target
                        if (myname.nodeName.toLowerCase() === "path") {
                            myname = e.target.parentElement.parentElement.parentElement.getAttribute('name');
                        } else if (myname.nodeName.toLowerCase() === "svg") {
                            myname = e.target.parentElement.getAttribute('name');
                        } else {
                            myname = myname.getAttribute('name');
                        }
                        let posInCoaImgs;
                        for (let i = 0; i < coaImages.length; i++) {
                            if (coaImages[i].name === myname) {
                                posInCoaImgs = i;
                            }
                        }
                        OtherGuesses[Round - 1].push(posInCoaImgs);
                        if (myname === Solution) {
                            try {
                                finishedRounds[Round] = "won";
                                let imgPos = e.target.getBoundingClientRect();
                                addAnimatedConfetti({
                                    particeCount: 150,
                                    startVelocity: 35,
                                    spread: 70,
                                    origin: {
                                        x: (imgPos.x + imgPos.width / 2) / window.innerWidth,
                                        y: (imgPos.y + imgPos.height / 2) / window.innerHeight
                                    }
                                });
                            } catch {};
                        } else {
                            if (OtherGuesses[Round - 1].length === numberOfTriesForImage) {
                                finishedRounds[Round] = "lost";
                            }
                        }
                        updateRounds(Round, Round);
                    }
                });
            }
        } catch (error) {console.error(error)}
    } else if (Round === 5) {
        placeQuestion('cities-pos');
        createSolutionImageWithCities('imageToGuess', Solution);
    }
}

function createCoaImg(div, name) {
    div.style.padding = '1%';
    div.style.border = 'solid var(--border) 2px';
    div.style.borderRadius = '10%';
    div.classList.remove('w-full');
    if (name != undefined) {
            img = document.createElement('img');
            let subpropertyname = (gameMap === "Original") ? 'original' : 'modern';
            img.src = data.imglinks[subpropertyname][name];
            img.style = "width:auto;height:180px;";
            img.setAttribute('name', name);
            div.appendChild(img);
    }
}

function placeQuestion(id = new String()) {
    let text = document.createElement('div');
    text.id = id + "-question";
    text.className = "question mt-4 font-bold";
    let container = document.getElementById('midContent');
    container.insertBefore(text, container.firstChild);
}

function promiseCoaImage(territoryName) {
    return new Promise((resolve, reject) => {
        resolve(wikiMediaImageSearch(getWikipediaLink(territoryName, "en", true)))
    })
}

async function getCoaImages(collectFromWikipedia = false) {
    if (collectFromWikipedia) {
        for (let idx = 0; idx < CountyList.length; idx++) {
            let lmnt = CountyList[idx];
            if (data.imglinks[lmnt] === "") {
                data.imglinks = promiseCoaImage(lmnt);
            }
        }
    } else if (numberOfRounds > 3) {
        let subpropertyname = (gameMap === "Original") ? 'original' : 'modern';
        let inserted = 0;
        let name;
        let src;
        for (let i in coaImages) {
            if (coaImages[i] == '') {
                if ((inserted < 2) && ((Math.floor(Math.random() * coaImages.length * 2) === 0) || (i == coaImages.length - 1))) {
                    inserted += 1;
                    if (inserted === 2) {
                        name = closestTerritories[Math.floor(Math.random() * closestTerritories.length)].name;
                    } else {
                        name = Solution;
                    }
                } else {
                    name = CountyList[getRandomCounty()];
                }
                let init = coaImagesContains(name);
                while (init) {
                    name = CountyList[getRandomCounty()];
                    init = coaImagesContains(name);
                }
                if (data.imglinks[subpropertyname][name] !== "") {
                    src = data.imglinks[subpropertyname][name];
                } else {
                    src = await promiseCoaImage(name);
                }
                coaImages[i] = {name: name, src: src};
            }
        }
    }
}

function loadCoaImages() {
    let parent = document.getElementById('loaded-coatofarms');
    let imagechild;
    for (let img = 0; img < coaImages.length; img++) {
        imagechild = document.createElement('img');
        imagechild.setAttribute('name', coaImages[img].name);
        imagechild.src = coaImages[img].src;
        parent.appendChild(imagechild);
    }
}

function coaImagesContains(item) {
    for (let coa = 0; coa < coaImages.length; coa++) {
        if (coaImages[coa].name === item) {
            return true;
        }
    }
    return false;
}

function createGuessImage(id = 'imageToGuess', idx = undefined, onlywrapper = false) {
    let guessImage = document.createElement('div');
    guessImage.id = id;
    guessImage.className = `flex items-center justify-center w-full`;
    document.getElementById('mainImage').appendChild(guessImage);
    if (Round === 1 || (Round === 3 && swapCoasAndShapes)) {
        guessImage.style = "height: fit-content;width: fit-content;padding: 5px;flex-direction:column";
        guessImage.className += " border-2 rounded";
        let span = document.createElement("span");
        span.innerHTML = guessImage.parentElement.childElementCount;
        span.className = "ml-1";
        span.style = "align-self:baseline";
        guessImage.appendChild(span);
    }
    if (!onlywrapper) {
        getCountyImage(id, idx, (Round === 1 || (Round === 3 && swapCoasAndShapes)), Round === 5);
        if (hideShape && (Round === 1 || (Round === 3 && swapCoasAndShapes))) {
            findFirstChildOfType(document.getElementById(id), 'svg').style.display = "none";
        }
    }
}

function updateMainCountyImage(show, rotate, finished = false, removeforall = false) {
    if ((Round !== 3 && !swapCoasAndShapes) && (Round === 0 && swapCoasAndShapes)) {
        if (Round === 0 || Round === 2) {
            if (rotate && !finished) {
                let rotationButton = document.getElementById('cancel-rot');
                if (rotationButton == undefined) {
                    rotateSVG(
                        document.querySelector('#imageToGuess > svg'),
                        Rotation,
                        document.getElementById('imageToGuess')
                    );
                    localisation();
                } else {
                    rotationButton.style.display = "";
                }
            } else {
                removeRotation(!removeforall);
            }
        }
        if (show || (Round === 1 && finished)) {
            if (Round === 0 || Round === 2) {
                document.getElementById('imageToGuess').style.display = "";
                document.getElementById('imageToGuess').style.transform = "";
            } else if (Round === 1) {
                for (let i = 0; i < closestTerritories.length; i++) {
                    findFirstChildOfType(document.getElementById(`imageToGuess${i}`), 'svg').style.display = "";
                }
                showImageButtonsRemoved = Array(showImageButtonsRemoved.length).fill(false);
            }
            if (Round === 1) {
                for (let i = 0; i < closestTerritories.length; i++) {
                    removeShowMapButton(`imageToGuess${i}`);
                }
            } else {
                removeShowMapButton();
            }
        } else {
            if (Round === 1) {
                for (let i = 0; i < closestTerritories.length; i++) {
                    if (!showImageButtonsRemoved[i] && !finished) {
                        addShowMapButton(true, `imageToGuess${i}`);
                    }
                }
            } else {
                if (!showImageButtonRemoved[Round]) {
                    removeRotation(true);
                    if(Round === 0 || Round === 2) {
                        document.getElementById('imageToGuess').style.display = "none";
                    }
                    addShowMapButton();
                }
            }
        }
    }
}

// adds a button that shows the shape of the territory when clicked
function addShowMapButton(wrapped = false, id = 'imageToGuess') {
    let button = document.getElementById('tmpl-showmap').content.firstElementChild.cloneNode(true);
    let image;
    if (wrapped) {
        button.classList.remove('absolute');
        image = document.getElementById(id);
        try {findFirstChildOfType(image, 'svg').style.display = "none";} catch {}
    } else {
        image = document.getElementById('mainImage');
        image.firstElementChild.style.transform = "scale(0)";
    }
    let buttonPos = getIndexByProperty(image.childNodes, undefined, "button");
    if (buttonPos < 0 || image.childNodes[buttonPos].id !== 'showmap-button') { // if the button is not already there
        image.appendChild(button);
        localisation();
        button.addEventListener('click', (e) => {
            showShapeOfTerritory(id);
        });
    }
}

// on clicking the showmap-button it shows the shape of the territory
function showShapeOfTerritory(shapeId = 'imageToGuess') {
    let image = document.getElementById('mainImage');
    image.firstElementChild.style.transform = "";
    shapeElement = document.getElementById(shapeId);
    try {shapeElement.style.display = "";} catch {}
    removeShowMapButton(shapeId);
    if (shapeId === 'imageToGuess') {
        showImageButtonRemoved[Round] = true;
    } else {
        showImageButtonsRemoved[shapeId.match(/imageToGuess([0-9])/)[1]] = true;
    }
    if (Round === 1) {
        // show the shape of the territory
        findFirstChildOfType(shapeElement, 'svg').style.display = "";
    } else {
        updateMainCountyImage(true, rotateShape, !!finishedRounds[Round]);
    }
}

// removes the the button from the main image area (not to be confused with the one in bottom of the page which shows the help map)
function removeShowMapButton(parentID = 'mainImage') {
    try {document.querySelector(`#${parentID} > #showmap-button`).remove();} catch {};
}

// Creates a map of the terrytory
function createSolutionImageWithCities() {
    createGuessImage('mainImage', CountyList.indexOf(Solution));
    document.querySelector('#mainImage > #mainImage').remove();
    document.querySelector('#mainImage').style.marginBottom = "40px";

    countyCities = [];
    for (let index = 0; index < Cities.length; index++) {
        if (Cities[index].county == Solution) {
            countyCities.push(Cities[index].name);
        }
    }

    currentCity = countyCities[OtherGuesses[Round - 1].length];
    displayAllPinGuesses();
}

function displayAllCityNames() {
    document.getElementById('guesses').innerHTML = '';
    for (let i = 0; i < countyCities.length; i++) {
        currentCity = countyCities[i];
        console.log(currentCity)
        updateCityUnderGuessing(true);
    }
    document.querySelectorAll('#mainImage > svg > circle').forEach((circle) => {
        circle.style.display = "block";
    });
}

function addGuessCircle(SVGGroup, x, y) {
    let newcircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newcircle.setAttribute('cx', x);
    newcircle.setAttribute('cy', y);
    newcircle.setAttribute('r', pinCorrectSize);
    newcircle.setAttribute('fill', 'none');
    newcircle.setAttribute('stroke', 'var(--main-red)');
    newcircle.setAttribute('stroke-width', '5px');
    newcircle.setAttribute('name', currentCity);
    newcircle.id = "pinguess-" + (OtherGuesses[Round - 1].length + 1).toString();
    newcircle.title = currentCity;
    SVGGroup.appendChild(newcircle);
    return newcircle;
}

function displayAllPinGuesses() {
    let cityobj;
    for (let i = 0; i < OtherGuesses[Round - 1].length; i++) {
        cityobj = OtherGuesses[Round - 1][i];
        let newcircle = addGuessCircle(document.getElementById('mainImage').firstElementChild.firstElementChild, cityobj.x, cityobj.y);
        if (cityobj.correct) {
            newcircle.setAttribute("stroke", "var(--main-green");
        }
    }
}

function placePins() {
    document.getElementById("guesses").innerHTML = '';
    let SVGLMNT = document.getElementById('mainImage').firstElementChild;
    let SVGGroup = SVGLMNT.firstElementChild;
    let SVGPath = SVGGroup.firstElementChild;
    SVGLMNT.style.transform = "scale(1.5)";
    SVGLMNT.style.marginTop = "20px";
    if (finishedRounds[Round]) {
        displayAllCityNames();
        displayAllPinGuesses();
    } else {
        updateCityUnderGuessing();
        SVGPath.addEventListener('mouseover', function(event) {
            let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', event.offsetX);
            circle.setAttribute('cy', event.offsetY);
            circle.setAttribute('r', pinCorrectSize);
            circle.setAttribute('fill', 'var(--main-bg)');
            circle.style.opacity = 0.8;
            if (parseInt(SVGGroup.id) == NaN || SVGGroup.id == 'NaN' || SVGGroup.id == undefined) {
                SVGGroup.id = '1';
            } else {
                SVGGroup.id = parseInt(SVGGroup.id) + 1;
            }
            circle.id = SVGGroup.id;
            SVGGroup.appendChild(circle);
            stampAndWait(SVGLMNT, circle);
            circle.addEventListener('mouseout', function() {
                if (!isPointInPath(event.offsetX, event.offsetY, SVGPath)) {
                    circle.remove();
                    SVGGroup.id = '';
                }
            });
            circle.addEventListener('click', () => {
                addGuessCircle(SVGGroup, event.offsetX, event.offsetY)
                OtherGuesses[Round - 1].push({name: currentCity, x: event.offsetX, y: event.offsetY})
                evaluatePinPlace()
                if (OtherGuesses[Round - 1].length === countyCities.length) {
                    Won = true;
                    OtherGuesses[Round - 1].forEach(element => {
                        if (!element.correct) {
                            Won = false;
                        }
                    });
                    finishedBottom("", !Won);
                    let newsvg = SVGLMNT.cloneNode(true);
                    document.getElementById('mainImage').replaceChild(newsvg, SVGLMNT);
                    try {document.querySelector('#mainImage > svg > g > circle[style*="opacity"]').remove();} catch {}
                    while (finishedRounds.length < Round + 1) {
                        finishedRounds.push(false);
                    }
                    if (Won) {
                        finishedRounds[Round] = "won";
                    } else {
                        finishedRounds[Round] = "lost";
                    }
                    localisation();
                    buttonEventListeners("show-map");
                    displayAllCityNames();
                } else {
                    currentCity = countyCities[OtherGuesses[Round - 1].length];
                    updateCityUnderGuessing();
                }
            });
        });
    }
}

function evaluatePinPlace(correctthreshold = pinCorrectSize) {
    let cityobj = OtherGuesses[Round - 1][OtherGuesses[Round - 1].length - 1];
    let correctcity;
    try {
        correctcity = document.querySelector('#mainImage > svg > circle#' + cityobj.name);
    } catch {
        correctcity = document.getElementsByName(cityobj.name);
        let goodnum = 0;
        for (let i = 0; i < correctcity.length; i++) {
            if ((correctcity[i].nodeName.toLowerCase() === "circle") && (correctcity[i].id === cityobj.name)) {
                console.log(correctcity[i].getAttribute('name'))
                goodnum = i;
            }
        }
        correctcity = correctcity[goodnum];
    }
    let correctcitysscale = parseFloat(correctcity.style.transform.match(/scale\(([0-9.]*)/)[1]);
    console.log(correctcitysscale)
    let distfromcorrect = distanceOf(cityobj.x, cityobj.y, correctcity.getAttribute('cx') * correctcitysscale, correctcity.getAttribute('cy') * correctcitysscale);
    console.log(cityobj.x, cityobj.y, correctcity.getAttribute('cx') * correctcitysscale, correctcity.getAttribute('cy') * correctcitysscale, distfromcorrect)
    let pin = document.getElementById("pinguess-" + OtherGuesses[Round - 1].length.toString());
    if (distfromcorrect <= correctthreshold) {
        OtherGuesses[Round - 1][OtherGuesses[Round - 1].length - 1].correct = true;
        pin.setAttribute('stroke', 'var(--main-green)');
    } else {
        OtherGuesses[Round - 1][OtherGuesses[Round - 1].length - 1].correct = false;
    }
}

function stampAndWait(SVGLMNT, circle) {
    setTimeout(() => {
        if (parseInt(SVGLMNT.firstElementChild.id) !== parseInt(circle.id)) {
            circle.remove();
        } else {
            stampAndWait(SVGLMNT, circle)
        }
    }, 200);
}

function updateCityUnderGuessing(newone = false) {
    cityLabel = document.querySelector('#game > #guesses > #citylabel');
    if (cityLabel == null || newone) {
        cityLabel = document.createElement('div');
        cityLabel.className = "guesslabel";
        cityLabel.id = "citylabel";
        document.querySelector('#game > #guesses').appendChild(cityLabel);
    }
    cityLabel.innerHTML = replaceSpecialCharacters(currentCity, true);
}