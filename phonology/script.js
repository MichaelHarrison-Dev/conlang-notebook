// Document Elements
const soundDeclarationTextArea = document.getElementById("sound-declaration-textarea");
const soundClassDeclarationTextArea = document.getElementById("sound-class-declaration-textarea");
const wordStructureDeclarationTextArea = document.getElementById("word-structure-declaration-textarea");

// Local Storage Logic
function savePhonology() {
    let soundDeclarations = formatToStore(soundDeclarationTextArea.value).split('\n');
    if (!validateSoundDeclarations(soundDeclarations)) {
        return;
    }

    let soundClassDeclarations = formatToStore(soundClassDeclarationTextArea.value).split('\n');
    if (!validateSoundClassDeclarations(soundClassDeclarations)
        || !validateSoundReferences(soundClassDeclarations, soundDeclarations)) {
        return;
    }

    let wordStructureDeclarations = formatToStore(wordStructureDeclarationTextArea.value).split('\n');
    if (!validateWordStructureDeclarations(wordStructureDeclarations)
        || !validateSoundClassReferences(wordStructureDeclarations, soundClassDeclarations)) {
        return;
    }

    let sounds = initializeSounds(soundDeclarations);
    let soundClasses = initializeSoundClasses(soundClassDeclarations, sounds);
    let wordStructures = initializeWordStructures(wordStructureDeclarations, soundClasses);
    let phonology = { sounds: sounds, soundClasses: soundClasses, wordStructures: wordStructures };
    localStorage.setItem("phonology", JSON.stringify(phonology));
}

function loadPhonology() {
    let phonology = JSON.parse(localStorage.getItem("phonology"));

    if (phonology != null) {
        phonology.sounds.forEach(sound => {
            soundDeclarationTextArea.value += sound.spelling;
            soundDeclarationTextArea.value += " : ";
            sound.attributes.forEach((attribute, index) => soundDeclarationTextArea.value += (index == sound.attributes.length - 1) ? attribute + "\n" : attribute + ", ");
        });

        phonology.soundClasses.forEach(soundClass => {
            soundClassDeclarationTextArea.value += soundClass.className;
            soundClassDeclarationTextArea.value += " : ";
            soundClass.sounds.forEach((sound, index) => soundClassDeclarationTextArea.value += (index == soundClass.sounds.length - 1) ? sound.spelling + "\n" : sound.spelling + ", ");
        });

        phonology.wordStructures.forEach(wordStructure => {
            wordStructure.soundClasses.forEach((soundClass, index) => wordStructureDeclarationTextArea.value += (index == wordStructure.soundClasses.length - 1) ? soundClass.className + "\n" : soundClass.className);
        });
    }
}

// Formatting Logic
function formatToStore(text) {
    return text
        .replace(/\s+(?=(\n|$))/, "")
        .replace(/[ ]+/g, "")
}

function formatToDisplay(text) {
    if (text == null) {
        return "";
    }

    return text
        .replace(/:/g, " : ")
        .replace(/,/g, ", ");
}

// Syntax Validation Logic
function validateSoundDeclarations(declarations) {
    let caller = "Sound Declaration";
    for (const declaration of declarations) {
        if (/^$/.test(declaration)) {
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

        let referenceSection = declaration.split(':')[1];

        if (/^,/.test(referenceSection) || /,,/.test(referenceSection)) {
            displayAlert(caller, "empty reference", declaration);
            return false;
        }

        if (/,$/.test(referenceSection)) {
            displayAlert(caller, "trailing comma", declaration);
            return false;
        }
    }

    return true;
}

function validateSoundClassDeclarations(declarations) {
    let caller = "Sound Class Declaration";
    for (const declaration of declarations) {
        if (/^$/.test(declaration)) {
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
    }

    return true;
}

function validateWordStructureDeclarations(declarations) {
    let caller = "Word Structure Declaration";
    for (const declaration of declarations) {
        if (/^$/.test(declaration)) {
            displayAlert(caller, "empty declaration", declaration);
            return false;
        }
    }

    return true;
}

// Reference Validation Logic
function validateSoundReferences(soundClassDeclarations, soundDeclarations) {
    let spellings = soundDeclarations.map(declaration => declaration.split(':')[0]);
    for (const declaration of soundClassDeclarations) {
        let references = declaration.split(':')[1].split(',');
        let validatedReferences = references.every(reference => spellings.includes(reference));
        if (!validatedReferences) {
            return false;
        }
    }

    return true;
}

function validateSoundClassReferences(wordStructureDeclarations, soundClassDeclarations) {
    let classNames = soundClassDeclarations.map(declaration => declaration.split(':')[0]);
    for (const declaration of wordStructureDeclarations) {
        let references = declaration.split('');
        let validatedReferences = references.every(reference => classNames.includes(reference));
        if (!validatedReferences) {
            return false;
        }
    }

    return true;
}

// Validation Utility Function
function displayAlert(caller, error, line) {
    alert(caller + "\n- error: " + error + "\n- declaration: " + formatToDisplay(line));
}

// Initialization Logic
function initializeSounds(declarations) {
    return declarations.map(declaration => {
        let components = declaration.split(':');
        return { spelling: components[0], attributes: components[1].split(',') };
    });
}

function initializeSoundClasses(declarations, sounds) {
    return declarations.map(declaration => {
        let components = declaration.split(':');
        let references = components[1].split(',');
        let referencedSounds = sounds.filter(sound => references.includes(sound.spelling));
        return { className: components[0], sounds: referencedSounds };
    });
}

function initializeWordStructures(declarations, soundClasses) {
    return declarations.map(declaration => {
        let references = declaration.split('');
        let referencedSoundClasses = references.map(reference => {
            return soundClasses.filter(soundClass => soundClass.className == reference)[0]
        });
        return { soundClasses: referencedSoundClasses };
    });
}
