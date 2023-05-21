const CountyList = [];
var metaData = [];

// function for insert a county to guess
function getCountyImage(id, num) {
    let ratio;
    allCounties = new XMLHttpRequest();
    allCounties.open("GET","Kingdom_of_Hungary_counties (Plain).svg",false);
    // Following line is just to be on the safe side
    allCounties.overrideMimeType("image/svg+xml");
    allCounties.onload = (e) => {
        document.getElementById(id).appendChild(allCounties.responseXML.documentElement);
    };
    allCounties.send("");
    if(num != undefined) {
        allPaths = document.querySelectorAll('#' + id + ' > svg > g > path');
        for (thisPath in allPaths) {
            if(allPaths[thisPath].id != CountyList[num]) {
                try {allPaths[thisPath].remove();} catch {};
            } else {
                console.log(allPaths[thisPath].id);
                allPaths[thisPath].setAttribute("d", absToRel(allPaths[thisPath].getAttribute("d")));
                metaData = trackPath(allPaths[thisPath].getAttribute("d"));
                if(metaData[3] === 0) {
                    metaData[3] = 120;
                    metaData[2] = 120;
                }
                allPaths[thisPath].setAttribute("d", movePath(allPaths[thisPath].getAttribute("d"), 0-metaData[0], 0-metaData[1]));
                ratio = (180/ metaData[3]).toString();
                if(parseFloat(ratio)*metaData[2] > 450) {
                    ratio = (450 / metaData[2]).toString();
                }
                ratio = (Math.floor(parseFloat(ratio)*100000)/100000).toString()
                allPaths[thisPath].style.transform = "scale(" + ratio + ")";
            }
        }
        console.log(metaData)
        svgImage = document.querySelector('#' + id + ' > svg');
        svgImage.setAttribute("width", metaData[2]*parseFloat(ratio));
        svgImage.setAttribute("height", 210);
    }
}

// Check if a character is a digit
function isCharNumber(c) {
    return typeof c === 'string' && c.length == 1 && c >= '0' && c <= '9';
}

// Move path (with relatively set curve commands)
function movePath(path, dx, dy, newx, newy) {
    let char = 2;
    let origCoordinates = ['', ''];
    for(let coo=0;coo<2;coo++) {
        while(path[char] !== " " && path[char] !== ",") {
            origCoordinates[coo] += path[char];
            char ++;
        }
        char ++;
    }
    if(newx == undefined || newy == undefined) {
        path = "M " + (parseFloat(origCoordinates[0]) + dx).toString() + ',' + (parseFloat(origCoordinates[1]) + dy).toString() + ' ' + path.slice(char, path.length);
    } else {
        path = "M " + (newx).toString() + ',' + (newy).toString() + ' ' + path.slice(char, path.length);
    }
    return path;
}

// Function to replace absolute bézier curve commands with relative
function absToRel(path) {
    let char = 0;
    let command = "";
    let pathCoordinates = [];
    let coordinates = ['0', '0', '0', '0', '0', '0', '0', '0']; //x0:last x, y0:last y, x1, y1, x2, y2, x3, y3
    while(char<path.length) {
        command = path[char];
        char += 2;
        if(command === 'C' || command === 'c') {
            if(isCharNumber(command) || command === '-') {
                char += -2;
            }
            coordinates[0] = coordinates[6];
            coordinates[1] = coordinates[7];
            for(let coo=2;coo<8;coo++) {
                coordinates[coo] = '';
                while(path[char] !== " " && path[char] !== ",") {
                        coordinates[coo] += path[char];
                        char ++;
                }
                char ++;
            }
            let originalx = coordinates[6];
            let originaly = coordinates[7];
            if(command === 'C' || command === 'L') {
                for(let i=2;i<8;i++) {
                    coordinates[i] = (Math.round((parseFloat(coordinates[i]) - parseFloat(coordinates[0+i%2]))*1000)/1000).toString();
                }
            }
            pathCoordinates.push(coordinates.slice(2,8));
            coordinates[6] = originalx;
            coordinates[7] = originaly;
        }
        if(command === 'M') {
            coordinates = Array(8).fill('')
            for (let coo=6;coo<8;coo++) { // Insert 'move to()' command's coordinates to the last places (x3, y3), later it will be shifted to the place of x0, y0
                while(path[char] !== " " && path[char] !== ",") {
                    coordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
        }
    }

    char = 0;
    let newpath = '';
    while(path[char] != 'c' && path[char] != 'C') {
        try {newpath += path[char];} catch {console.log(char)}
        char++;
    }
    let i = 0;
    while(i<pathCoordinates.length) {
        newpath += 'c '
        for(let j=0;j<3;j++) {
            newpath += pathCoordinates[i][j*2] + ',' + pathCoordinates[i][j*2+1] + ' '
        }
        i++;
    }
    newpath += 'z';
    return newpath;
}

// Function to go through a path and collect its data
function trackPath(path) {
    let minx, miny, maxx, maxy, x, y, x1, y1, x2, y2, x3, y3, i=0, char=0, t = 0;
    let command = "";
    let origCoordinates = Array(8).fill('');
    while(char < path.length) {
        command = path[char];
        char += 2;
        if(command === 'M') {
            for(let coo=0;coo<2;coo++) {
                while(path[char] !== " " && path[char] !== ",") {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
        }
        if(command === 'c') {
            for(let coo=2;coo<8;coo++) {
                origCoordinates[coo] = '';
                while(path[char] !== " " && path[char] !== "," && char<path.length) {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            // Tracking curve
            x1 = parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[2]);
            y1 = parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[3]);
            x2 = parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[4]);
            y2 = parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[5]);
            x3 = parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[6]);
            y3 = parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[7]);
            t = 0;
            while(t<1) {
                // Formula from https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
                x = ((1-t)**3)*parseFloat(origCoordinates[0]) + 3*((1-t)**2)*t*x1 + 3*(1-t)*(t**2)*x2 + (t**3)*x3;
                y = ((1-t)**3)*parseFloat(origCoordinates[1]) + 3*((1-t)**2)*t*y1 + 3*(1-t)*(t**2)*y2 + (t**3)*y3;
                if(x < minx || i === 1) {
                    minx = x;
                }
                if(x > maxx || i === 1) {
                    maxx = x;
                }
                if(y < miny || i === 1) {
                    miny = y;
                }
                if(y > maxy || i === 1) {
                    maxy = y;
                }
                t+=0.1;
            }
            origCoordinates[0] = (parseFloat(origCoordinates[0]) + parseFloat(origCoordinates[6])).toString();
            origCoordinates[1] = (parseFloat(origCoordinates[1]) + parseFloat(origCoordinates[7])).toString();
        }
        i++;
    }
    return [minx, miny, maxx - minx, maxy - miny]; // length, height, x position, y position
}

