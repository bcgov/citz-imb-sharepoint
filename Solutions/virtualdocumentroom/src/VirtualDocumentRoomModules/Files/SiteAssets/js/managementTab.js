
function populateManagementTab() {
    console.log("-- populating Management");

    //create tab content and structure
    var tabheader = "<li><a href=\"#tab-3\">Site Management</a></li>";
    var tabcontent = "<div id=\"tab-3\" class=\"tabcontent management_tab\">";
    tabcontent += "<h2>Site Management</h2>";
    tabcontent += "<div id='vdr_management'>";
    tabcontent += "</div>";

    tabcontent += "<div id='vdr_management_instructions'>";
    tabcontent += "<h3>instructions</h3>";
    tabcontent += "<div>"

    tabcontent += "<ul>";
    tabcontent += "<li>Tab to be visible only to VICO Site Administrators</li>";
    tabcontent += "<ul>";
    tabcontent += "<li>VICO Administrator - administrates and grants access to the VICO site (a site owner)</li>";
    tabcontent += "<li>VICO Manager - uploads documents and answers questions (a member)</li>";
    tabcontent += "<li>Proponent - a business interested in the procurement (no direct access)</li>";
    tabcontent += "<li>User - a specified BCeID user account identified by the proponent (a restricted member)</li>";
    tabcontent += "</ul>";
    tabcontent += "<li>Contains links and instructions on how to add proponents and users</li>";
    tabcontent += "<li>Add proponent to site</li>";
    tabcontent += "<ul>";
    tabcontent += "<li>generate a random string as a non-identifiable object name for all things related to proponent</li>";
    tabcontent += "<li>create a group</li>";
    tabcontent += "<li>create a contribution library</li>";
    tabcontent += "<li>create a question list?</li>";
    tabcontent += "</ul>";
    tabcontent += "<li>be able to add users to proponents</li>";
    tabcontent += "<li>have the ability to remove a users access</li>";
    tabcontent += "<li>all actions are to be logged (type, info, proponent, user, date, time, etc.)</li>";
    tabcontent += "<li>shortlist proponents (ie deactivate a proponent and remove users access)</li>";
    tabcontent += "</div>";
    tabcontent += "</div>";
    tabcontent += "</div>";

    //add content to page
    $("#tabs").tabs().find(".ui-tabs-nav").append(tabheader);
    $("#tabs").tabs().append(tabcontent);
    $("#tabs").tabs().tabs("refresh");

    $("#vdr_management_instructions").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    //populate the groups and proponents
    displayWebGroups();
    displayProponents();
}
