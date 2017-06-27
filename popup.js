document.addEventListener("DOMContentLoaded", function () {

    var query = {
        active: true,
        currentWindow: true
    };

    function sendPopupDict(tabs) {
        document.getElementById('buttonDivErase').onclick = function () {
            var nodeListSearchTerms = document.getElementById("listSearchTerms").getElementsByTagName("li");
            var arrSearchTerms = getArrayFromList(nodeListSearchTerms);

            var popupDict = {
                searchTerms: arrSearchTerms,
                classname: document.getElementById('inputDivClass').value
            }
            chrome.tabs.sendMessage(tabs[0].id, popupDict, function (response) {
            });

        }
    }

    chrome.tabs.query(query, sendPopupDict);

    function addListItemFromInput(ul, inputBox, removeDelimiter = false) {
        let text = inputBox.value;
        let li = document.createElement("li");
        li.classList.add('searchTerm');
        if (removeDelimiter) {
            li.appendChild(document.createTextNode(text.slice(0, text.length - 1)));

        }
        else {
            li.appendChild(document.createTextNode(text));
        }
        ul.appendChild(li);
        inputBox.value = "";
    }

    var ulSearchTerms = document.getElementById('listSearchTerms');
    // Add all event listeners
    var searchTermInputElement = document.getElementById('inputSearchTerm');
    searchTermInputElement.addEventListener('input', function (e) {
        if (this.value.endsWith(',')) {
            addListItemFromInput(ulSearchTerms, this);
        }
    });
    var ENTER_KEY_CODE = 13;
    var TAB_KEY_CODE = 9;
    searchTermInputElement.addEventListener('keydown', function (e) {
        if (this.value !== "" && (e.keyCode == ENTER_KEY_CODE || e.keyCode == TAB_KEY_CODE)) {
            addListItemFromInput(ulSearchTerms, this);
        }
    });
});

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