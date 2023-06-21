// **Functions in connection with the SVG images, and the data extraction from them**

function titleToId(imageId) {
    let paths = document.querySelectorAll(`#${imageId} > svg > g > path`);
    let newId;
    for (let path of paths) {
        if (path.getAttribute('name') != undefined) {
            newId = path.getAttribute('name');
            path.setAttribute('name', '');
        } else if (path.getAttribute('title') != undefined) {
            newId = path.getAttribute('title');
            path.setAttribute('title', '');
        } else if (path.getAttribute('data-qText') != undefined) {
            newId = path.getAttribute('data-qText');
            path.setAttribute('title', '');
        } else if (path.getAttribute('data-name') != undefined) {
            newId = path.getAttribute('data-name');
            path.setAttribute('data-name', '');
        } else {
            newId = path.id;
        }
        path.id = newId
        path.id = replaceSpecialCharacters(path.id);
    }
}

function rectifyImage(imageId) {
    let textgroup = document.querySelector(`#${imageId} > svg > g#textgroup`);
    if (textgroup == null || textgroup == undefined) {
        let newtextgroup = document.createElement('g');
        newtextgroup.id = 'textgroup';
        document.querySelector(`#${imageId} > svg`).appendChild(newtextgroup);
    }
    let svg = document.querySelector(`#${imageId} > svg`);
}

function makeSpaceInSVG(svg) {
    let newContent = svg.innerHTML.replace('\n', '');
    if (newContent != undefined) {
        svg.innerHTML = newContent;
    }
}

function pathUnderGroup(imageId) {
    let paths = document.querySelector(`#${imageId} > svg > g > path`);
    if (paths === null || paths === undefined) {
        paths = document.querySelectorAll(`#${imageId} > svg > path`);
        let newgroup = document.createElement('g');
        let newpath;
        for (let thispath of paths) {
            newpath = thispath.cloneNode();
            newgroup.appendChild(newpath);
            thispath.remove();
        }
        document.querySelector(`#${imageId} > svg`).appendChild(newgroup);
    }
}

function adjustMetaData(data, withRatio) {
    for (let datapiece in data) {
        data[datapiece] = data[datapiece] / withRatio;
    }
    return data;
}


// function for insert a county to guess
function getCountyImage(id = '', num) {
    let ratio;
    let placeToInsert = document.getElementById(id);
    let desiredshape = document.querySelector(`#mapTemplate > svg > g > #${CountyList[num]}`);
    if (num != undefined && desiredshape != null) {
        desiredshape = desiredshape.cloneNode();
        let svg = document.getElementById('mapTemplate').firstElementChild.cloneNode();
        svg.appendChild(document.createElement('g'));
        svg.firstElementChild.appendChild(desiredshape);
        placeToInsert.appendChild(svg);

        ratio = handleDesiredShape(desiredshape);
    } else {
        let allCounties = new XMLHttpRequest();
        allCounties.open("GET", imageOrigin, false);
        // Following line is just to be on the safe side
        allCounties.overrideMimeType("image/svg+xml");
        allCounties.onload = (e) => {
            try {
                placeToInsert.appendChild(allCounties.responseXML.documentElement);
            } catch {
                allCounties.open("GET", "img/Kingdom_of_Hungary_counties_(Plain).svg", false);
                allCounties.onload = (e) => {
                    placeToInsert.appendChild(allCounties.responseXML.documentElement);
                }
                allCounties.send("");
            }
        };
        allCounties.send("");
        pathUnderGroup(id);
        titleToId(id);
        rectifyImage(id);
    }
    if(num != undefined) {
        // Old and unefficient way of getting the svg by deleting all the other unneeded paths (Only here, if something went wrong with the new method)
        let allPaths = document.querySelectorAll('#' + id + ' > svg > g > path');
        if (desiredshape == null) {
            for (let thisPath of allPaths) {
                if(thisPath.id != CountyList[num]) {
                    try {
                        thisPath.remove();
                    } catch {};
                } else {
                    imgRatio = document.querySelector(`#${id} > svg`).getAttribute('aspectRatio');
                    if (imgRatio == null) {
                        imgRatio = 1;
                    }
                    ratio = handleDesiredShape(thisPath, imgRatio);
                }
            }
        }

        // Delete unnecessary nodes
        allPaths = document.querySelectorAll('#' + id + ' > svg > g > g > *');
        for (let notNeeded of allPaths) {
            try {
                notNeeded.remove();
            } catch {}
        }

        // Resize SVG
        svgImage = document.querySelector('#' + id + ' > svg');
        svgImage.setAttribute("width", metaData.width * parseFloat(ratio));
        svgImage.setAttribute("height", metaData.height * parseFloat(ratio));

        makeSpaceInSVG(svgImage);

        // Rotate image if desired
        if (rotateShape) {
            rotateSVG(svgImage, Rotation, placeToInsert);
        }

        // Remove text
        try {document.querySelector(`#${id} > svg > #textgroup`).remove();} catch {}
    }
}

