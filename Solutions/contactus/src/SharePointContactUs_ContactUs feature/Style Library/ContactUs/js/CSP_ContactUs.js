/*
    Copyright 2019 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
/*
    Creates a contact us button in the header which opens an email to the site owners.

    Version 1.0
*/

//get browser information
function cu_getbrowser() {
    /*  Function found on the intranet
        returns the name and version of the currently used browser
     */
    var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {
            name: 'IE',
            version: (tem[1] || '')
        };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/)
        if (tem != null) {
            return {
                name: 'Opera',
                version: tem[1]
            };
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
    }
    return {
        name: M[0],
        version: M[1]
    };
}

function cu_getSiteInfo() {
    var defer = $.Deferred();
    var emails = [];
    var request = $.ajax({
        type: "GET",
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/AssociatedOwnerGroup?$expand=Users",

        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
        },
        success: function (result) {
            if (result.d.AssociatedOwnerGroup === null) {
                //there is not an owners group
                var listRequest = $.ajax({
                    method: "GET",
                    async: false,
                    url: "https://citz.sp.gov.bc.ca/sites/Shared/Program/SP/_api/web/lists(guid'FA641698-A6A8-49E3-BC17-08F51975C1C0')?$expand=Items",
                    headers: { 'Accept': 'application/json;odata=verbose' },
                    success: function (result) {
                        var items = result.d.Items.results;

                        for (i = 0; i < items.length; i++) {
                            if (items[i].SiteUrl.Url.toLowerCase() == _spPageContextInfo.webAbsoluteUrl.toLowerCase()) {
                                //site found in site inventory list
                                if (items[i].ContactEmail == null) {
                                    //there is not a contact email
                                    var primaryUserRequest = $.ajax({
                                        method: "GET",
                                        async: false,
                                        url: "https://citz.sp.gov.bc.ca/sites/Shared/Program/SP/_api/Web/GetUserById(" +
                                            items[i].PrimarySiteOwnerId + ")",
                                        headers: { 'Accept': 'application/json;odata=verbose' },
                                        success: function (result) {
                                            emails.push(result.d.Email);
                                        },
                                        error: function (result, errortext, errordescription) {
                                            window.console && console.log("usererror", errortext, errordescription);
                                        }
                                    });
                                    var secondaryUserRequest = $.ajax({
                                        method: "GET",
                                        async: false,
                                        url: "https://citz.sp.gov.bc.ca/sites/Shared/Program/SP/_api/Web/GetUserById(" +
                                            items[i].SecondarySiteOwnerId + ")",
                                        headers: { 'Accept': 'application/json;odata=verbose' },
                                        success: function (result) {
                                            emails.push(result.d.Email);
                                        },
                                        error: function (result, errortext, errordescription) {
                                            window.console && console.log("usererror", errortext, errordescription);
                                        }
                                    });
                                } else {
                                    //there is a contact email
                                    emails.push(items[i].ContactEmail);
                                }
                                break;
                            }

                        }

                    },
                    error: function (result, errorCode, errorMessage) {
                        window.console && console.log("listError", errorCode, errorMessage);
                    }
                });
            } else {
                //there is an owners group
                var r = result.d.Users.results;

                for (i = 0; i < r.length; i++) {
                    emails.push(r[i].Email);
                }
            }

            if (emails.length == 0) {
                //no emails found
                emails.push("CITZ_SP_Support@gov.bc.ca");
            }

            //get some browser information to include in the email for troubleshooting purposes
            var browser = cu_getbrowser();

            //construct the link
            var emailHTML = "javascript: window.location.href=\"mailto:" + emails.join("; ") + "?subject=SharePoint Help, Please&body=" + "%0D%0A" + "%0D%0A" + "%0D%0A" +
                "--------------- DO NOT MAKE CHANGES BELOW THIS LINE ---------------%0D%0APage: " + window.location.href +
                "%0D%0ABrowser: " + browser.name + "%0D%0AVersion: " + browser.version + "\"";

            var contactHTML = "<div class='o365cs-nav-topItem o365cs-rsp-tn-hideIfAffordanceOff' style='position: relative;'>" +
                "<button class='o365button o365cs-nav-item o365cs-nav-button o365cs-topnavText ms-bgc-tdr-h' id='csp_contactUs' role='menuitem' aria-haspopup='true'" +
                "aria-label='Contact Site Owner' type='button' onclick='" + emailHTML + "' title='Contact Site Owner'>" +
                "<span id='csp_contactUs_label'>Contact Site Owner</span>" +
                "<span class='wf wf-size-x18 wf-family-o365 wf-o365-mail' role='presentation'></span>" +
                "</button>" +
                "</div>";


            defer.resolve(contactHTML);
        },
        error: function (result) {
            defer.reject();
            windows.console && console.log("Error");
        }
    });

    return defer.promise();
}
$(document).ready(function () {
    var cssUrl = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl +
        "/Style%20Library/ContactUs/css/CSP_ContactUs.css";
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = cssUrl;
    head.appendChild(style);

    var sites = cu_getSiteInfo();

    $.when(sites).then(function (data) {
        //put the link in the footer
        $("#O365_TopMenu .o365cs-nav-rightMenus").prepend(data);
    });

});