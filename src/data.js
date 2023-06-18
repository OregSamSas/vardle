// **Saving things to the browser's local storage**

function loadFromLocal() {
    if (load("lang") != null) {
        if (load("lang")) Language = load("lang");
        if (load("theme")) mainTheme = load("theme");
        if (load("tries")) numberOfTries = parseInt(load("tries"));
        if (load("unit")) distanceUnit = load("unit");
        if (load("map")) mapTheme = load("map");
        if (load("hide")) hideShape = (load("hide") === 'true');
        if (load("rotate")) rotateShape = (load("rotate") === 'true');
        if (load("size")) sizePercent = (load("size") === 'true');
        if (load("usearabicnums")) arabicInSuggestions = (load("usearabicnums") === 'true');
    }
}

function load(item) {
    return localStorage.getItem(item);
}
