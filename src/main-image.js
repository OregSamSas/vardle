// **Functions for the image of the solution**

function placeMainImage() {
    if (Round === 0) {
        createGuessImage('imageToGuess', (Solution != undefined) ? CountyList.indexOf(Solution) : getRandomCounty());
    } else if (Round === 1) {
        let text = document.createElement('div');
        text.id = "border-question";
        text.className = "mt-4 font-bold";
        let container = document.getElementById('midContent');
        container.insertBefore(text, container.firstChild);
        for (let neighbour of closestTerritories) {
            if (neighbour != undefined) {
                createGuessImage(`imageToGuess${closestTerritories.indexOf(neighbour)}`, CountyList.indexOf(neighbour.name))
            }
        }
        localisation();
    } else if (Round === 2) {
        if (imageOrigin === "" || imageOrigin.includes('old')) {
            let img = document.createElement('img');
            let src = wikiMediaImageSearch(getWikipediaLink(Solution, "en", true));
            console.log(src)
            img.setAttribute("src", src);
            document.getElementById('mainImage').appendChild(img);
        }
    }
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