<style>
    /* topnav */
    #csp_topnav {
        position: relative;
    }


    #csp_topnav a {
        text-align: left;
        font-size: 18px;
        display: block;
    }

    #csp_topnav a,
    #csp_topnav a:visited,
    #csp_topnav a:hover {
        color: #ffffff;
        text-decoration: none;
    }

    /* hamburger */
    .hamburger .line {
        width: 40px;
        height: 5px;
        background-color: #ffffff;
        display: block;
        margin: 8px auto;
        -webkit-transition: all 0.3s ease-in-out;
        -o-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
    }

    .hamburger:hover {
        cursor: pointer;
    }

    #csp_hamburger {
        width: 50px;
        -webkit-transition: all 0.3s ease-in-out;
        -o-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
    }

    #csp_hamburger.is-active {
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        transform: rotate(45deg);
    }

    #csp_hamburger:before {
        content: "";
        position: absolute;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        width: 50px;
        height: 50px;
        border: 5px solid transparent;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
        border-radius: 100%;
        -webkit-transition: all 0.3s ease-in-out;
        -o-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
    }

    #csp_hamburger.is-active:before {
        border: 5px solid #ecf0f1;
    }

    #csp_hamburger.is-active .line {
        width: 35px;
    }

    #csp_hamburger.is-active .line:nth-child(2) {
        opacity: 0;
    }

    #csp_hamburger.is-active .line:nth-child(1) {
        -webkit-transform: translateY(13px);
        -ms-transform: translateY(13px);
        -o-transform: translateY(13px);
        transform: translateY(13px);
    }

    #csp_hamburger.is-active .line:nth-child(3) {
        -webkit-transform: translateY(-13px) rotate(90deg);
        -ms-transform: translateY(-13px) rotate(90deg);
        -o-transform: translateY(-13px) rotate(90deg);
        transform: translateY(-13px) rotate(90deg);
    }

    /* topnav content */
    #csp_topnav.is-active .topnav-content {
        background-color: darkslategray;
        display: block;
        float: left;
        position: absolute;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1;
    }

    #csp_topnav>.topnav-content {
        display: none;
    }

    /* dropdown */
    #csp_topnav .dropdown {
        background-color: rgba(71, 71, 71, 1);
        border-bottom: 1px rgb(172, 172, 172) solid;
        position: relative;
    }

    #csp_topnav .dropdown>a {
        display: block;
        min-width: 150px;
        padding: 10px;
        cursor: pointer;
    }

    /* dropdown content */
    #csp_topnav .dropdown-content {
        display: none;
        position: absolute;
        top: 0;
        left: 100%;
        background-color: rgba(71, 71, 71, 1);
        border-left: 1px rgb(172, 172, 172) solid;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1;
    }

    #csp_topnav .dropdown:hover .dropdown-content {
        display: block;
    }

    #csp_topnav .dropdown-content a {
        border-bottom: 1px rgb(172, 172, 172) solid;
        padding: 10px;
    }
</style>


<script>
    /*
        Creates a navigation menu in the header linking to all collections within the domain,
        with dropdown menus to the sites below the root site.

        Version 1.0
    */
    $().ready(function () {
        //build the rest api url
        var DomainURL = "https://" + window.location.hostname;
        var pathArray = window.location.hostname.split('.');
        var SrchURL = '"' + pathArray[0] + "." + pathArray[1] + '*"';
        var sOpt = "&selectproperties='Title,Path,Description,ParentLink'&rowlimit=500";
        var apiUrl = DomainURL + "/_api/search/query?querytext='SPSiteUrl:" + SrchURL + " AND UrlDepth<4 (contentclass:sts_Web)'" + sOpt;

        //get all the first level sub-sites for all collections within the ministry domain
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

                console.log(collections);

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
                    $(this).toggleClass("is-active")
                    $("#csp_topnav").toggleClass("is-active")
                });
            },
            error: function (error) {
                windows.console && console.log("error", error);
            }


        });

    });
</script>