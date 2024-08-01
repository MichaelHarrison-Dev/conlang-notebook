// Document Elements
const wordCountInput = document.getElementById("word-count-input");
const wordStructureDeclarationList = document.getElementById("word-structure-declaration-list");
const outputParagraph = document.getElementById("output-paragraph");

// Variables
let randomWordGenerator = undefined;
let decisionTree = createDecisionTree();

function setup() {
    let phonology = JSON.parse(localStorage.getItem("phonology"));
    if (phonology == null) {
        return;
    }

    // populate word structure list
    phonology.wordStructures.forEach(wordStructure => {
        let declaration = "";
        for (soundClass of wordStructure.soundClasses) {
            declaration += soundClass.className;
        }

        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", declaration);
        checkbox.setAttribute("name", "word-structure-declaration");
        checkbox.setAttribute("value", JSON.stringify(wordStructure));
        checkbox.addEventListener("change", () => {
            let selectedWordStructures = Array.from(document.getElementsByName("word-structure-declaration"))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => JSON.parse(checkbox.value));
            if (selectedWordStructures.length > 0) {
                randomWordGenerator = createRandomWordGenerator(selectedWordStructures);
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
}

function generateWords() {
    if (randomWordGenerator == undefined || randomWordGenerator == null) {
        return;
    }

    let wordCount = Number(wordCountInput.value);
    for (let i = 0; i < wordCount; i++) {
        let word = randomWordGenerator.createWord();
        while (decisionTree.label(word) == "invalid-word") {
            word = randomWordGenerator.createWord();
        }
        outputParagraph.innerText += word.getSpelling() + "\n";
    }
}
