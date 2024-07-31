// Document Elements
const wordStructureDeclarationList = document.getElementById("word-structure-declaration-list");
const primaryParagraph = document.getElementById("primary-paragraph");
const secondaryParagraph = document.getElementById("secondary-paragraph");

// Variables
let running = false;
let currentWord = undefined;
let validWords = undefined;
let invalidWords = undefined;
let randomWordGenerator = undefined;

// Event Listener Logic
window.addEventListener("keydown", event => {
    if (running) {
        if (event.key == "ArrowLeft") {
            invalidWords.push(currentWord);
            currentWord = randomWordGenerator.createWord();
            primaryParagraph.innerText = currentWord.getSpelling();
        } else if (event.key == "ArrowRight") {
            validWords.push(currentWord);
            currentWord = randomWordGenerator.createWord();
            primaryParagraph.innerText = currentWord.getSpelling();
        }
    }
});

// Initialization Logic
function initialize() {
    let phonology = JSON.parse(localStorage.getItem("phonology"));

    // set default display text
    if (phonology == null) {
        primaryParagraph.innerText = "Your phonology is incomplete!";
        secondaryParagraph.innerText = "Before using this feature, your phonology must be completely defined";
        return;
    } else {
        primaryParagraph.innerText = "Select at least one word structure";
    }

    // populate word structure list
    phonology.wordStructures.forEach(wordStructure => {
        let declaration = "";
        for (soundClass of wordStructure.soundClasses) {
            declaration += soundClass.className;
        }

        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "word-structure-declaration");
        checkbox.setAttribute("value", JSON.stringify(wordStructure));
        checkbox.addEventListener("change", () => {
            let selectedWordStructures = Array.from(document.getElementsByName("word-structure-declaration"))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => JSON.parse(checkbox.value));
            if (selectedWordStructures.length > 0) {
                randomWordGenerator = createRandomWordGenerator(selectedWordStructures);
                currentWord = randomWordGenerator.createWord();
                primaryParagraph.innerText = currentWord.getSpelling();
                running = true;
            } else {
                primaryParagraph.innerText = "Select at least one word structure";
                running = false;
            }
        });

        let label = document.createElement("label");
        label.setAttribute("for", declaration);
        label.innerText = " " + declaration;

        let listItem = document.createElement("li");
        listItem.appendChild(checkbox);
        listItem.appendChild(label);

        wordStructureDeclarationList.append(listItem);
    });

    // load labeled words 
    validWords = JSON.parse(localStorage.getItem("valid-words")) ?? [];
    invalidWords = JSON.parse(localStorage.getItem("invalid-words")) ?? [];
}

function saveWordLists() {
    localStorage.setItem("valid-words", JSON.stringify(validWords));
    localStorage.setItem("invalid-words", JSON.stringify(invalidWords));
}
