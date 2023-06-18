// **Functions for the image of the solution**

function placeMainImage() {
    if (Round === 0) {
        guessImage = document.createElement('div');
        guessImage.id = 'imageToGuess';
        guessImage.className = 'flex items-center justify-center w-full';
        document.getElementById('mainImage').appendChild(guessImage);
        getCountyImage('imageToGuess', ((Solution != undefined) ? CountyList.indexOf(Solution) : getRandomCounty()));
    } else if (Round === 1) {

    }
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
    document.getElementById('imageToGuess').style.display = "";
    image.firstElementChild.style.transform = "";
    removeShowMapButton();
    showImageButtonRemoved = true;
}

function removeShowMapButton() {
    try {document.getElementById('showmap-button').remove();} catch {};
}