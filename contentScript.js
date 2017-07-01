'use strict';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === MSG.ERASE_OBJECT) {
        removeDivs(message['classname'], message['filterTerms']);
    }
    else if (message.name === MSG.GET_URL) {
        sendResponse({
            url: getBaseUrl()
        });
    }
    else if (message.name === MSG.PREDICT_CLASS) {
        sendResponse({
            predictedClass: predictItemClassName()
        });
    }
});

function removeDivs(className, filterTerms) {
    var elements = document.getElementsByClassName(className);
    for (let i = elements.length - 1; 0 <= i; i--) {
        let element = elements[i];
        let stringContent = element.textContent.toLowerCase();
        if (filterTerms.some(function (term) { return stringContent.includes(term); })) {
            element.remove();
        }
    }
}

function getBaseUrl() {
    if (location.origin === 'undefined') {
        location.origin = location.protocol + '//' + location.host;
    }
    return location.origin;
}

const ELEMENT_INFO = {
    COUNT: 'COUNT',
    DEPTH: 'DEPTH',
    AVG_TEXT_COUNT: 'AVERAGE_TEXT_COUNT',
    CLASS_NAME: 'CLASS_NAME', 
    GENERATED_ID: 'GENERATED_ID'
}

/**
 * This method finds the top level list item so 
 * users don't have inspect html to find it themselves 
 */
function predictItemClassName() {
    let elementInfoDict;
    let htmlElement = document.children[0];
    
    // Get all elements
    elementInfoDict = recursiveElementExplorer(htmlElement, 0, {});
    let elementInfoArray = Object.values(elementInfoDict);

    // Analyze Array
    const FILTER_THRESHOLDS = Object.freeze({
        COUNT : 20,
        AVG_TEXT_COUNT : 50
    });

    elementInfoArray = elementInfoArray.filter(function(elementInfo){
        return (
            elementInfo[ELEMENT_INFO.COUNT] > FILTER_THRESHOLDS.COUNT &&
            elementInfo[ELEMENT_INFO.AVG_TEXT_COUNT] > FILTER_THRESHOLDS.AVG_TEXT_COUNT
        );
    });

    elementInfoArray = elementInfoArray.sort(function(a, b){
        return a[ELEMENT_INFO.AVG_TEXT_COUNT] - b[ELEMENT_INFO.AVG_TEXT_COUNT];
    });

    return elementInfoArray[elementInfoArray.length-1][ELEMENT_INFO.CLASS_NAME];
}

/**
 * A recursive function that fills in information in the document
 * @param {HTMLCollection} element
 * @param {Number} depth 
 * @param {Dictionary} dict
 */
function recursiveElementExplorer(element, depth, dict) {
    fillElementInfo(element, depth, dict);
    //Explore children
    let elChildren = element.children;
    if (elChildren.length === 0) return dict; // No children!


    for (let i = 0; i < elChildren.length; i++) {
        recursiveElementExplorer(elChildren[i], depth + 1, dict);
    }
    return dict;
}

function fillElementInfo(element, depth, dict) {
    // Store information about this element
    let currentClass;
    let generatedId;
    for (let i = 0; i < element.classList.length; i++) {
        currentClass = element.classList[i];
        generatedId = element.tagName + " : " + currentClass + "  : " + depth;

        if (generatedId in dict) {
            let curInfo = dict[generatedId];
            let textCount = element.textContent.length || 0;
            let avg = curInfo[ELEMENT_INFO.AVG_TEXT_COUNT];
            let count = curInfo[ELEMENT_INFO.COUNT];
            let new_avg = (avg * count + textCount) / (count + 1);
            //Set new information
            dict[generatedId][ELEMENT_INFO.AVG_TEXT_COUNT] = new_avg;
            dict[generatedId][ELEMENT_INFO.COUNT] += 1;
        }
        else {
            let textCount = element.textContent.length || 0;
            dict[generatedId] = {
                [ELEMENT_INFO.COUNT]: 1,
                [ELEMENT_INFO.DEPTH]: depth,
                [ELEMENT_INFO.AVG_TEXT_COUNT]: textCount,
                [ELEMENT_INFO.CLASS_NAME]: currentClass,
                [ELEMENT_INFO.GENERATED_ID]: generatedId
            }
        }
    }
}