function handleDesiredShape(thisPath, imgRatio = 1) {
    if (Round === 0) {
        Solution = thisPath.id;
    }
    thisPath.setAttribute("d", absToRel(thisPath.getAttribute("d")));
    metaData = trackPath(thisPath.getAttribute("d"));
    metaData = adjustMetaData(metaData, imgRatio);
    if(metaData.height === 0) {
        metaData.height = 120;
        metaData.width = 120;
    }
    let biggerSize = Math.sqrt(metaData.width ** 2 + metaData.height ** 2);
    thisPath.setAttribute("d", movePath(thisPath.getAttribute("d"), 0 - metaData.x * imgRatio, 0 - metaData.y * imgRatio));
    let ratio = (Math.floor((180 / biggerSize) * 100000) / 100000).toString();
    thisPath.style.transform = `scale(${ratio})`;
    thisPath.style.stroke = "";
    thisPath.style.strokeWidth = "";

    return ratio;
}

function rotateSVG(svg, rotation, imagePlace) {
    svg.style.transform = `rotate(${rotation}turn)`;
    svg.style["transition-duration"] = ".7s";
    svg.style['transition-property'] = "all";
    svg.style['transition-timing-function'] = "cubic-bezier(.4,0,.2,1)";

    // Place button for cancelling it
    let cancelButton = document.getElementById('tmpl-cancel-rotation').content.firstElementChild.cloneNode(true);
    imagePlace.after(cancelButton);
    cancelButton.addEventListener('click', (e) => {
        removeRotation();
        rotationRemoved = true;
    });

}

// Cancel Rotation for county image
function removeRotation(notForEver) {
    let rotationButton = document.getElementById('cancel-rot');
    if (notForEver) {
        if (rotationButton != null && rotationButton != undefined) rotationButton.style.display = "none";
    } else {
        if (rotationButton != null && rotationButton != undefined) rotationButton.remove();
        let svg = document.querySelector('#imageToGuess > svg');
        if(svg != null) svg.style.transform = "";
    }
}

// Move path (having only relatively set curve commands)
function movePath(path, dx, dy, newx, newy) {
    let char = 2;
    let origCoordinates = ['', ''];
    for (let coo=0; coo<2; coo++) {
        while (path[char] !== " " && path[char] !== ",") {
            origCoordinates[coo] += path[char];
            char ++;
        }
        char ++;
    }
    if (newx == undefined || newy == undefined) {
        path = "M " + (parseFloat(origCoordinates[0]) + dx).toString() + ',' + (parseFloat(origCoordinates[1]) + dy).toString() + ' ' + path.slice(char, path.length); // Relative moving (move it by a vector (dx, dy))
    } else {
        path = "M " + (newx).toString() + ',' + (newy).toString() + ' ' + path.slice(char, path.length); // Move to an absolute position
    }
    return path;
}