// Get all of the county names
getCountyImage('mapTemplate');
AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
for (thisCounty in AllCountyNames) {
    try {if((AllCountyNames[thisCounty].id != undefined)) {CountyList.push(AllCountyNames[thisCounty].id)}} catch {}
}
let CountyListOrdered = CountyList.sort();

// Insert image of county to guess
guessImage = document.createElement('div');
guessImage.id = 'imageToGuess';
document.getElementById('mainImage').appendChild(guessImage);
console.log(CountyList)
let randomCounty = Math.floor(Math.random()*(CountyList.length-2 /*-2 because Balaton (the last item) is not a county to guess, but included in the data arrays*/));
getCountyImage('imageToGuess', randomCounty);

// Bundle event listener to the input field
function inputEventListeners() {
    allInputs = document.querySelectorAll('input[aria-autocomplete="list"]');
    for(thisInput in allInputs) {
        try{
            if(allInputs[thisInput].getAttribute('aria-autocomplete')) {
                allInputs[thisInput].addEventListener('focusin', function insertAutoList(e) {
                    let completeList = document.getElementById(this.getAttribute('aria-controls'));
                    let ul = document.createElement('ul');
                    let inputId = this.id;
                    var inputValue = this.value;
                    ul.setAttribute('role', "listbox");
                    for(let county=0;county<CountyListOrdered.length;county++) {
                        if(CountyListOrdered[county].includes(inputValue)) {
                            let li = document.createElement('li');
                            li.setAttribute('aria-selected', ul.childElementCount === 0);
                            if(ul.childElementCount === 0) {
                                li.className  = 'font-bold';
                            }
                            li.setAttribute('role', 'option');
                            li.addEventListener('mouseover', function listItemHovered(e, id=completeList.id) {
                                allLi = document.querySelectorAll('#' + id + ' > ul > li');
                                for(hoverToDelete in allLi) {
                                    try {
                                        allLi[hoverToDelete].setAttribute('aria-selected', false);
                                        allLi[hoverToDelete].className = '';
                                    } catch {}
                                }
                                li.setAttribute('aria-selected', true);
                                this.className = 'font-bold';
                            })
                            li.addEventListener('mousedown', function listItemClicked(e, inputid=inputId) {
                                let oldInput = document.getElementById(inputid)
                                let newInput = document.createElement('input');
                                newInput.id = inputId;
                                newInput.type = oldInput.type;
                                newInput.className = oldInput.className;
                                newInput.setAttribute('autocomplete', oldInput.getAttribute('autocomplete'));
                                newInput.setAttribute('aria-autocomplete', oldInput.getAttribute('aria-autocomplete'));
                                newInput.setAttribute('aria-controls', oldInput.getAttribute('aria-controls'));
                                newInput.setAttribute('placeholder', oldInput.getAttribute('placeholder'));
                                newInput.setAttribute('value', this.children[0].innerHTML.toUpperCase());
                                oldInput.after(newInput);
                                oldInput.remove();
                                inputEventListeners();
                            })
                            li.id = this.getAttribute('aria-controls') + '--item-' + (ul.childElementCount).toString();
                            li.setAttribute('data-suggestion-idx', ul.childElementCount);
                            let divText = document.createElement('div');
                            divText.className = 'm-0.5 bg-white p-1 cursor-pointer uppercase';
                            divText.innerHTML = CountyListOrdered[county];
                            li.appendChild(divText);
                            ul.appendChild(li);
                        }
                    }
                    completeList.appendChild(ul);
                });
                allInputs[thisInput].addEventListener('focusout', function deleteAutoList(e) {
                    let completeList = document.getElementById(this.getAttribute('aria-controls'));
                    completeList.innerHTML = "";
                });
            }
        } catch {}
    }
}

inputEventListeners()