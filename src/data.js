// **Saving things to the browser's local storage**

function loadFromLocal() {
    if (loadLoc("lang") != null) {
        if (loadLoc("lang")) Language = loadLoc("lang");
        if (loadLoc("theme")) mainTheme = loadLoc("theme");
        if (loadLoc("tries")) numberOfTries = parseInt(loadLoc("tries"));
        if (loadLoc("unit")) distanceUnit = loadLoc("unit");
        if (loadLoc("map")) mapTheme = loadLoc("map");
        if (loadLoc("hide")) hideShape = (loadLoc("hide") === 'true');
        if (loadLoc("rotate")) rotateShape = (loadLoc("rotate") === 'true');
        if (loadLoc("size")) sizePercent = (loadLoc("size") === 'true');
        if (loadLoc("usearabicnums")) arabicInSuggestions = (loadLoc("usearabicnums") === 'true');
        if (loadLoc("borders")) computingMethod = loadLoc("borders");
    }
}

// The saveToLoc function is used to save a specific item to the browser's local storage based on the provided item name and value.
function saveToLoc(item, value) {
    localStorage.setItem(item, value);
}

// The loadLoc function is used to retrieve a specific item from the browser's local storage based on the provided item name.
function loadLoc(item) {
    return localStorage.getItem(item);
}

// The clearLocalStorage function is used to clear all items from the browser's local storage.
function clearLocalStorage() {
    localStorage.clear();
}

// The saveToCookie function is used to save a list (in object format) of items to the browser's cookies.
function saveToCookie(items) {
    for (const item in items) {
        const value = items[item];
        document.cookie = `${item}=${value}; SameSite=Lax; path=/`;
    }
}

// The deleteCookie function is used to delete a specific cookie from the browser's cookies based on the provided item name.
function deleteCookie(item) {
    document.cookie = `${item}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// The loadFromCookie function is used to retrieve a specific item from the browser's cookies based on the provided item name.
function loadFromCookie(item = "") {
    item = item.toString();
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${item}=`)) {
            const value = cookie.substring(item.length + 1);
            return isNaN(value) ? value : parseInt(value);
        }
    }
    return null;
}
