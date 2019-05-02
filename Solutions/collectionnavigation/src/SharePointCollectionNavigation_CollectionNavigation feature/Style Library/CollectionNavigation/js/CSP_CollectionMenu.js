/*
    Creates a navigation menu in the header linking to all collections within the domain,
    with dropdown menus to the sites below the root site.
    Vers i on 1.0
*/

$().ready(function () {
    //build the rest api url
    var DomainURL = "https://" + window.location.hostname;
    var pathArray = window.location.hostname.split('.');
    var SrchURL = '"' + pathArray[0] + "." + pathArray[1] + '*"';
    var sOpt = "&selectproperties='Title,Path,Description,ParentLink'&rowlimit=500";
    var apiUrl = DomainURL + "/_api/search/query?querytext='SPSiteUrl:" + SrchURL + " AND UrlDepth<4 (contentclass:sts_Web)'" + sOpt;

    var cssUrl = DomainURL + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/CollectionNavigation/css/CSP_CollectionMenu.css";
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = cssUrl;
    head.appendChild(style);

    //ge t  all the first level sub-sites for all collections within the ministry domain
    $.ajax({
        url: apiUrl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (result) {
            var data = result.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
            var sites = [];
            var collections = [];

            //extract the site information we want from the data returned
            for (i = 0; i < data.length; i++) {
                var obj = {};
                obj.Title = data[i].Cells.results[2].Value;
                obj.Path = data[i].Cells.results[3].Value;
                obj.Description = data[i].Cells.results[4].Value;
                obj.ParentLink = data[i].Cells.results[5].Value;
                sites.push(obj);
            }

            //sort the sites by path
            sites.sort(function (a, b) {
                var x = a.Path.toLowerCase();
                var y = b.Path.toLowerCase();
                if (x < y) { return -1; }
                if (x > y) { return 1; }
                return 0;
            });

            //group the sites by collection
            for (j = 0; j < sites.length; j++) {
                var colUrl = sites[j]["ParentLink"];
                var colTitle = colUrl.split("/").slice(-1)[0];
                var colFlag = true;

                for (k = 0; k < collections.length; k++) {
                    if (collections[k].Title == colTitle) {//collection group exists
                        colFlag = false;
                        collections[k].Sites.push(sites[j]);
                        break;
                    }
                }

                if (colFlag) { //create collection group
                    var cObj = {};
                    cObj.Title = colTitle;
                    cObj.Path = colUrl;
                    cObj.Sites = [];
                    collections.push(cObj);
                }
            }

            //build out the html
            var html = "<div id='csp_topnav' class='topnav'>";
            html += "<div class='hamburger' id='csp_hamburger'>";
            html += "<span class='line'></span>";
            html += "<span class='line'></span>";
            html += "<span class='line'></span>";
            html += "</div>";
            html += "<div class='topnav-content'>";

            for (l = 0; l < collections.length; l++) {
                if (!(collections[l].Title === "UAT" || collections[l].Title === "DEV")) {
                    html += "<div class='dropdown'>";
                    html += "<a href='" + collections[l].Path + "'>";
                    html += collections[l].Title;
                    html += "</a>";
                    html += "<div class='dropdown-content'>";
                    for (m = 0; m < collections[l].Sites.length; m++) {
                        html += "<a href='" + collections[l].Sites[m].Path + "' title='" + collections[l].Sites[m].Description + "'>";
                        html += collections[l].Sites[m].Title;
                        html += "</a>";
                    }
                    html += "</div>";
                    html += "</div>";
                }
            }

            html += "</div>";
            html += "</div>";

            $("#O365_NavHeader .o365cs-nav-centerAlign").append(html);

            $(".hamburger").click(function () {
                $(".hamburger").toggleClass("is-active")
                $("#csp_topnav").toggleClass("is-active")
            });
        },
        error: function (error) {
            windows.console && console.log("error", error);
        }
    });
});
