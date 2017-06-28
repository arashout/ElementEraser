'use strict';

function addSearchItemFromText(ul, text) {
    // First check if term already exists in UL
    if (ul.outerText.split('\n').includes(text)){
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

function eraseUsingDict(tabs) {
    const msg = createEraseObj();
    msg.name = MSG.ERASE_OBJECT;
    chrome.tabs.sendMessage(tabs[0].id, msg, function (response) { });
}

function updateURLKey(tabs) {
    // Ask for url for content script
    const msg = {
        name: MSG.GET_URL
    }
    chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
        ELEMENTS.INPUT_URL_KEY.value = response.url;
        retrieveEraseObjContainer(response.url);
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

document.addEventListener("DOMContentLoaded", function () {
    // Add searchTerm event listeners
    ELEMENTS.INPUT_SEARCH_TERM.addEventListener('input', function (e) {
        let text = this.value;
        if (text.endsWith(',')) {
            text = text.replace(/,/g, '');
            if (text.length !== 0) {
                addSearchItemFromText(ELEMENTS.UNORDERED_LIST_SEARCH_TERMS, text);
                this.value = '';
            } else this.value = '';

        }
    });

    ELEMENTS.INPUT_SEARCH_TERM.addEventListener('keydown', function (e) {
        if (this.value !== '' &&
            (e.keyCode === KEY_CODES.TAB || e.keyCode === KEY_CODES.ENTER)) {
            addSearchItemFromText(ELEMENTS.UNORDERED_LIST_SEARCH_TERMS, this.value);
            this.value = '';
        }
    });

    let query = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(query, updateURLKey);
    chrome.tabs.query(query, eraseUsingDict);

    ELEMENTS.BUTTON_ERASE.addEventListener('click', function (e) {
        chrome.tabs.query(query, eraseUsingDict);
    });
    ELEMENTS.BUTTON_ERASE.addEventListener('keydown', function (e) {
        if (e.keyCode === KEY_CODES.ENTER) {
            chrome.tabs.query(query, eraseUsingDict);
        }
    })

    ELEMENTS.BUTTON_STORE.addEventListener('click', function (e) {
        const currentURLKey = ELEMENTS.INPUT_URL_KEY.value;
        const currentEraseObj = createEraseObj();
        storeEraseObj(currentURLKey, currentEraseObj);
    });
    ELEMENTS.BUTTON_STORE.addEventListener('keydown', function (e) {
        if (e.keyCode === KEY_CODES.ENTER) {
            const currentURLKey = ELEMENTS.INPUT_URL_KEY.value;
            const currentEraseObj = createEraseObj();
            storeEraseObj(currentURLKey, currentEraseObj);
        }
    });

    ELEMENTS.BUTTON_RETRIEVE.addEventListener('keydown', function(e){
        if( e.keyCode === KEY_CODES.ENTER){
            const result = retrieveEraseObjContainer(ELEMENTS.INPUT_URL_KEY.value);
            if(!result){
                // TODO: Give warning tooltip
                alert('No data stored for this URL');
            }
        }
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
        if(eraseObj === null){
            return false;
        }
        prepopulateEraseFields(eraseObj);
        return true;
    });
}

function createEraseObj() {
    const nodeListSearchTerms = ELEMENTS.UNORDERED_LIST_SEARCH_TERMS.getElementsByTagName("li");
    const arrSearchTerms = getArrayFromList(nodeListSearchTerms);

    return {
        searchTerms: arrSearchTerms,
        classname: ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value
    }
}

function prepopulateEraseFields(eraseObj) {
    const arrSearchTerms = eraseObj.searchTerms;
    for (let i = 0; i < arrSearchTerms.length; i++) {
        addSearchItemFromText(ELEMENTS.UNORDERED_LIST_SEARCH_TERMS, arrSearchTerms[i]);
    }
    ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = eraseObj.classname;
}