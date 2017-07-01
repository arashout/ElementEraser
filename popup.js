'use strict';

document.addEventListener("DOMContentLoaded", function () {
    let query = {
        active: true,
        currentWindow: true
    };

    function updateURLKey(tabs) {
        // Ask for url for content script
        const msg = {
            name: MSG.GET_URL
        }
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            if (response !== undefined) {
                ELEMENTS.INPUT_URL_KEY.value = response.url;
            }
        });
    }
    chrome.tabs.query(query, updateURLKey);

    function inputFilterTermHandler(e) {
        let inputElement = ELEMENTS.INPUT_FILTER_TERM;
        let text = inputElement.value;
        if (text === '') return;
        if (e.keyCode === KEY_CODES.ENTER || e.keyCode === KEY_CODES.TAB) {
            addFilterItemFromText(ELEMENTS.UNORDERED_LIST_FILTER_TERMS, text);
            inputElement.value = '';
        }
        else if (e.type === EVENTS.INPUT) {
            if (text.endsWith(',')) {
                text = text.replace(/,/g, '');
                if (text.length !== 0) {
                    addFilterItemFromText(ELEMENTS.UNORDERED_LIST_FILTER_TERMS, text);
                    inputElement.value = '';
                } else inputElement.value = ''; // User enters "," without anything else
            }
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.INPUT].forEach(function (event) {
        ELEMENTS.INPUT_FILTER_TERM.addEventListener(event, function (e) { inputFilterTermHandler(e) });
    });

    function eraseUsingDict(tabs) {
        const msg = createEraseObj();
        msg.name = MSG.ERASE_OBJECT;
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) { });
    }
    function eraseHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            chrome.tabs.query(query, eraseUsingDict);
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_ERASE.addEventListener(event, function (e) { eraseHandler(e) });
    });

    function storeHandler(e) {
        let currentURLKey = ELEMENTS.INPUT_URL_KEY.value;
        let currentEraseObj = createEraseObj();
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            storeEraseObj(currentURLKey, currentEraseObj);
        }

    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_STORE.addEventListener(event, function (e) { storeHandler(e) });
    });

    function retrieveHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            retrieveEraseObjContainer(ELEMENTS.INPUT_URL_KEY.value);
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_RETRIEVE.addEventListener(event, function (e) { retrieveHandler(e) });
    });

    function predictClassQuery(tabs) {
        const msg = {
            name: MSG.PREDICT_CLASS
        }
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            if (response !== undefined) {
                ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = response.predictedClass;
            }
        });
    }
    function predictHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            chrome.tabs.query(query, predictClassQuery);
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_PREDICT.addEventListener(event, function (e) { predictHandler(e); });
    });

    // On start up ask background script what the current state should be
    function updateToggle() {
        const msg = {
            name: MSG.GET_STATE
        }
        chrome.runtime.sendMessage(msg, function (response) {
            ELEMENTS.TOGGLE_STATE.checked = response['currentState'];
        });
    }
    updateToggle();
    ELEMENTS.TOGGLE_STATE.addEventListener('change', function (e) {
        const msg = {
            name: MSG.TOGGLE_STATE
        }
        chrome.runtime.sendMessage(msg, function (response) {
            console.log(response['currentState']);
        });
    });
});

function storeEraseObj(urlKey, eraseObj) {
    if (urlKey) {
        let saveObj = {};
        saveObj[urlKey] = eraseObj;
        chrome.storage.local.set(saveObj, function () {
            if (chrome.extension.lastError) {
                alert('An error occurred: ' + chrome.extension.lastError.message);
            }
        });
    }
    else return false;

    return true;
}

function retrieveEraseObjContainer(urlKey) {
    chrome.storage.local.get(urlKey, function (result) {
        // TODO: I shouldn't have to do this! Figure out what's going on
        const urlKey = ELEMENTS.INPUT_URL_KEY.value;
        const eraseObj = result[urlKey];
        if (eraseObj !== null) {
            prepopulateEraseFields(eraseObj);
        }
        else {
            // TODO: Retrieve error
        }
    });
}

function createEraseObj() {
    const nodeListFilterTerms = ELEMENTS.UNORDERED_LIST_FILTER_TERMS.getElementsByTagName("li");
    const arrFilterTerms = getArrayFromList(nodeListFilterTerms);

    return {
        filterTerms: arrFilterTerms,
        classname: ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value
    }
}

function prepopulateEraseFields(eraseObj) {
    const arrFilterTerms = eraseObj.filterTerms;
    for (let i = 0; i < arrFilterTerms.length; i++) {
        addFilterItemFromText(ELEMENTS.UNORDERED_LIST_FILTER_TERMS, arrFilterTerms[i]);
    }
    ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = eraseObj.classname;
}

function addFilterItemFromText(ul, text) {
    // First check if term already exists in UL
    if (ul.outerText.split('\n').includes(text)) {
        return;
    }

    let li = document.createElement('li');
    li.classList.add('searchTerm');
    li.classList.add('block');
    li.tabIndex = -1;

    let span = document.createElement('span');
    span.classList.add('tag');
    span.classList.add('is-success');
    span.appendChild(document.createTextNode(text));

    let buttonDelete = document.createElement('button');
    buttonDelete.classList.add('delete');
    buttonDelete.classList.add('is-small');

    span.appendChild(buttonDelete);

    li.appendChild(span);

    ul.appendChild(li);

    // Add event listener to delete on click
    buttonDelete.addEventListener("click", function (e) {
        ul.removeChild(li);
    });
}

/**
 * Given an element that contains <li> items
 * Return an array of strings for each <li> item
 */
function getArrayFromList(elementContainer) {
    let arrayLi = [];
    for (let i = 0; i < elementContainer.length; i++) {
        let li = elementContainer[i];
        arrayLi.push(li.textContent);
    }
    return arrayLi;
}