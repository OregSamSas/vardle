// **Functions for the image of the solution**

function placeMainImage() {
    if (Round === 0) {
        createGuessImage('imageToGuess', (Solution != undefined) ? CountyList.indexOf(Solution) : getRandomCounty());
    } else if (Round === 1) {
        let text = document.createElement('div');
        text.id = "border-question";
        text.className = "question mt-4 font-bold";
        let container = document.getElementById('midContent');
        container.insertBefore(text, container.firstChild);
        for (let neighbour of closestTerritories) {
            if (neighbour != undefined) {
                createGuessImage(`imageToGuess${closestTerritories.indexOf(neighbour)}`, CountyList.indexOf(neighbour.name))
            }
        }
        localisation();
    } else if (Round === 2) {
        if (imageOrigin === "") {
            let text = document.createElement('div');
            text.id = "img-question";
            text.className = "question mt-4 font-bold";
            let container = document.getElementById('midContent');
            container.insertBefore(text, container.firstChild);
            let img, src, name, div, 
            main = document.getElementById('mainImage');
            coaImages.forEach(element => {
                div = document.createElement('div');
                div.setAttribute('role', "button");
                img = document.createElement('img');
                src = element.src;
                name = element.name;
                console.log(src)
                img.setAttribute("src", src);
                img.setAttribute("name", name);
                div.style.border = 'solid var(--border) 2px';
                div.style.borderRadius = '10%';
                div.style.padding = '4%';
                main.style.display = "grid";
                main.style.gridTemplateColumns = "30% 30% 30%";
                main.appendChild(div);
                div.appendChild(img);
                div.addEventListener('click', (e) => {
                    if (finishedRounds[2] == undefined) {
                        if (OtherGuesses[1] == undefined) {
                            OtherGuesses[1] = [];
                        }
                        let myname = e.target.getAttribute('name');
                        let posInCoaImgs;
                        for (let i = 0; i < coaImages.length; i++) {
                            if (coaImages[i].name === myname) {
                                posInCoaImgs = i;
                            }
                        }
                        OtherGuesses[1].push(posInCoaImgs);
                        if (myname === Solution) {
                            finishedRounds[2] = "won";
                        } else {
                            if (OtherGuesses[1].length === 2) {
                                finishedRounds[2] = "lost";
                            }
                        }
                        updateRounds(2, 2);
                    }
                })
            });
        }
    }
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
        guessImage.parentElement.style = "";
        guessImage.parentElement.className = "flex items-center gap-2 mb-4 flex-wrap justify-center";
        let span = document.createElement("span");
        span.innerHTML = guessImage.parentElement.childElementCount;
        span.className = "ml-1";
        span.style = "align-self:baseline";
        guessImage.appendChild(span);
    }
    getCountyImage(id, idx);
}

function updateMainCountyImage(show, rotate, finished = false) {
    if (rotate && !finished) {
        let rotationButton = document.getElementById('cancel-rot')
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
        if (!finished) {
            removeRotation()
        }
    }
    if (show) {
        if (Round === 0) {
            document.getElementById('imageToGuess').style.display = "";
            document.getElementById('imageToGuess').style.transform = "";
        }
        removeShowMapButton();
    } else {
        if (!showImageButtonRemoved) {
            removeRotation(true);
            if(Round === 0) {
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
}

function removeShowMapButton() {
    try {document.getElementById('showmap-button').remove();} catch {};
}