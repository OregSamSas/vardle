
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Load the map based on the URL
function loadMapFromURL() {
    let imgFolder = "data/img/";
    if (urlParams.get('map') === 'bundesländer' || urlParams.get('map') === 'germany' || urlParams.get('map') === 'wurstspaetzle') {
        imageOrigin = imgFolder + "Karte_Deutsche_Bundesländer_(Plain).svg";
        gameMap = "Germany";
    } else if (urlParams.get('map') === 'modern' || urlParams.get('map') === 'hungary') {
        imageOrigin = imgFolder + "Hungary_counties_(Plain).svg";
        gameMap = "Hungary";
    } else if (urlParams.get('map') === 'romania' || urlParams.get('map') === 'ciorbaiahnie' || urlParams.get('map') === 'taleland') {
        imageOrigin = imgFolder + "Romania_Counties_(Plain).svg";
        gameMap = "Romania";
    } else if (urlParams.get('map') === 'map' || urlParams.get('map') === 'world') {
        imageOrigin = imgFolder + "world-map.svg";
        gameMap = "World";
    } else if (urlParams.get('map') === 'baguettecroissant' || urlParams.get('map') === 'france') {
        imageOrigin = imgFolder + "Regions_France_(Plain).svg";
        gameMap = "France";
    } else if (urlParams.get('map') === 'bp' || urlParams.get('map') === 'budapest') {
        imageOrigin = imgFolder + "Budapest_Districts.svg";
        gameMap = "Budapest";
    } else if (urlParams.get('map') === 'szeiman' || urlParams.get('map') === 'huncities') {
        imageOrigin = imgFolder + "Szeiman_Városok.svg";
        gameMap = "Cities";
    } else if (urlParams.get('map') === 'pizzapasta' || urlParams.get('map') === 'italy') {
        imageOrigin = imgFolder + "Flag_map_of_Italy_with_regions.svg";
        gameMap = "Italy";
    } else if (urlParams.get('map') === 'poland' || urlParams.get('map') === 'polishedmap') {
        imageOrigin = imgFolder + "Regions_of_Poland.svg";
        gameMap = "Poland";

    // Custom maps
    } else if (urlParams.has('map')) {
        imageOrigin = urlParams.get('map');
        gameMap = "Custom";
    
    // Default map
    } else {
        gameMap = "Original";
    }
}

// Set the solution based on the URL
function getURLSolution() {
    if (urlParams.has('sol')) {
        if (CountyList.includes(replaceSpecialCharacters(urlParams.get('sol')))) {
            Solution = replaceSpecialCharacters(urlParams.get('sol'));
        } else {
            Solution = replaceSpecialCharacters(CountyList[findItemWithoutAccentmarks(CountyList, urlParams.get('sol'))]);
        }
    }
}