<div class="alert alert-primary" role="alert">
    A simple primary alert—check it out!
</div>
<script>
    /*
        Creates a navigation menu in the header linking to all collections within the domain,
        with dropdown menus to the sites below the root site.

        Version 1.0
    */

    $().ready(function () {
        var DomainURL = "https://" + window.location.hostname;
        var pathArray = window.location.hostname.split('.');
        var SrchURL = '"' + pathArray[0] + "." + pathArray[1] + '*"';
        var sOpt = "&selectproperties='Title,Path,Description,ParentLink'&rowlimit=500";
        var apiUrl = DomainURL + "/_api/search/query?querytext='SPSiteUrl:" + SrchURL + " AND UrlDepth<4 (contentclass:sts_Web)'" + sOpt;

        $.ajax({
            url: apiUrl,
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (result) {
                var data = result.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                var sites = [];
                var collections = [];

                for (i = 0; i < data.length; i++) {
                    var obj = {};
                    obj.Title = data[i].Cells.results[2].Value;
                    obj.Path = data[i].Cells.results[3].Value;
                    obj.Description = data[i].Cells.results[4].Value;
                    obj.ParentLink = data[i].Cells.results[5].Value;
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
                    var colFlag = true;

                    for (k = 0; k < collections.length; k++) {
                        if (collections[k].Title == colTitle) {
                            colFlag = false;
                            collections[k].Sites.push(sites[j]);
                            break;
                        }
                    }

                    if (colFlag) { //collection html not yet created
                        var cObj = {};
                        cObj.Title = colTitle;
                        cObj.Sites = [];
                        collections.push(cObj);
                    }
                }

                console.log(collections);

            },
            error: function (error) {
                windows.console && console.log("error", error);
            }


        });
    });
</script>