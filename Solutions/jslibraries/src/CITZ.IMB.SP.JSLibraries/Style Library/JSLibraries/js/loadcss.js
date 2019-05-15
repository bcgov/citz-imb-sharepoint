$().ready(function () {
    //put the css reference on the page
    var jqeryUICssUrl = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/JSLibraries/css/jquery-ui.min.css";
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = jqeryUICssUrl;
    head.appendChild(style);
});