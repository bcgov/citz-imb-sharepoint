/*
TODO: Refactor Site Management to use datatables
TODO: Remove user from user list when removing from security group
TODO: Add mechanism to allow VICO staff to enter questions and answers

*/

var siteData = {};

var config = {}
var ownerGroupID;
var memberGroupID;
var visitorGroupID;
var groupPrefix;
var groupDescription = "created by automation";
var currentUser;
var questionList;


$().ready(function () {
    console.log("-- getting ready");

    //add the css stylesheet
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = _spPageContextInfo.webAbsoluteUrl + "/SiteAssets/css/vdr.css";
    head.appendChild(style);

    $.when(initateVariables()).then(function () {
        //confirm user agrees to Terms of Service
        $.when(getTOS()).done(function (acceptance) {
            //user agrees
            writeActivity(acceptance, window.location.href, true);
            createContent();
        }).fail(function (rejection) {
            //user disagrees
            writeActivity(rejection, window.location.href, true);

            //chrome won't allow the dialog to close the parent window "Scripts may close only the windows that were opened by it."
            //but ie will
            window.close();
            window.location = "/_layouts/signout.aspx";
        });
    });
});

function initateVariables() {
    //console.log("-- initiating variables");
    var defer = $.Deferred();

    var getGroups = getAssociatedGroups();
    var getUser = getCurrentUser();
    var getUserListId = lookupItemId("Users", "User eq '" + _spPageContextInfo.userLoginName + "'")


    $.when(
        getItems("Config"),
        getGroups,
        getUser,
        getUserListId)
        .done(function (configData, groupData, userData, userListId) {
            //get config values
            for (i = 0; i < configData.length; i++) {
                config[configData[i].Key] = {};
                config[configData[i].Key].TextValue = configData[i].TextValue;
                config[configData[i].Key].MultiTextValue = configData[i].MultiTextValue;
                config[configData[i].Key].NumberValue = configData[i].NumberValue;
                config[configData[i].Key].YesNoValue = configData[i].YesNoValue;
                config[configData[i].Key].GroupValue = configData[i].GroupValue;
                config[configData[i].Key].Modified = configData[i].Modified;
            }

            //get group IDs
            ownerGroupID = groupData.AssociatedOwnerGroup.Id;
            memberGroupID = groupData.AssociatedMemberGroup.Id;
            visitorGroupID = groupData.AssociatedVisitorGroup.Id;
            groupPrefix = config.GroupPrefix.TextValue;

            //get user display name
            currentUser = userData.Title;

            if (userListId.length > 0) {
                $.when(
                    getItem("Users", userListId[0].Id)
                ).done(function (qList) {
                    questionList = qList.d.QuestionList;
                    defer.resolve();
                });
            } else {
                defer.resolve();
            }

        }).fail(function (err) {
            window.console && console.log(err);
        })

    return defer.promise();
}

function createContent() {
    console.log("-- creating content");

    //create a dialog element
    $("body").append("<div id='vdr_dialog'></div>");

    //create content element
    $("#layoutsTable").append("<div id='vdr_container'></div>");


    var vdrTabSet = new tabSet("#vdr_container", "vdrTabs");

    vdrTabSet.addTab("Home");
    vdrTabSet.addTab("Questions");

    //$("#vdr_container").append('<div id="tabs"></div>');
    //var html = "";

    //var homeTab = new tab("Home", "#tabs");
    //var questionTab = new tab("Question");
    //var homeTab = new tab("Home");

    //homeTab.content("<h1>hello there</h1>");

    //console.log(homeTab);


    //create tabs


    //tab links
    // html += "<ul>";
    // html += "<li><a href=\"#tab-1\">Home</a></li>";
    // html += "<li><a href=\"#tab-2\">Questions</a></li>";
    // html += "</ul>";



    //question tab
    //html += "<div id=\"tab-2\" class=\"tabcontent question_tab\"></div>";

    //add management tab if manage web permissions
    // ExecuteOrDelayUntilScriptLoaded(function () {
    //     var ctx = new SP.ClientContext.get_current();
    //     var web = ctx.get_web();

    //     var ob = new SP.BasePermissions();
    //     ob.set(SP.PermissionKind.manageWeb)

    //     var per = web.doesUserHavePermissions(ob)
    //     ctx.executeQueryAsync(function () {
    //         populateManagementTab();
    //     },
    //         function (a, b) {
    //             window.console && console.log("unable to retrieve user permissions");
    //         }
    //     );
    // }, "sp.js");



    // $(function () {
    //     $("#tabs").tabs({
    //         heightStyle: "auto"
    //     });
    // });

    //add home tab content


    //add question tab content
    //populateQuestionTab();
}
