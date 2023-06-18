// Sets the theme in accordance with browser's preferences
function initialThemeSetup() {
    if (mainTheme == undefined) {
        let themeEqualDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (themeEqualDark) {
            mainTheme = "dark";
        } else {
            mainTheme = "light";
        }
    }
}

// Change the main theme of the page
function setThemeTo(theme) {
    if (theme === "dark") {
        for(let varname in darkThemeArray) { // Cycle through the metadata array (object)
            document.documentElement.style.setProperty(`--${varname}`, darkThemeArray[varname]); // replaces the :root variables (--${their names} -> property: ${their vales} -> value) 
        }
    }
    if (theme === "light") {
        for(let varname in lightThemeArray) { // Cycle through the metadata array (object)
            document.documentElement.style.setProperty(`--${varname}`, lightThemeArray[varname]); // replaces the :root variables (--${their names} -> property: ${their vales} -> value) 
        }
    }
}
