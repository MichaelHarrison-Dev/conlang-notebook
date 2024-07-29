function createRandomWordGenerator(wordStructureDeclarations) {
    let soundDeclarationText = localStorage.getItem("sound-declaration-text");
    let soundClassDeclarationText = localStorage.getItem("sound-class-declaration-text");
    let wordStructureDeclarationText = localStorage.getItem("word-structure-declaration-text");

    if (wordStructureDeclarationText == null) {
        return null;
    }

    let spellingToAttributes = new Map();
    soundDeclarationText.split('\n').forEach(declaration => {
        let components = declaration.split(':');
        spellingToAttributes.set(components[0], components[1].split(','));
    });

    let classNameToSoundSpellings = new Map();
    soundClassDeclarationText.split('\n').forEach(declaration => {
        let components = declaration.split(':');
        classNameToSoundSpellings.set(components[0], components[1].split(','));
    });

    return {
        createWord: function () {
            let wordStructure = getRandomElement(wordStructureDeclarations).split('');
            return {
                spellings: wordStructure.map(className => getRandomElement(classNameToSoundSpellings.get(className))),
                getSpelling: function () {
                    let spellingString = "";
                    this.spellings.forEach(spelling => spellingString += spelling);
                    return spellingString;
                }
            };
        }
    };
}

function getRandomElement(array) {
    return array[Math.floor(array.length * Math.random())];
}
