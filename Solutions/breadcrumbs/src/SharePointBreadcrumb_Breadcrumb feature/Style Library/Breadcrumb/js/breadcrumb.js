/*
    Creates a breadcrumb trail for all pages in the collection
    Version 1.0
*/
var breadcrumbProperties = {
    ExcludedLists: ["Site Pages", "Pages"]
};

function getSiteInfo(sitesArray) {
    var defer = jQuery.Deferred();

    var current = sitesArray.shift();

    if (sitesArray.length === 0) {
        return "<span class='csp_breadcrumb'><a href='" + _spPageContextInfo.webAbsoluteUrl + "' title=''>" + _spPageContextInfo.webTitle + "</a></span>";
    } else {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var currentSite = _spPageContextInfo.webAbsoluteUrl.substring(0, _spPageContextInfo.webAbsoluteUrl.search(current) + current.length)
            var ctx = new SP.ClientContext(currentSite);
            var oSite = ctx.get_web();

            ctx.load(oSite, "Title", "Description");

            ctx.executeQueryAsync(
                function (result) {
                    //sucess
                    defer.resolve("<span class='csp_breadcrumb'><a href='" + currentSite + "' title='" + oSite.get_description() + "'>" + oSite.get_title() + "</a></span>" + getSiteInfo(sitesArray));
                },
                function (err) {
                    //fail
                    defer.reject("Request Failed: ", err);

                }
            );
        });
    }

    return defer.promise();
}
function makeSiteBreadrumb() {
    var defer = jQuery.Deferred();

    //get root site info
    //var rootSite = _spPageContextInfo.siteServerRelativeUrl.replace("/sites/", "");
    SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
        var html;
        var ctx = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
        var oSite = ctx.get_web();

        ctx.load(oSite, "Title", "Description");

        ctx.executeQueryAsync(
            function (result) {
                //sucess
                html = "<span class='csp_breadcrumb'><a href='" + _spPageContextInfo.siteAbsoluteUrl + "' title='" + oSite.get_description() + "'>" + oSite.get_title() + "</a></span>";

                if (_spPageContextInfo.siteServerRelativeUrl !== _spPageContextInfo.webServerRelativeUrl) {
                    var s = _spPageContextInfo.webServerRelativeUrl.replace(_spPageContextInfo.siteServerRelativeUrl, "");
                    var a = s.split("/");
                    a.shift();
                    $.when(getSiteInfo(a)).then(function (data) {
                        defer.resolve(html + data);
                    });
                } else {
                    defer.resolve(html);
                }
            },
            function (err) {
                //fail
                defer.reject(err);
            }
        );
    });

    return defer.promise();
}


function getListInfo() {
    var defer = jQuery.Deferred();
    if (typeof _spPageContextInfo.pageListId === "undefined") {
        //not part of a list or library
        defer.resolve("");
    } else {


        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var html;
            var ctx = new SP.ClientContext.get_current();
            var oList = ctx.get_web().get_lists().getById(_spPageContextInfo.pageListId);
            var oListRootFolder = oList.get_rootFolder();

            ctx.load(oList);
            ctx.load(oListRootFolder);

            ctx.executeQueryAsync(
                function (result) {
                    //success
                    if (breadcrumbProperties.ExcludedLists.includes(oList.get_title())) {
                        html = "";
                    } else {
                        html = "<span class='csp_breadcrumb'><a href='" + window.location.hostname + oListRootFolder.get_serverRelativeUrl() + "' title='" + oList.get_description() + "'>" + oList.get_title() + "</a></span>";
                    }
                    console.log(html);
                    defer.resolve(html);
                },
                function (err) {
                    //fail
                    defer.reject(err);
                }
            );
        });
    }

    return defer.promise();
}
function getFolderInfo() {
    var html = "";
    var u = decodeURIComponent(window.location.href);
    console.log(u);
    if (u.search("RootFolder") > -1) {
        if (u.search("_layouts") > -1) {
            //not a list or a library
            return "";
        } else {

            var v = u.split("?")[1].split("&");
            var path;
            var listpath = window.location.protocol + "//" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl;
            for (i = 0; i < v.length; i++) {
                if (v[i].startsWith("RootFolder")) {
                    path = v[i].split("=")[1].replace(_spPageContextInfo.webServerRelativeUrl, "");
                    break;
                }
            }
            if (path.startsWith("/Lists")) {
                listpath += "/Lists";
                path = path.substring(6);
            }
            var folders = path.split("/");
            folders.shift();  //remove the first blank
            listpath = listpath + "/" + folders.shift();  // value and the list name

            for (j = 0; j < folders.length; j++) {
                listpath = listpath + "/" + folders[j];
                html += "<span class='csp_breadcrumb'><a href='" + listpath + "'>" + folders[j] + "</a></span>";
            }
        }
    }

    return html;
}
function getPageInfo() {
    return "<span class='csp_breadcrumb'>" + _spPageContextInfo.serverRequestPath.substr(_spPageContextInfo.serverRequestPath.lastIndexOf('/') + 1).split(".")[0] + "</span>";
}

$().ready(function () {
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
    //get the site(s)
    var bcSites = makeSiteBreadrumb();
    var bcList = getListInfo();

    $.when(bcSites, bcList).then(function (siteData, listData) {
        var bcFolders = getFolderInfo();
        var bcPage = getPageInfo(_spPageContextInfo.pageItemId);

        var html = "<div id='csp_breadcrumbContainer'>" + siteData + listData + bcFolders + bcPage + "</div>";

        $("#titleAreaRow > .ms-breadcrumb-box").append(html);
    });
});