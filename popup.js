document.addEventListener("DOMContentLoaded", function () {

    var query = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(query, callbackCurrentTab);
});

function callbackCurrentTab(tabs) {
    document.getElementById('buttonDivsBeGone').onclick = function () {
        var textSearchTerms = document.getElementById('textInputSearchTerms').value;
        var listSearchTerms = textSearchTerms.split(',');

        var popupDict = {
            searchTerms: listSearchTerms,
            classname: document.getElementById('textInputDivClass').value
        }
        chrome.tabs.sendMessage(tabs[0].id, popupDict, function (response) {

        });

    }
}