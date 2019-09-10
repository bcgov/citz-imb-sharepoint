/*
    Creates a breadcrumb trail for all pages in the collection
    Version 1.0
*/

var bc_Properties = {
    //some libraries are not shown in the breadcrumb trail
    ExcludedLists: ["Site Pages", "Pages"]
};

function buildCrumbHtml(title, description, url) {
    return "<span class='csp_breadcrumb'><a href='" + url +
        "' title='" + description + "'>" + title + "</a></span>";
}

function getPageCrumb() {
    var defer = $.Deferred();


    //#ctl00_PlaceHolderMain_wikiPageNameDisplay
    //#ms-pageDescription
    var sPath = window.location.pathname;
    var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);

    //#ctl00_PlaceHolderPageTitleInTitleArea_LabelGroupName

    if (sPath.indexOf("_layouts") > -1) {
        switch (sPage.toLowerCase()) {
            case "people.aspx":
                defer.resolve(
                    buildCrumbHtml($("title").text(), $("#ms-pageDescription").text(), "#") +
                    buildCrumbHtml($("#ctl00_PlaceHolderPageTitleInTitleArea_LabelGroupName").text(), $("#ms-pageDescriptionDiv").text(), "#")
                );
            default:
                defer.resolve(buildCrumbHtml($("title").text(), $("#ms-pageDescription").text(), "#"));
        }

    } else {
        defer.resolve(buildCrumbHtml($("title").text(), $("#ms-pageDescription").text(), "#"));
    }

    return defer.promise();
}

function getFolderCrumb() {
    var defer = $.Deferred();
    var html = "";

    var u = decodeURIComponent(window.location.href);
    if (u.search("RootFolder") > -1) {
        var v = u.split("?")[1].split("&");
        var path;

        for (i = 0; i < v.length; i++) {
            if (v[i].startsWith("RootFolder")) {
                path = v[i].split("=")[1].replace(_spPageContextInfo.webServerRelativeUrl, "");
                break;
            }
        }

        var url = _spPageContextInfo.webAbsoluteUrl;
        var folders = path.split("/");

        folders.shift();  //remove the first blank
        url = url + "/" + folders.shift(); //and the list/library name; add it to the url
        folders.pop(); //and the last one as it is part of the page name

        for (i = 0; i < folders.length; i++) {
            url = url + "/" + folders[i];  //append the folder to the url
            html += buildCrumbHtml(folders[i], "", url);
        }
    }

    defer.resolve(html);

    return defer.promise();
}

function getListCrumb() {
    var defer = $.Deferred();

    if (_spPageContextInfo.pageListId === undefined) {
        defer.resolve("");
    } else {
        $.when(
            getListByGuid(_spPageContextInfo.pageListId)
        ).done(function (listData) {
            var url = _spPageContextInfo.webAbsoluteUrl + "/" + listData.EntityTypeName;
            if (bc_Properties.ExcludedLists.indexOf(listData.Title) > -1) {
                if (window.location.pathname.indexOf("listedit.aspx") > -1) {
                    //show the listcrumb if we are editing the list
                    defer.resolve(buildCrumbHtml(listData.Title, listData.Description, url));
                } else {
                    defer.resolve("");
                }
            } else {
                defer.resolve(buildCrumbHtml(listData.Title, listData.Description, url));
            }
        });
    }

    return defer.promise();
}

function getSiteCrumb() {
    var defer = $.Deferred();

    //get the collection relative url
    var sitePath = _spPageContextInfo.siteServerRelativeUrl;

    //get the site relative url
    var webPath = _spPageContextInfo.webServerRelativeUrl;

    //remove the collection relative url from the site relative url
    //so that we are left with the subsites in path format
    var path = webPath.replace(sitePath, "");

    //split the subsites into an array
    var sites = path.split("/");
    //remove the first array as it is always the root site, which we don't need
    sites.shift();

    //get the absolute collection url
    var siteUrl = _spPageContextInfo.siteAbsoluteUrl;

    //create a new array to hold the site urls
    var html = "";

    for (i = 0; i < sites.length; i++) {
        siteUrl = siteUrl + "/" + sites[i];

        $.ajax({
            url: siteUrl +
                "/_api/web",
            type: "GET",
            async: false,
            headers: {
                "Accept": "application/json;odata=nometadata",
                "Content-Type": "application/json;odata=nometadata"
            }
        }).done(function (data) {
            html += buildCrumbHtml(data.Title, data.Description, data.Url)
        }).fail(function (err) {
            console.log(err);
            defer.reject(err);
        });

    }
    defer.resolve(html);

    return defer.promise();
}

function getRootCrumb() {
    var defer = $.Deferred();

    $.when(getWebInfo(_spPageContextInfo.siteAbsoluteUrl)).done(function (siteData) {
        defer.resolve(buildCrumbHtml(siteData.Title, siteData.Description, siteData.Url));
    });

    return defer.promise();
}

function bc_makeBreadrumbs() {
    //get root site info
    var rootCrumb = getRootCrumb();
    //get site(s) info
    var siteCrumb = getSiteCrumb();
    //get list info
    var listCrumb = getListCrumb();
    //get folder(s) info
    var folderCrumb = getFolderCrumb();
    //get page info
    var pageCrumb = getPageCrumb();

    $.when(
        rootCrumb,
        siteCrumb,
        listCrumb,
        folderCrumb,
        pageCrumb
    ).done(function (rootHtml, siteHtml, listHtml, folderHtml, pageHtml) {
        $("#titleAreaRow > .ms-breadcrumb-box").append("<div id='csp_breadcrumbContainer'>" + rootHtml + siteHtml + listHtml + folderHtml + pageHtml + "</div>");
    })
}

$().ready(function () {
    //hide the page title in the page
    $("#pageTitle").addClass("ms-hidden");

    //put the css reference on the page
    var cssUrl = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/Breadcrumb/css/breadcrumb.css";
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = cssUrl;
    head.appendChild(style);

    //make the breadcrumb trail
    bc_makeBreadrumbs();
});