function createRandomWordGenerator(wordStructures) {
    return {
        createWord: function () {
            let wordStructure = getRandomElement(wordStructures);
            return {
                sounds: wordStructure.soundClasses.map(soundClass => getRandomElement(soundClass.sounds)),
                getSpelling: function () {
                    let spelling = "";
                    this.sounds.forEach(sound => spelling += sound.spelling);
                    return spelling;
                }
            };
        }
    };
}

function getRandomElement(array) {
    return array[Math.floor(array.length * Math.random())];
}
