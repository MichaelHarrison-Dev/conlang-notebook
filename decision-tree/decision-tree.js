function createDecisionTree() {
    // get word arrays from local storage
    let validWords = JSON.parse(localStorage.getItem("valid-words")) ?? [];
    let invalidWords = JSON.parse(localStorage.getItem("invalid-words")) ?? [];

    // create data sets
    let validDataSet = validWords.map(word => { return { word: word, label: "valid-word" } });
    let invalidDataSet = invalidWords.map(word => { return { word: word, label: "invalid-word" } });
    let mergedDataSet = validDataSet.concat(invalidDataSet);

    // separate entries of the merged data set by length
    let wordLengthToDataSet = new Map();
    for (entry of mergedDataSet) {
        let wordLength = entry.word.sounds.length;
        if (wordLengthToDataSet.has(wordLength)) {
            wordLengthToDataSet.get(wordLength).push(entry);
        } else {
            wordLengthToDataSet.set(wordLength, new Array(entry));
        }
    }

    // create decision tree map
    let decisionTreeMap = new Map();
    wordLengthToDataSet.forEach((value, key, map) => {
        decisionTreeMap.set(key, buildTree(value));
    });

    return {
        label: function (word) {
            let decisionTree = decisionTreeMap.get(word.sounds.length);
            if (decisionTree == undefined) {
                return undefined;
            }
            return decisionTree.label(word);
        }
    };
}

function buildTree(dataSet) {
    let question = getBestQuestion(dataSet);
    if (question == null) {
        return createLabelNode(dataSet);
    } else {
        let [trueDataSet, falseDataSet] = partition(question, dataSet);
        let trueChild = buildTree(trueDataSet);
        let falseChild = buildTree(falseDataSet);
        return createPartitionNode(trueChild, falseChild, question);
    }
}

function getBestQuestion(dataSet) {
    let giniImpurityOfDataSet = calculateGiniImpurity(dataSet);
    let bestInformationGain = 0;
    let bestQuestion = undefined;

    let questions = createQuestions(dataSet);
    for (let question of questions) {
        let [trueDataSet, falseDataSet] = partition(question, dataSet);
        let giniImpurityOfTrueDataSet = calculateGiniImpurity(trueDataSet);
        let giniImpurityOfFalseDataSet = calculateGiniImpurity(falseDataSet);
        let informationGain = giniImpurityOfDataSet
            - (giniImpurityOfTrueDataSet * (trueDataSet.length / dataSet.length))
            - (giniImpurityOfFalseDataSet * (falseDataSet.length / dataSet.length));
        if (informationGain > bestInformationGain) {
            bestInformationGain = informationGain;
            bestQuestion = question;
        }
    }

    return bestQuestion;
}

function calculateGiniImpurity(dataSet) {
    let labelToCount = new Map();
    for (let entry of dataSet) {
        let currentCount = labelToCount.get(entry.label) ?? 0;
        labelToCount.set(entry.label, currentCount + 1);
    }

    let giniImpurity = 1;
    for (let count of labelToCount.values()) {
        giniImpurity -= Math.pow(count / dataSet.length, 2);
    }

    return giniImpurity;
}

function createQuestions(dataSet) {
    let indexToAttributeSet = new Map();
    for (let entry of dataSet) {
        for (let [index, sound] of entry.word.sounds.entries()) {
            for (let attribute of sound.attributes) {
                let attributeSet = indexToAttributeSet.get(index) ?? new Set();
                attributeSet.add(attribute);
                indexToAttributeSet.set(index, attributeSet);
            }
        }
    }

    let questions = [];
    for (let [index, attributeSet] of indexToAttributeSet.entries()) {
        for (let attribute of attributeSet) {
            questions.push({
                index: index,
                attribute: attribute,
                test: function (word) {
                    return word.sounds[this.index].attributes.includes(this.attribute);
                }
            });
        }
    }

    return questions;
}

function partition(question, dataSet) {
    let trueDataSet = [];
    let falseDataSet = [];

    for (entry of dataSet) {
        if (question.test(entry.word)) {
            trueDataSet.push(entry);
        } else {
            falseDataSet.push(entry);
        }
    }

    return [trueDataSet, falseDataSet];
}

function createPartitionNode(trueChild, falseChild, question) {
    return {
        trueChild: trueChild,
        falseChild: falseChild,
        question: question,
        label: function (word) {
            if (this.question.test(word)) {
                return this.trueChild.label(word);
            } else {
                return this.falseChild.label(word);
            }
        }
    };
}

function createLabelNode(dataSet) {
    return {
        labels: dataSet.map(entry => entry.label),
        label: function (word) {
            return getRandomElement(this.labels);
        }
    };
}

function getRandomElement(array) {
    return array[Math.floor(array.length * Math.random())];
}
