'use strict';

function addSearchItemFromText(ul, text) {
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

function sendPopupDict(tabs) {
    var nodeListSearchTerms = document.getElementById("listSearchTerms").getElementsByTagName("li");
    var arrSearchTerms = getArrayFromList(nodeListSearchTerms);

    var popupDict = {
        searchTerms: arrSearchTerms,
        classname: document.getElementById('inputDivClass').value
    }
    chrome.tabs.sendMessage(tabs[0].id, popupDict, function (response) { });
}

/**
 * Given an element that contains <li> items
 * Return an array of strings for each <li> item
 */
function getArrayFromList(elementContainer) {
    var arrayLi = [];
    for (let i = 0; i < elementContainer.length; i++) {
        let li = elementContainer[i];
        arrayLi.push(li.textContent);
    }
    return arrayLi;
}

document.addEventListener("DOMContentLoaded", function () {
    // Update URL Key
    var inputURLElement = document.getElementById('inputURLKey');
    if (typeof location.origin === 'undefined') {
        location.origin = location.protocol + '//' + location.host;
    }
    inputURLElement.value = location.origin;


    var ulSearchTerms = document.getElementById('listSearchTerms');

    // Add searchTerm event listeners
    var searchTermInputElement = document.getElementById('inputSearchTerm');
    searchTermInputElement.addEventListener('input', function (e) {
        let text = this.value;
        if (text.endsWith(',')) {
            text = text.replace(/,/g, '');
            if (text.length !== 0) {
                addSearchItemFromText(ulSearchTerms, text);
                this.value = '';
            } else this.value = '';

        }
    });

    var ENTER_KEY_CODE = 13;
    var TAB_KEY_CODE = 9;
    searchTermInputElement.addEventListener('keydown', function (e) {
        if (this.value !== '' && e.keyCode == TAB_KEY_CODE) {
            addSearchItemFromText(ulSearchTerms, this.value);
            this.value = '';
        }
    });

    // Add submit button event listeners
    var query = {
        active: true,
        currentWindow: true
    };
    document.getElementById('buttonDivErase').addEventListener('click', function (e) {
        chrome.tabs.query(query, sendPopupDict);
    });

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === ENTER_KEY_CODE) {
            chrome.tabs.query(query, sendPopupDict);
        }
    });
});