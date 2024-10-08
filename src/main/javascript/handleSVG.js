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
        path.id = newId;
        path.id = replaceSpecialCharacters(path.id, false, false);
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
    if (paths.length === undefined || paths === null || paths === undefined) {
        paths = document.querySelectorAll(`#${imageId} > svg > path`);
        let newgroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        if (paths[0] == undefined) {
            document.querySelector(`#${imageId} > svg`).appendChild(newgroup);
        } else {
            paths[0].ownerSVGElement.appendChild(newgroup);
        }
        let newpath;
        for (let thispath of paths) {
            newpath = thispath.cloneNode();
            newgroup.appendChild(newpath);
            thispath.remove();
        }
    }
}

function adjustMetaData(data, withRatio) {
    for (let datapiece in data) {
        data[datapiece] = data[datapiece] / withRatio;
    }
    return data;
}

// function for insert a county to guess
function getCountyImage(id = '', num, forceNoRotating = false, cities = false) {
    let ratio;
    let placeToInsert = document.getElementById(id);
    let desiredshape = document.querySelector(`#mapTemplate > svg > g > #${CountyList[num]}`);
    if (num != undefined && desiredshape != null) {
        desiredshape = desiredshape.cloneNode();
        let svg = document.getElementById('mapTemplate').firstElementChild.cloneNode();
        svg.appendChild(document.createElement('g'));
        svg.firstElementChild.appendChild(desiredshape);
        placeToInsert.appendChild(svg);

        if (cities) {
            let citylist = getIndexByProperty(Cities, "county", Solution, true), cityidx, city, citylmnt;
            for (let citynum = 0; citynum < citylist.length; citynum++) {
                cityidx = citylist[citynum];
                city = Cities[cityidx]
                try {
                    citylmnt = document.querySelector(`circle#${city.name}`).cloneNode();
                } catch {
                    citylmnt = document.getElementById(city.name).cloneNode();
                }
                citylmnt.setAttribute('name', citylmnt.id);
                svg.appendChild(citylmnt)
            }
        }
        
        ratio = handleDesiredShape(desiredshape, 1, cities);
    } else {
        let allCounties = new XMLHttpRequest();
        allCounties.open("GET", imageOrigin, false);
        // Following line is just to be on the safe side
        allCounties.overrideMimeType("image/svg+xml");
        allCounties.onload = (e) => {
            try {
                placeToInsert.appendChild(allCounties.responseXML.documentElement);
            } catch {
                allCounties.open("GET", "data/img/Kingdom_of_Hungary_counties_(Plain).svg", false);
                allCounties.onload = (e) => {
                    placeToInsert.appendChild(allCounties.responseXML.documentElement);
                }
                allCounties.send("");
            }
        };
        allCounties.send("");

        // Get city data if not already done (probably not, but just to be sure)
        if (Cities[0] == undefined) {
            getCityData();
        }

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

        if (!(swapCoasAndShapes && Round === 0)) {
            
            // Resize SVG
            svgImage = document.querySelector('#' + id + ' > svg');
            svgImage.setAttribute("width", metaData.width * parseFloat(ratio));
            svgImage.setAttribute("height", metaData.height * parseFloat(ratio));

            makeSpaceInSVG(svgImage);

            // Rotate image if desired
            if (rotateShape && !forceNoRotating) {
                rotateSVG(svgImage, Rotation, placeToInsert);
            }

            // Remove text
            try {document.querySelector(`#${id} > svg > #textgroup`).remove();} catch {}
        }
    }
}

