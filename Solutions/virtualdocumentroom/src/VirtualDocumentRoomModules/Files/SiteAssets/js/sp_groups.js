function getWebGroups() {
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/RoleAssignments?$expand=Member,Member/Users",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
        }
    }).done(function (data) {
        var groupHtml = "<div id='vdr_group_data'>";
        var results = data.d.results;

        for (i = 0; i < results.length; i++) {
            groupHtml += "<h3>";
            groupHtml += results[i].Member.Title;
            groupHtml += "</h3>";
            groupHtml += "<div>"
            for (j = 0; j < results[i].Member.Users.results.length; j++) {
                groupHtml += "<div>";
                groupHtml += results[i].Member.Users.results[j].Title;
                groupHtml += "</div>";
            }
            groupHtml += "<a onclick='addUser()' class='ui-button ui-widget ui-corner-all'>";
            groupHtml += "add a user";
            groupHtml += "</a>";
            groupHtml += "</div>";
        }
        groupHtml += "</div>";
        $("#vdr_management").append(groupHtml);
        $("#vdr_group_data").accordion({
            collapsible: true,
            active: false,
            heightStyle: "content"
        });
    }).fail(function (error) {
        window.console && console.log(error);
    });
}

function createGroup(groupName, description, ownerID) {
    var defer = $.Deferred();

    var ctx = new SP.ClientContext()
    var web = ctx.get_web();
    var groups = web.get_siteGroups();

    var newGroup = new SP.GroupCreationInformation();
    newGroup.set_title(groupName);
    newGroup.set_description(description);

    ctx.load(web, 'Title');
    ctx.executeQueryAsync(function () {
        var newOwner = groups.getById(ownerID);
        var newCreateGroup = groups.add(newGroup);
        newCreateGroup.set_owner(newOwner);
        newCreateGroup.update();
        ctx.executeQueryAsync(function () {
            //success
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/getbyname('" + groupName + "')?$select=id",
                method: "GET",
                headers: { "accept": "application/json;odata=verbose" }
            }).done(function (data) {
                defer.resolve(data.d.Id);
            }).fail(function (error) {
                window.console && console.log(JSON.stringify(error));
                defer.resolve(0);
            });

            //TODO: resolve the group ID

        }, function (error) {
            //fail
            defer.reject()
        })
    }, function () {
        console.log("fail in ctx.executeQueryAsync");
    });

    return defer.promise();
}

function grantGroupPermissionToWeb(groupId, permissionLevel) {
    var defer = $.Deferred();
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/RoleDefinitions/getbyname('" + permissionLevel + "')",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        dataType: "json"
    }).done(function (data) {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/roleassignments/addroleassignment(principalid=" + groupId + ",roledefid=" + data.d.Id + ")",
            type: "POST",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            dataType: "json"
        }).done(function () {
            defer.resolve();
        }).fail(function (error) {
            defer.reject();
        });
    }).fail(function (error) {
        defer.reject();
    });
    return defer.promise();
}