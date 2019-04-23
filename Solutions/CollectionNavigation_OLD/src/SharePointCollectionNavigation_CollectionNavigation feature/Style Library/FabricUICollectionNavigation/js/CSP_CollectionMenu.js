/*
    Creates a navigation menu in the header linking to all collections within the domain,
    with dropdown menus to the sites below the root site.

    Version 1.0
*/

var DomainURL = "https://" + window.location.hostname;
var eHead = document.getElementsByTagName("head");
var eLink = document.createElement("link");
eLink.setAttribute("rel", "stylesheet");
eLink.setAttribute("href", DomainURL + "/Style Library/FabricUICollectionNavigation/css/CSP_CollectionMenu.css");
eLink.setAttribute("type", "text/css");
eLink.setAttribute("after", "Corev15.css");
eHead.appendChild(eLink);

var pathArray = window.location.hostname.split('.');
var SrchURL = '"' + pathArray[0] + "." + pathArray[1] + '*"';
var sOpt = "&selectproperties='Title,Path,Description,ParentLink'&rowlimit=500";
var url = DomainURL + "/_api/search/query?querytext='SPSiteUrl:" + SrchURL + " AND UrlDepth<4 (contentclass:sts_Web)'" + sOpt;

var xhr = new XMLHttpRequest();

xhr.open('GET', url);
xhr.setRequestHeader("accept", "application/json; odata=verbose");
xhr.responseType = "json";
xhr.send();

xhr.onload = function () {
    if (xhr.status != 200) {
        alert("Error", xhr.status, xhr.statusText);
    } else {
        var data = JSON.parse(xhr.response);
        var r = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
        var sites = [];
        var collections = [];
        var eContainer = document.createElement("div");
        eContainer.setAttribute("id", "csp_collection_menu_container");
        var eNav = document.createElement("nav");
        eNav.setAttribute("class", "csp_site-nav");
        var eColUl = document.createElement("ul");
        eColUl.setAttribute("id", "csp_collection_menu");

        for (i = 0; i < r.length; i++) {
            var obj = {};
            obj.Title = r[i].Cells.results[2].Value;
            obj.Path = r[i].Cells.results[3].Value;
            obj.Description = r[i].Cells.results[4].Value;
            obj.ParentLink = r[i].Cells.results[5].Value;
            sites.push(obj);
        }

        sites.sort(function (a, b) {
            var x = a.Path.toLowerCase();
            var y = b.Path.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        });

        for (j = 0; j < sites.length; j++) {
            var colUrl = sites[j]["ParentLink"];
            var colTitle = colUrl.split("/").slice(-1)[0];
            if (collections.indexOf(colTitle) == -1) { //collection html not yet created
                var eLi = document.createElement("li");
                eLi.setAttribute("id", "csp_item_" + colTitle);
                eLi.setAttribute("class", "csp_dropdown");
                eLi.innerHTML = "<a href='" + colUrl + "' class='csp_dropbtn'>" + colTitle + "</a><div class='csp_dropdown-content'></div>";

                collections.push(colTitle);
                eColUl.appendChild(eLi);
            } else { //collection html has been created
                var eParent = eColUl.querySelector("#csp_item_" + colTitle + " .csp_dropdown-content");
                var eChild = document.createElement("a");
                eChild.setAttribute("href", sites[j]["Path"]);
                eChild.setAttribute("class", "csp_dropbtn");
                eChild.setAttribute("title", sites[j]["Description"]);
                eChild.innerText = sites[j]["Title"];

                eParent.appendChild(eChild);
            }
        }
        eNav.appendChild(eColUl);
        eContainer.appendChild(eNav);

        //create hamburger
        var eHamburger = document.createElement("div");
        eHamburger.classList.add("csp_menu-toggle");
        eHamburger.innerHTML = "<div class=\"csp_hamburger\"></div>";
        eContainer.appendChild(eHamburger);

        if (document.readyState == "complete") {
            var e = document.querySelector("#O365_NavHeader .o365cs-nav-centerAlign");
            e.appendChild(eContainer);
            document.querySelector("#csp_collection_menu_container .csp_menu-toggle").addEventListener("click", function () {
                this.classList.toggle("csp_open");
                document.querySelector("#csp_collection_menu_container .csp_site-nav").classList.toggle("csp_site-nav--open");
            });
        } else {
            document.onreadystatechange = function () {
                if (document.readyState == "complete") {
                    var e = document.querySelector("#O365_NavHeader .o365cs-nav-centerAlign");
                    e.appendChild(eContainer);
                    document.querySelector("#csp_collection_menu_container .csp_menu-toggle").addEventListener("click", function () {
                        this.classList.toggle("csp_open");
                        document.querySelector("#csp_collection_menu_container .csp_site-nav").classList.toggle("csp_site-nav--open");
                    });
                }
            }

        }
    }
};