function handleDesiredShape(thisPath, imgRatio = 1, cities = false) {
    if (Round === 0) {
        Solution = thisPath.id;
        solutionText = replaceSpecialCharacters(Solution, true);
    }
    thisPath.setAttribute("d", absToRel(thisPath.getAttribute("d")));
    if (Round === 0) {
        solutionPath = thisPath.getAttribute('d');
    }
    metaData = trackPath(thisPath.getAttribute("d"));
    metaData = adjustMetaData(metaData, imgRatio);
    if(metaData.height === 0) {
        metaData.height = 120;
        metaData.width = 120;
    }
    let biggerSize = Math.sqrt(metaData.width ** 2 + metaData.height ** 2);
    if (cities) {
        document.querySelectorAll('#mainImage > svg > circle').forEach((l) => {
            l.setAttribute('cx', parseFloat(l.getAttribute('cx')) - metaData.x * imgRatio);
            l.setAttribute('cy', parseFloat(l.getAttribute('cy')) - metaData.y * imgRatio);
            l.style.display = "none";
        });
    }
    thisPath.setAttribute("d", movePath(thisPath.getAttribute("d"), 0 - metaData.x * imgRatio, 0 - metaData.y * imgRatio));
    let ratio = (Math.floor((180 / biggerSize) * 100000) / 100000).toString();
    thisPath.style.transform = `scale(${ratio})`;
    if (cities) {
        document.querySelectorAll('#mainImage > svg > circle').forEach((l) => {
            l.style.transform = `scale(${ratio}`;
        });
    }
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

// Acquire city positions from the SVG
function getCityData() {
    let allCities = document.querySelectorAll('#mapTemplate svg g#settlements circle');
    let cityObject = {};
    if (allCities.length !== 0) {
        allCities.forEach((city) => {
            cityObject = {"name": city.id, "x": city.getAttribute('cx'), "y": city.getAttribute('cy'), "capital": city.hasAttribute('capitalof')};
            if (city.hasAttribute('capitalof')) {
                cityObject.county = city.getAttribute('capitalof');
            } else {
                // Find that county which contains the city
                let allPaths = document.querySelectorAll('#mapTemplate > svg > g > path');
                for (let path of allPaths) {
                    if (isPointInPath(cityObject.x, cityObject.y, path)) {
                        cityObject.county = path.id;
                        break;
                    }
                }
                if (cityObject.county == undefined) {
                    cityObject.county = "Unknown";
                }
            }
            Cities.push(cityObject);
        });
    }
    document.getElementById('mapTemplate').style.display = "none";
}

// Check whether a point is in a path polygon
function isPointInPath(x, y, path) {
    let isPointInFill = false;
    try {
        let pointObj = new DOMPoint(x, y);
        isPointInFill = path.isPointInStroke(pointObj);
    } catch (e) {
        // Fallback for browsers that don't support DOMPoint as an argument
        let svg;
        try {
            svg = path.ownerSVGElement;
        } catch(e) {
            svg = findFirstParentOfType(path, 'svg');
        }
        let pointObj 
        try {
            pointObj = svg.createSVGPoint();
        } catch {
            return "SVG Point is not supported.";
        }
        pointObj.x = x;
        pointObj.y = y;
        isPointInFill = path.isPointInStroke(pointObj);
    }
    return isPointInFill;
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
function movePath(path = "" /* path data */, dx = 0, dy = 0, newx, newy) {
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

    // SETUP
    let char = 0;
    let command = "";
    let pathCommands = [];
    let pathCoordinates = [];
    let coordinates = Array(8).fill(''); //x0: last x, y0: last y, x1, y1, x2, y2, x3, y3 (coordinates to use later on)
    // We assume that if not signed, commands will meant to be interpreted as linear movements - so we set our command as l/L
    let lastCommand = ((path[0] === 'M') ? 'L' : 'l'); // if first command is in upper case: we assume the unmarked commands will be absolute, and if lower case then relative
    let initialmove = true; // to determine if the given "M" command is the first or not

    // GET DATA FROM ORIGINAL PATH DESCRIPTION
    while (char < path.length) {
        command = path[char];
        if ("chtqlmvz".includes(command.toLowerCase())) {
            char += 2;
        } else { // in case of there's no signed command: we assume, the last is still valid
            command = lastCommand;
        }
        if (command.toLocaleLowerCase() === 'z') { // end of path
            pathCoordinates.push(['']);
        } else { // store path chunk for the construction of new easy-to-process path description
            coordinates[0] = coordinates[6];
            coordinates[1] = coordinates[7]; // last position advances into the "origo" coordinates pair (first two pos. of array)
            let originalx;
            let originaly;

            // Let's determine, how many coordinates we need for the command with the index of the first coordinate to change (startPos), and with the one of the last+1 (endPos, here: coordinatesNum = # of coordinates to use)
            let startPos = (('mhql'.includes(command.toLocaleLowerCase())) ? 6 : ((command.toLocaleLowerCase() === 'v') ? 7 : 2));
            let coordinatesNum = ((command.toLocaleLowerCase() === 'h') ? 7 : 8);

            // Then: extract coordinates into our array from raw text (in path variable)
            for (let coo = startPos; coo < coordinatesNum; coo ++) {
                coordinates[coo] = '';
                while (path[char] !== " " && path[char] !== "," && char < path.length) {
                    coordinates[coo] += path[char];
                    char ++;
                }
                while(path[char] === " " || path[char] === "," && char < path.length) {
                    char ++; // get to the next coordinate by skipping the divider spaces
                }
            }

            // Fill up target x, and y position, if it's the same as last
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

            // Store original pos for later use
            originalx = parseFloat(coordinates[6]);
            originaly = parseFloat(coordinates[7]);

            // Replace absolute coordinates (only if the commands in upper case) to relative ones
            if(command === 'C' || command === 'L' || command === 'H' || command === 'V' || (command === 'M' && !initialmove)) {
                let a;
                for(let i = startPos; i < coordinatesNum; i++) {
                    coordinates[i] = (Math.round((parseFloat(coordinates[i]) - parseFloat(coordinates[i % 2])) * 1000) / 1000).toString();
                }
            }

            // store command's parameters
            pathCoordinates.push(coordinates.slice(startPos, coordinatesNum));

            // Update last pos
            if (coordinates[0] == '') coordinates[0] = "0";
            if (coordinates[1] == '') coordinates[1] = "0"; // In case, thre wer no numbers at [0] and [1] (the last position on canvas)
            if (command === command.toLocaleLowerCase()) {
                coordinates[6] = (parseFloat(coordinates[0]) + originalx).toString();
                coordinates[7] = (parseFloat(coordinates[1]) + originaly).toString();
            } else {
                coordinates[6] = originalx;
                coordinates[7] = originaly;
            }
            if (command.toLowerCase() !== 'm') { // m doesn't overwrite the command in force
                lastCommand = command;
            }
        }

        // store command (if the first M is not relative, we don't turn it into that, becuse it's better to have the first character as absolute)
        pathCommands.push((command === 'M' && initialmove) ? 'M' : command.toLocaleLowerCase());
        initialmove = false;
    }

    // CONSTRUCTION OF NEW PATH DATA
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

// Function, originally to follow through a path and collect its position data
// though it's also capable of comparing two paths, and finding the closest point of the first path to the second one (if the second one is not given, it only collects the data)
// the function is also called in the comparing process, when we go through the first path's points, and measure the distance and direction with the same function (this) of the closest point on the other path
// since the function could be also used to measure the dist and dir between a given point and its closest one on a path
function trackPath(path = new String(), compare = new Object(), path0 = new String(), stillGetSizeData = false, debug = false, deeptrack = false, curveRes = 0.1) {
    let minx=0, miny=0, maxx=0, maxy=0, x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, x3=0, y3=0, i=0, char=0, t = 0, dist=0, mindist=-1, dir=0;
    let command = "";
    let origCoordinates = Array(8).fill('');
    while (char < path.length) {
        command = path[char]; // There are commands with parameters following in the SVG path
        if(debug) console.log(command)
        char += 2;
        if (command === 'z' && path[char] != undefined) { // If the path does not end, only jumps to a non-adjacent path part
            if (path[char].toLowerCase() === 'm') {
                if (path[char] === 'M') {
                    command = 'L';
                } else {
                    command = 'l'; // For tracking the path jumping to an other place is equivalent to drawing a line there
                }
                char += 2; // Skip from the unnecessary z command to the next (recently replaced) L/l command
            }
        }
        if (command === 'M' || command === 'm') {
            if (command === 'm') { // if it's a relative move, we should add the last position's coordinates to the parameters in order to get the target coordinates
                x0 = origCoordinates[0];
                y0 = origCoordinates[1];
            }
            for (let coo = 0; coo < 2; coo++) { // get the command parameters, the two coordinates with which we jump to the path's starting position
                while (path[char] !== " " && path[char] !== ",") {
                    origCoordinates[coo] += path[char];
                    char ++;
                }
                char ++;
            }
            if (command === 'm') { // We add last position's coordinates here
                origCoordinates[0] = (x0 + parseFloat(origCoordinates[0])).toString();
                origCoordinates[1] = (y0 + parseFloat(origCoordinates[1])).toString();
            }
        }
        if ("cqlvh".includes(command)) { // That means, a curve comes
            // Get curve data (type, coordinates)
            origCoordinates[2] = '0';
            origCoordinates[3] = '0';
            let type = ((command === 'c') ? "cubic" : ((command === 'q') ? "quadratic" : "linear")); // Here are the different types of curves to be used
            let startPos = ((command === 'v') ? 3 : 2);
            let endPos = ((command === 'c') ? 8 : ((command === 'q') ? 6 : ((command === 'h') ? 3 : 4))); // v is a vertical segment and h is a horizontal one
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

            // Tracking curve (it tracks the curve between to points too)
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
            if (path0 != "") { // If we should compare two paths, we measure the distance and dir between the closest point on the other Path to the (x0, y0) point (start of the curve)
                if (mindist !== 0) { // If minimum distance found for sure (neighbouring territories), no need to check other points, only to get the dimensions of the examined territory
                    dist = trackPath(path0, {"x": x0,"y": y0}, "");
                    if (mindist === -1 || dist["closest-point"] < mindist) {
                        mindist = dist["closest-point"];
                        dir = dist["dir-of-borderpoints"];
                    }
                }
            }
            if (path0 == "" || stillGetSizeData || deeptrack) {
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
                        y = ((1-t)**2)*y0 + 2*(1-t)*t*y1 + (t**2)*y2;
                    } else {
                        x = ((1-t)**3)*x0 + 3*((1-t)**2)*t*x1 + 3*(1-t)*(t**2)*x2 + (t**3)*x3;
                        y = ((1-t)**3)*y0 + 3*((1-t)**2)*t*y1 + 3*(1-t)*(t**2)*y2 + (t**3)*y3;
                    }
                    if (path0 != "" && deeptrack) { // If we should check distance measured from points on the curve (current: (x, y)), here we do it
                        if (mindist !== 0) { // If not minimum distance already found
                            dist = trackPath(path0, {"x": x,"y": y}, "", false, false, false, curveRes);
                            if (debug) console.log(x, y, dist);
                            if (dist["closest-point"] < mindist) {
                                mindist = dist["closest-point"];
                                dir = dist["dir-of-borderpoints"];
                            }
                        }
                    } else if (compare.x != undefined) {
                        dist = distanceOf(compare.x, compare.y, x, y);
                        if (dist < mindist) {
                            mindist = dist;
                        }
                    }
                    if ((compare.x == undefined && path0 == "") || stillGetSizeData) {
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
                    t += curveRes;
                }
            }
            origCoordinates[0] = (x0 + parseFloat(origCoordinates[6])).toString();
            origCoordinates[1] = (y0 + parseFloat(origCoordinates[7])).toString();
        }
        i++;
    }
    if(debug) console.log(i);
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

// It gets the furthest territory from the solution and it also calculates the neighbouring territories
// for accuracy calculations, and for the second and third rounds
function getFurthest() {
    let furthestCounty = "";
    let furthestDist = 0;
    let AllCountyNames = document.querySelectorAll('#mapTemplate > svg > g > path');
    let tempDist;
    let tempData, tempData2;
    let tempClosests = new Array();
    for (let examinedCounty of AllCountyNames) {
        // track the examined path if it's a neighbour of the solution with a low resulation as a first probation
        tempData = trackPath(absToRel(examinedCounty.getAttribute('d')), {}, solutionPath, true, false, false, 0.4);
        if (tempData["closest-border"] >= 1 && tempData["closest-border"] <= 10) {
            // if the distance is small, check again with a higher resolution and deeptrack
            tempData2 = trackPath(absToRel(examinedCounty.getAttribute('d')), {}, solutionPath, false, false, true, 0.1);
            tempData["closest-border"] = tempData2["closest-border"];
            tempData["dir"] = tempData2["dir"];
        }
        if (examinedCounty.id == Solution) {
            tempDist = 0;
        } else {
            tempDist = distanceOf(metaData.midx, metaData.midy, tempData.midx, tempData.midy);
            if (tempData["closest-border"] < 1) {
                tempClosests.push({"name": examinedCounty.id, "dist": tempDist});
            }
            if (tempDist > furthestDist) {
                furthestDist = tempDist;
                furthestCounty = examinedCounty.id;
            }
        }
    }
    closestTerritories = tempClosests;
    return {"name": furthestCounty, "dist": furthestDist};
}

function getNeighbours() { // Legacy
    let path1, pathdata = {};
    let path0 = solutionPath;
    let allTerritories = document.querySelectorAll('#mapTemplate > svg > g > path');
    closestTerritories = [];
    allTerritories.forEach((territory) => {
        closestTerritories.push({"name": territory.id, "dist": 2030});
    });

    for (let territory = 0; territory < closestTerritories.length;) {
        if (Solution !== closestTerritories[territory].name) {
            path1 = absToRel(document.querySelector(`#mapTemplate > svg > g > #${closestTerritories[territory].name}`).getAttribute('d'));
            pathdata = trackPath(path1, {}, path0, true, false, true);
            closestTerritories[territory].dist = distanceOf(metaData.midx, metaData.midy, pathdata.midx, pathdata.midy);
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
        if (meta.getAttribute('scale') == null) {
            Scale = 1;
        } else {
            Scale = parseFloat(meta.getAttribute('scale'));
        }
    } catch (error) {
        console.log('Could not find metadata.');
        console.error(error);
    }
}

function expandSvgArea(svg, newhimod, newlenmod, childelementtypes = ['path'], transformmethod = true) {
    let oldlen = svg.getAttribute('width');
    let oldhi = svg.getAttribute('height');
    svg.setAttribute('width', oldlen * newlenmod);
    svg.setAttribute('height', oldhi * newhimod);
    childelementtypes.forEach((type) => {
        let allElements = svg.querySelectorAll(type);
        for (let element of allElements) {
            let scale = 1;
            if (transformmethod) {
                scale = /scale\(([0-9\.]*)\)/.exec(element.style.transform)[1].split(',');
                scale = scale.map((s) => parseFloat(s));
                console.log(`scale(${scale[0] * newlenmod}, ${scale[scale.length - 1] * newhimod})`);
            }
            if (type === 'circle') {
                element.setAttribute('cx', parseFloat(element.getAttribute('cx')) + oldlen * (newlenmod - 1) / 2 / scale[0]);
                element.setAttribute('cy', parseFloat(element.getAttribute('cy')) + oldhi * (newhimod - 1) / 2 / scale[scale.length - 1]);
            } else if (type === 'rect') {
                element.setAttribute('x', parseFloat(element.getAttribute('x')) + oldlen * (newlenmod - 1) / 2 / scale[0]);
                element.setAttribute('y', parseFloat(element.getAttribute('y')) + oldhi * (newhimod - 1) / 2 / scale[scale.length - 1]);
            } else if (type === 'text') {
                element.setAttribute('x', parseFloat(element.getAttribute('x')) + oldlen * (newlenmod - 1) / 2 / scale[0]);
                element.setAttribute('y', parseFloat(element.getAttribute('y')) + oldhi * (newhimod - 1) / 2 / scale[scale.length - 1]);
            } else if (type === 'path') {
                element.setAttribute('d', movePath(absToRel(element.getAttribute('d')), oldlen * (newlenmod - 1) / 2 / scale[0], oldhi * (newhimod - 1) / 2 / scale[scale.length - 1]));
            }
        }
    });
}
