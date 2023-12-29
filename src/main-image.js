// **Functions for the image of the solution**

function placeMainImage() {
    if (Round === 0) {
        createGuessImage('imageToGuess', (Solution != undefined) ? CountyList.indexOf(Solution) : getRandomCounty());
    } else if (Round === 1) {
        placeQuestion('border');
        for (let neighbour of closestTerritories) {
            if (neighbour != undefined) {
                createGuessImage(`imageToGuess${closestTerritories.indexOf(neighbour)}`, CountyList.indexOf(neighbour.name))
            }
        }
        localisation();
    } else if (Round === 2) {
        placeQuestion('farthest');
        createGuessImage("imageToGuess", CountyList.indexOf(Furthest.name));
    } else if (Round === 3) {
        if (imageOrigin === "") {
            placeQuestion('img');
            let img, lmnt, div, 
            main = document.getElementById('mainImage');
            let cachedImgs = document.getElementById('loaded-coatofarms').children;
            try {for (let i = 0; i < cachedImgs.length; i++) {
                lmnt = cachedImgs[i];
                div = document.createElement('div');
                div.setAttribute('role', "button");
                img = lmnt.cloneNode(false);
                div.style.border = 'solid var(--border) 2px';
                div.style.borderRadius = '10%';
                div.style.padding = '4%';
                main.style.display = "grid";
                main.style.gridTemplateColumns = "30% 30% 30%";
                main.appendChild(div);
                div.appendChild(img);
                div.addEventListener('click', (e) => {
                    if (finishedRounds[Round] == undefined) {
                        if (OtherGuesses[Round-1] == undefined) {
                            OtherGuesses[Round-1] = [];
                        }
                        let myname = e.target.getAttribute('name');
                        let posInCoaImgs;
                        for (let i = 0; i < coaImages.length; i++) {
                            if (coaImages[i].name === myname) {
                                posInCoaImgs = i;
                            }
                        }
                        OtherGuesses[Round-1].push(posInCoaImgs);
                        if (myname === Solution) {
                            try {finishedRounds[Round] = "won";
                            let imgPos = e.target.getBoundingClientRect();
                            confetti({
                                particeCount: 150,
                                startVelocity: 35,
                                spread: 70,
                                origin: {
                                    x: (imgPos.x + imgPos.width / 2) / window.innerWidth,
                                    y: (imgPos.y + imgPos.height / 2) / window.innerHeight
                                }
                            });}catch{};
                        } else {
                            if (OtherGuesses[Round-1].length === numberOfTriesForImage) {
                                finishedRounds[Round] = "lost";
                            }
                        }
                        updateRounds(Round, Round);
                    }
                })
            };} catch (error) {console.error(error)}
        }
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

async function getCoaImages(all = false) {
    if (all) {
        for (let idx = 0; idx < CountyList.length; idx++) {
            let lmnt = CountyList[idx];
            if (data.imglinks[lmnt] === "") {
                data.imglinks = promiseCoaImage(lmnt);
            }
        }
    } else if (('Kingdom_of_Hungary_counties (Plain).svg').includes(imageOrigin)) {
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
                if (data.imglinks[name] !== "") {
                    src = data.imglinks[name];
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

function createGuessImage(id = 'imageToGuess', idx = undefined) {
    let guessImage = document.createElement('div');
    guessImage.id = id;
    guessImage.className = `flex items-center justify-center w-full`;
    document.getElementById('mainImage').appendChild(guessImage);
    if (Round === 1) {
        guessImage.style = "height: fit-content;width: fit-content;padding: 5px;flex-direction:column";
        guessImage.className += " border-2 rounded";
        let span = document.createElement("span");
        span.innerHTML = guessImage.parentElement.childElementCount;
        span.className = "ml-1";
        span.style = "align-self:baseline";
        guessImage.appendChild(span);
    }
    getCountyImage(id, idx, Round === 1);
}

function updateMainCountyImage(show, rotate, finished = false, removeforall = false) {
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
    if (show) {
        if (Round === 0 || Round === 2) {
            document.getElementById('imageToGuess').style.display = "";
            document.getElementById('imageToGuess').style.transform = "";
        }
        removeShowMapButton();
    } else {
        if (!showImageButtonRemoved) {
            removeRotation(true);
            if(Round === 0 || Round === 2) {
                document.getElementById('imageToGuess').style.display = "none";
            }
            addShowMapButton();
        }
    }
}

function addShowMapButton() {
    let button = document.getElementById('tmpl-showmap').content.firstElementChild.cloneNode(true);
    let image = document.getElementById('mainImage');
    image.appendChild(button);
    image.firstElementChild.style.transform = "scale(0)";
    localisation();
    button.addEventListener('click', (e) => {
        showShapeOfTerritory();
    });
}

function showShapeOfTerritory() {
    let image = document.getElementById('mainImage');
    try {document.getElementById('imageToGuess').style.display = "";} catch {}
    image.firstElementChild.style.transform = "";
    removeShowMapButton();
    showImageButtonRemoved = true;
    updateMainCountyImage(true, rotateShape, !!finishedRounds[Round]);
}

function removeShowMapButton() {
    try {document.getElementById('showmap-button').remove();} catch {};
}