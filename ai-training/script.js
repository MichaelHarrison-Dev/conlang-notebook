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

// Main Logic
function initialize() {
    let wordStructureDeclarationText = localStorage.getItem("word-structure-declaration-text");

    if (wordStructureDeclarationText == null) {
        primaryParagraph.innerText = "Your phonology is incomplete!";
        secondaryParagraph.innerText = "Before using this feature, your phonology must be completely defined";
    } else {
        wordStructureDeclarationText.split('\n').forEach(declaration => {
            let checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            checkbox.setAttribute("id", declaration);
            checkbox.setAttribute("name", "word-structure-declaration");
            checkbox.setAttribute("value", declaration);
            checkbox.addEventListener("change", () => {
                let checkedDeclarations = Array.from(document.getElementsByName("word-structure-declaration")).filter(x => x.checked).map(x => x.value);
                if (checkedDeclarations.length > 0) {
                    randomWordGenerator = createRandomWordGenerator(checkedDeclarations);
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

        let validWordArrayText = localStorage.getItem("valid-word-array-text");
        if (validWordArrayText == null) {
            validWords = [];
        } else {
            validWords = JSON.parse(validWordArrayText);
        }

        let invalidWordArrayText = localStorage.getItem("invalid-word-array-text");
        if (invalidWordArrayText == null) {
            invalidWords = [];
        } else {
            invalidWords = JSON.parse(invalidWordArrayText);
        }

        primaryParagraph.innerText = "Select at least one word structure";
    }
}

function saveWordLists() {
    localStorage.setItem("valid-word-array-text", JSON.stringify(validWords));
    localStorage.setItem("invalid-word-array-text", JSON.stringify(invalidWords));
}
