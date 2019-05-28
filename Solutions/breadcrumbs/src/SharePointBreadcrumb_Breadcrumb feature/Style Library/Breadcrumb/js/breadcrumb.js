/*
    Creates a breadcrumb trail for all pages in the collection
    Version 1.0
*/


var bc_Properties = {
    //some libraries are not shown in the breadcrumb trail
    ExcludedLists: ["Site Pages", "Pages"]
};

function bc_getSiteInfo(sitesArray) {
    //using promises so that the function will wait until it has the information needed
    var defer = jQuery.Deferred();

    //get the first site from the array
    var current = sitesArray.shift();

    if (sitesArray.length === 0) {
        //no more sites after this one
        //we can use page context to get the information
        defer.resolve("<span class='csp_breadcrumb'><a href='" + _spPageContextInfo.webAbsoluteUrl + "' title=''>" + _spPageContextInfo.webTitle + "</a></span>");
    } else {
        //we need to request the information about the site we are working on
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var currentSite = _spPageContextInfo.webAbsoluteUrl.substring(0, _spPageContextInfo.webAbsoluteUrl.search(current) + current.length)
            var ctx = new SP.ClientContext(currentSite);
            var oSite = ctx.get_web();

            ctx.load(oSite, "Title", "Description");

            ctx.executeQueryAsync(
                function (result) {
                    //success
                    //request the next site recursively asynchronously
                    var nextSite = bc_getSiteInfo(sitesArray);

                    $.when(nextSite).then(function (data) {
                        defer.resolve("<span class='csp_breadcrumb'><a href='" + currentSite + "' title='" + oSite.get_description() + "'>" + oSite.get_title() + "</a></span>" + data);
                    });
                },
                function (err) {
                    //fail
                    window.console && console.log("Request Failed: ", err);
                }
            );
        });
    }

    return defer.promise();
}
function bc_makeSiteBreadrumb() {
    var defer = jQuery.Deferred();

    //get root site info
    SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
        var mbcHtml;
        var ctx = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
        var oSite = ctx.get_web();

        ctx.load(oSite, "Title", "Description");

        ctx.executeQueryAsync(
            function (result) {
                //sucess
                mbcHtml = "<span class='csp_breadcrumb'><a href='" + _spPageContextInfo.siteAbsoluteUrl + "' title='" + oSite.get_description() + "'>" + oSite.get_title() + "</a></span>";

                if (_spPageContextInfo.siteServerRelativeUrl !== _spPageContextInfo.webServerRelativeUrl) {
                    var s = _spPageContextInfo.webServerRelativeUrl.replace(_spPageContextInfo.siteServerRelativeUrl, "");
                    var a = s.split("/");
                    a.shift();
                    $.when(bc_getSiteInfo(a)).then(function (data) {
                        defer.resolve(mbcHtml + data);
                    });
                } else {
                    defer.resolve(mbcHtml);
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


function bc_getListInfo() {
    var defer = jQuery.Deferred();
    if (typeof _spPageContextInfo.pageListId === "undefined") {
        //not part of a list or library
        defer.resolve("");
    } else {


        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var lHtml;
            var ctx = new SP.ClientContext.get_current();
            var oList = ctx.get_web().get_lists().getById(_spPageContextInfo.pageListId);
            var oListRootFolder = oList.get_rootFolder();

            ctx.load(oList);
            ctx.load(oListRootFolder);

            ctx.executeQueryAsync(
                function (result) {
                    //success
                    if (bc_Properties.ExcludedLists.indexOf(oList.get_title()) > -1) {
                        lHtml = "";
                    } else {
                        lHtml = "<span class='csp_breadcrumb'><a href='" + window.location.hostname + oListRootFolder.get_serverRelativeUrl() + "' title='" + oList.get_description() + "'>" + oList.get_title() + "</a></span>";
                    }
                    defer.resolve(lHtml);
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
    var fHtml = "";
    var u = decodeURIComponent(window.location.href);
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
                fHtml += "<span class='csp_breadcrumb'><a href='" + listpath + "'>" + folders[j] + "</a></span>";
            }
        }
    }

    return fHtml;
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
    var bcSites = bc_makeSiteBreadrumb();
    var bcList = bc_getListInfo();

    $.when(bcSites, bcList).then(function (bcSiteData, bcListData) {
        var bcFolders = getFolderInfo();
        var bcPage = getPageInfo(_spPageContextInfo.pageItemId);

        var bcHtml = "<div id='csp_breadcrumbContainer'>" + bcSiteData + bcListData + bcFolders + bcPage + "</div>";

        $("#titleAreaRow > .ms-breadcrumb-box").append(bcHtml);
    });
});