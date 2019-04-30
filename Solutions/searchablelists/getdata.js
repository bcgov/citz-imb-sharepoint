/*
<div id="container"></div>
<script>
    var DomainURL = "https://" + window.location.hostname;
    var pathArray = window.location.hostname.split('.');
    var SrchURL = '"' + pathArray[0] + "." + pathArray[1] + '*"';
    var sOpt = "&selectproperties='Title,Path,Description,ParentLink'&rowlimit=500";
    var url = DomainURL + "/_api/search/query?querytext='SPSiteUrl:" + SrchURL + " AND (contentclass:sts_List_)'" + sOpt;

    var sStr = "https://citz.sp.gov.bc.ca/sites/uat/_api/search/query?querytext='contentclass:sts_List_ AND ParentLink:\"https://citz.sp.gov.bc.ca/sites/UAT\" '&rowlimit=500";
    //https://citz.sp.gov.bc.ca/sites/uat/_api/search/query?querytext='contentclass:sts_List_ AND ParentLink:\"https://citz.sp.gov.bc.ca/sites/UAT\" '&rowlimit=500
    console.log(sStr);

    var xhr = new XMLHttpRequest();

    xhr.open('GET', sStr);
    xhr.setRequestHeader("accept", "application/json; odata=verbose");
    xhr.responseType = "json";
    xhr.send();

        ad = function () {
    if (xhr.status != 200) {
            console.log("Error", xhr.status, xhr.statusText);
    se {
    var data = JSON.parse(xhr.response).d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
            console.log(data);
            var lists = [];
        
    for (var i = 0; i < data.length; i++) {
        //3 = Title, 5 = Size, 6 = Path, 7 = Description, 8 = LastModifiedTime
        //13 = contentclass, 20 = ParentLink
            lists.push({
                    Title: data[i].Cells.results[3].Value, //3 = Title
                    Size: data[i].Cells.results[5].Value, //5 = Size
                    Path: data[i].Cells.results[6].Value, //6 = Path
                    Description: data[i].Cells.results[7].Value, //7 = Description
                    LastModifiedTime: data[i].Cells.results[8].Value, //8 = LastModifiedTime
                    contentclass: data[i].Cells.results[13].Value, //13 = contentclass
                    ParentLink: data[i].Cells.results[20].Value //20 = ParentLink
                });
            }

            lists.sort(function (a, b) {
                var x = a.Title.toLowerCase();
                var y = b.Title.toLowerCase();

                if (x < y) { return -1; }
                if (x > y) { return 1; }
                return 0;
            });
            var strLists = JSON.stringify(lists)
            var e = document.getElementById("container");
            e.innerText = strLists;
        }
    }
</script>
*/