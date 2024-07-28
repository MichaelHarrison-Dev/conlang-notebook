// Document Elements
const soundDeclarationTextArea = document.getElementById("sound-declaration-textarea");
const soundClassDeclarationTextArea = document.getElementById("sound-class-declaration-textarea");
const wordStructureDeclarationTextArea = document.getElementById("word-structure-declaration-textarea");

// Local Storage Logic
function saveDeclarationTexts() {
    let formattedSoundDeclarationText = formatToStore(soundDeclarationTextArea.value);
    if (validateSoundDeclarationText(formattedSoundDeclarationText)) {
        localStorage.setItem("sound-declaration-text", formattedSoundDeclarationText);
    }

    let formattedSoundClassDeclarationText = formatToStore(soundClassDeclarationTextArea.value);
    if (validateSoundClassDeclarationText(formattedSoundClassDeclarationText, formattedSoundDeclarationText)) {
        localStorage.setItem("sound-class-declaration-text", formattedSoundClassDeclarationText);
    }

    let formattedWordStructureDeclarationText = formatToStore(wordStructureDeclarationTextArea.value);
    if (validateWordStructureDeclarationText(formattedWordStructureDeclarationText, formattedSoundClassDeclarationText)) {
        localStorage.setItem("word-structure-declaration-text", formattedWordStructureDeclarationText);
    }
}

function loadDeclarationTexts() {
    soundDeclarationTextArea.value = formatToDisplay(localStorage.getItem("sound-declaration-text"));
    soundClassDeclarationTextArea.value = formatToDisplay(localStorage.getItem("sound-class-declaration-text"));
    wordStructureDeclarationTextArea.value = formatToDisplay(localStorage.getItem("word-structure-declaration-text"));
}

// Formatting Logic
function formatToStore(text) {
    return text
        .replace(/\s+(?=(\n|$))/, "") // removes empty lines
        .replace(/[ ]+/g, "") // removes whitespace
}

function formatToDisplay(text) {
    if (text == null) {
        return "";
    }

    return text
        .replace(/:/g, " : ") // adds padding around colon
        .replace(/,/g, ", "); // adds padding after comma
}

// Validation Logic
function validateSoundDeclarationText(text) {
    let usedSpellings = [];
    for (const soundDeclaration of text.split('\n')) {
        if (!validateSoundDeclaration(soundDeclaration, usedSpellings)) {
            return false;
        }

        usedSpellings.push(soundDeclaration.split(':')[0]);
    }

    return true;
}

function validateSoundClassDeclarationText(text, soundDeclarationText) {
    let usedNames = [];
    for (const soundClassDeclaration of text.split('\n')) {
        if (!validateSoundClassDeclaration(soundClassDeclaration, soundDeclarationText, usedNames)) {
            return false;
        }

        usedNames.push(soundClassDeclaration.split(':')[0]);
    }

    return true;
}

function validateWordStructureDeclarationText(text, soundClassDeclarationText) {
    let usedWordStructureDeclarations = [];
    for (const wordStructureDeclaration of text.split('\n')) {
        if (!validateWordStructureDeclaration(wordStructureDeclaration, soundClassDeclarationText, usedWordStructureDeclarations)) {
            return false;
        }

        usedWordStructureDeclarations.push(wordStructureDeclaration);
    }

    return true;
}

function validateSoundDeclaration(declaration, usedSpellings) {
    let caller = "Sound Declaration";

    if (/^\s*$/.test(declaration)) {
        displayAlert(caller, "empty declaration", declaration);
        return false;
    }

    if (!declaration.includes(":")) {
        displayAlert(caller, "missing colon delimeter", declaration);
        return false;
    }

    if (/^:/.test(declaration)) {
        displayAlert(caller, "missing spelling section", declaration);
        return false;
    }

    if (/:$/.test(declaration)) {
        displayAlert(caller, "missing attribute section", declaration);
        return false;
    }

    if (usedSpellings.includes(declaration.split(':')[0])) {
        displayAlert(caller, "spelling collision", declaration);
        return false;
    }

    return true;
}

function validateSoundClassDeclaration(declaration, soundDeclarationText, usedNames) {
    let caller = "Sound Class Declaration";

    if (/^\s*$/.test(declaration)) {
        displayAlert(caller, "empty declaration", declaration);
        return false;
    }

    if (!declaration.includes(":")) {
        displayAlert(caller, "missing colon delimeter", declaration);
        return false;
    }

    if (/^:/.test(declaration)) {
        displayAlert(caller, "missing name section", declaration);
        return false;
    }

    if (!/^\w{1}:/.test(declaration)) {
        displayAlert(caller, "name is longer than one character", declaration);
        return false;
    }

    if (/:$/.test(declaration)) {
        displayAlert(caller, "missing reference section", declaration);
        return false;
    }

    let referenceSection = declaration.split(':')[1];

    if (/^,/.test(referenceSection) || /,,/.test(referenceSection)) {
        displayAlert(caller, "empty reference", declaration);
        return false;
    }

    if (/,$/.test(referenceSection)) {
        displayAlert(caller, "trailing comma", declaration);
        return false;
    }

    let definedSoundReferences = soundDeclarationText
        .split('\n')
        .map((soundDeclaration) => soundDeclaration.split(':')[0]);

    for (const reference of referenceSection.split(',')) {
        if (!definedSoundReferences.includes(reference)) {
            displayAlert(caller, "undefined sound reference: " + reference, declaration);
            return false;
        }
    }

    if (usedNames.includes(declaration.split(':')[0])) {
        displayAlert(caller, "name collision", declaration);
        return false;
    }

    return true;
}

function validateWordStructureDeclaration(declaration, soundClassDeclarationText, usedWordStructureDeclarations) {
    let caller = "Word Structure Declaration";

    if (/^$/.test(declaration)) {
        displayAlert(caller, "empty declaration", declaration);
        return false;
    }

    let definedSoundClassReferences = soundClassDeclarationText
        .split('\n')
        .map((soundDeclaration) => soundDeclaration.split(':')[0]);

    for (const reference of declaration.split('')) {
        if (!definedSoundClassReferences.includes(reference)) {
            displayAlert(caller, "undefined class reference: " + reference, declaration);
            return false;
        }
    }

    if (usedWordStructureDeclarations.includes(declaration)) {
        displayAlert(caller, "declaration collision", declaration);
        return false;
    }

    return true;
}

function displayAlert(caller, error, line) {
    alert(caller + "\n- error: " + error + "\n- declaration: " + formatToDisplay(line));
}