// Function to replace absolute (mostly bézier curve, but the majority of) commands with relative ones
function absToRel(path = new String()) {
    let char = 0;
    let command = "";
    let pathCommands = [];
    let pathCoordinates = [];
    let coordinates = Array(8).fill(''); //x0:last x, y0:last y, x1, y1, x2, y2, x3, y3
    let lastCommand = ((path[0] === 'M') ? 'L' : 'l');
    let initialmove = true; // to determine if the the given "M" command is the first or not
    while (char < path.length) {
        command = path[char];
        if ("chtqlmvz".includes(command.toLowerCase())) {
            char += 2;
        } else {
            command = lastCommand;
        }
        if (command.toLocaleLowerCase() === 'z') {
            pathCoordinates.push(['']);
        } else {
            coordinates[0] = coordinates[6];
            coordinates[1] = coordinates[7];
            let originalx;
            let originaly;
            let startPos = (('mhql'.includes(command.toLocaleLowerCase())) ? 6 : ((command.toLocaleLowerCase() === 'v') ? 7 : 2));
            let coordinatesNum = ((command.toLocaleLowerCase() === 'h') ? 7 : 8);
            for (let coo = startPos; coo < coordinatesNum; coo ++) {
                coordinates[coo] = '';
                while (path[char] !== " " && path[char] !== "," && char < path.length) {
                    coordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            if (command.toLocaleLowerCase() === 'h') {
                if (command === 'H') {
                    coordinates[7] = coordinates[1];
                } else {
                    coordinates[7] = '0';
                }
            }
            if (command.toLocaleLowerCase() === 'v') {
                if (command === 'V') {
                    coordinates[6] = coordinates[0];
                } else {
                    coordinates[0] = '0';
                }
            }
            originalx = parseFloat(coordinates[6]);
            originaly = parseFloat(coordinates[7]);
            if(command === 'C' || command === 'L' || command === 'H' || command === 'V' || (command === 'M' && !initialmove)) {
                for(let i = startPos; i < coordinatesNum; i++) {
                    coordinates[i] = (Math.round((parseFloat(coordinates[i]) - parseFloat(coordinates[i % 2])) * 1000) / 1000).toString();
                }
            }
            pathCoordinates.push(coordinates.slice(startPos, coordinatesNum));
            if (command === command.toLocaleLowerCase()) {
                coordinates[6] = (parseFloat(coordinates[0]) + originalx).toString();
                coordinates[7] = (parseFloat(coordinates[1]) + originaly).toString();
            } else {
                coordinates[6] = originalx;
                coordinates[7] = originaly;
            }
            if (command.toLowerCase() !== 'm') {
                lastCommand = command;
            }
        }
        pathCommands.push((command === 'M' && initialmove) ? 'M' : command.toLocaleLowerCase());
        initialmove = false;
    }
    let newpath = '';
    let i = 0;
    while (i < pathCoordinates.length) {
        command = pathCommands[i];
        if (command === 'z' && i === pathCoordinates.length - 1) {
            newpath += 'z';
        } else {
            newpath += command + ' ';
            for (let j = 0; j < pathCoordinates[i].length / 2; j++) {
                if (command === 'z') {
                    break;
                } else if (command === 'h' || command === 'v') {
                    newpath += pathCoordinates[i][j*2] + ' ';
                } else {
                    newpath += pathCoordinates[i][j*2] + ',' + pathCoordinates[i][j*2+1] + ' ';
                }
            }
        }
        i++;
    }
    return newpath;
}

// Function to follow through a path and collect its data
function trackPath(path = new String(), compare = new Object(), path0 = new String(), stillGetSizeData = false) {
    let minx=0, miny=0, maxx=0, maxy=0, x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, x3=0, y3=0, i=0, char=0, t = 0, dist=0, mindist=-1, dir=0;
    let command = "";
    let origCoordinates = Array(8).fill('');
    while (char < path.length) {
        command = path[char];
        char += 2;
        if (command === 'z' && path[char] != undefined) {
            if (path[char].toLowerCase() === 'm') {
                if (path[char] === 'M') {
                    command = 'L';
                } else {
                    command = 'l';
                }
                char += 2;
            }
        }
        if (command === 'M' || command === 'm') {
            x0 = 0;
            y0 = 0;
            if (command === 'm') {
                x0 = origCoordinates[0];
                y0 = origCoordinates[1];
            }
            for (let coo = 0; coo < 2; coo++) {
                while (path[char] !== " " && path[char] !== ",") {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            origCoordinates[0] = (x0 + parseFloat(origCoordinates[0])).toString();
            origCoordinates[1] = (y0 + parseFloat(origCoordinates[1])).toString();
        }
        if ("cqlvh".includes(command)) {
            origCoordinates[2] = '0';
            origCoordinates[3] = '0';
            let type = ((command === 'c') ? "cubic" : ((command === 'q') ? "quadratic" : "linear"));
            let startPos = ((command === 'v') ? 3 : 2);
            let endPos = ((command === 'c') ? 8 : ((command === 'q') ? 6 : ((command === 'h') ? 3 : 4)));
            for (let coo = startPos; coo < endPos; coo++) {
                origCoordinates[coo] = '';
                while (path[char] !== " " && path[char] !== "," && char < path.length) {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            origCoordinates[6] = origCoordinates[endPos - ((endPos === 3) ? 1 : 2)];
            origCoordinates[7] = origCoordinates[endPos - ((endPos === 3) ? 0 : 1)];
            // Tracking curve
            x0 = parseFloat(origCoordinates[0]);
            y0 = parseFloat(origCoordinates[1]);
            x1 = x0 + parseFloat(origCoordinates[2]);
            y1 = y0 + parseFloat(origCoordinates[3]);
            if (type !== "linear") {
                x2 = x0 + parseFloat(origCoordinates[4]);
                y2 = y0 + parseFloat(origCoordinates[5]);
                if (type !== "quadratic") {
                    x3 = x0 + parseFloat(origCoordinates[6]);
                    y3 = y0 + parseFloat(origCoordinates[7]);
                }
            }
            t = 0;
            if (path0 != "") {
                dist = trackPath(path0, {"x": x0,"y": y0}, "");
                if (mindist === -1 || dist["closest-point"] < mindist) {
                    mindist = dist["closest-point"];
                    dir = dist["dir-of-borderpoints"];
                }
                if (mindist === 0) { // minimum distance found for sure (neighbouring territories), no need to check other points
                    break;
                }
            }
            if (path0 == "" || stillGetSizeData) {
                if (compare.x != undefined) {
                    dist = distanceOf(x0, y0, compare.x, compare.y);
                    if (mindist === -1 || dist < mindist) {
                        mindist = dist;
                        dir = getDirOfVector(x0, y0, compare.x, compare.y);
                    } else {
                        t = 1;
                    }
                }
                while (t < 1) {
                    // Formula from https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
                    if (type === "linear") {
                        x = (1-t)*x0 + t*x1;
                        y = (1-t)*y0 + t*y1;
                    } else if (type === "quadratic") {
                        x = ((1-t)**2)*x0 + 2*(1-t)*t*x1 + (t**2)*x2;
                        x = ((1-t)**2)*y0 + 2*(1-t)*t*y1 + (t**2)*y2;
                    } else {
                        x = ((1-t)**3)*x0 + 3*((1-t)**2)*t*x1 + 3*(1-t)*(t**2)*x2 + (t**3)*x3;
                        y = ((1-t)**3)*y0 + 3*((1-t)**2)*t*y1 + 3*(1-t)*(t**2)*y2 + (t**3)*y3;
                    }
                    if (compare.x != undefined) {
                        dist = distanceOf(compare.x, compare.y, x0, y0);
                        if (dist < mindist) {
                            mindist = dist;
                        }
                    } else {
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
                    }
                    t += 0.1;
                }
            }
            origCoordinates[0] = (x0 + parseFloat(origCoordinates[6])).toString();
            origCoordinates[1] = (y0 + parseFloat(origCoordinates[7])).toString();
        }
        i++;
    }
    let returnWith = new Object();
    if (compare.x != undefined) {
        returnWith = {"closest-point": compressNum(mindist, 1), "dir-of-borderpoints": dir}
    } else {
        if (path0 == "" || stillGetSizeData) {
            returnWith = {"x": compressNum(minx, 3), "y": compressNum(miny, 3), "width": compressNum(maxx - minx, 3), "height": compressNum(maxy - miny, 3), "midx": compressNum((minx + maxx) / 2, 3), "midy": compressNum((miny + maxy) / 2, 3)}; // x position,  y position,length, height, middle point coordinates
        }
        if(path0 != "") {
            returnWith["closest-border"] = compressNum(mindist, 1);
            returnWith.dir = dir;
        }
    }
    return returnWith;
}

// For accuracy calculations
function getFurthest() {
    let furthestCounty = "";
    let furthestDist = 0;
    let AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
    let tempDist;
    let tempData;
    if (CountyList.length < closestTerritories.length) {
        closestTerritories = Array(CountyList.length);
    }
    let tempClosests = Array(closestTerritories.length);
    for (let examinedCounty of AllCountyNames) {
        tempData = trackPath(absToRel(examinedCounty.getAttribute('d')));
        tempDist = distanceOf(metaData.midx, metaData.midy, tempData.midx, tempData.midy);
        if (tempDist > furthestDist) {
            furthestDist = tempDist;
            furthestCounty = examinedCounty.id;
        }
        for (let i = 0; i < tempClosests.length;i++) {
            if (tempClosests[i] == null || tempClosests[i] === NaN || tempClosests[i] === '' || tempClosests[i].dist > tempDist) {
                tempClosests = insertToArray(tempClosests, {"name": examinedCounty.id, "dist": tempDist}, i);
                if (tempClosests.length > closestTerritories.length) {
                    tempClosests.pop();
                }
                break;
            }
        }
    }
    closestTerritories = tempClosests;
    return {"name": furthestCounty, "dist": furthestDist};
}

function getNeighbours() {
    let path1, pathdata = {};
    console.log(closestTerritories)
    let path0 = absToRel(document.querySelector(`#mapTemplate > svg > g > #${Solution}`).getAttribute('d'));
    for (let territory = 0; territory < closestTerritories.length;) {
        if (Solution !== closestTerritories[territory].name) {
            path1 = absToRel(document.querySelector(`#mapTemplate > svg > g > #${closestTerritories[territory].name}`).getAttribute('d'));
            pathdata = trackPath(path1, {}, path0);
        }
        if(pathdata["closest-border"] > 1 || Solution === closestTerritories[territory].name) {
            closestTerritories = removeFromArray(closestTerritories, territory);
        } else {
            territory++
        }
    }
}

function getImageMetadata() {
    try {
        let placeholders = document.querySelectorAll("[placeholder]");
        let meta = document.querySelector("#mapMetadata");
        let newPlaceholder = meta.getAttribute('placeholder');
        if (newPlaceholder == null) {
            newPlaceholder = 'ph2';
        }
        for (let placeholder of placeholders) {
            placeholder.setAttribute('lnph', newPlaceholder);
        }
        Scale = parseFloat(meta.getAttribute('scale'));
    } catch (error) {
        console.log('Could not find metadata.');
        console.error(error);
    }
}
