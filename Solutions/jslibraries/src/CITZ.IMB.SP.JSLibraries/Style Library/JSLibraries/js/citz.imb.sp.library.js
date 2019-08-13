$().ready(function () {
    //put the css reference on the page
    var head = document.getElementsByTagName("head")[0];

    var jqueryUIStyle = document.createElement("link");
    jqueryUIStyle.type = "text/css";
    jqueryUIStyle.rel = "stylesheet";
    jqueryUIStyle.href = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/JSLibraries/css/jquery-ui.min.css";
    head.appendChild(jqueryUIStyle);

    var chartStyle = document.createElement("link");
    chartStyle.type = "text/css";
    chartStyle.rel = "stylesheet";
    chartStyle.href = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/JSLibraries/css/chart.min.css";
    head.appendChild(chartStyle);

    var fontAwesomeStyle = document.createElement("link");
    fontAwesomeStyle.type = "text/css";
    fontAwesomeStyle.rel = "stylesheet";
    fontAwesomeStyle.href = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/JSLibraries/css/fontawesome.min.css";
    head.appendChild(fontAwesomeStyle);

});

/**
 * Returns a promise of a JSON object containing SharePoint Groups having permissions on the current web
 *
 * @param {boolean} withMembers includes members of group if true (default = false)
 */
function getWebGroups(withMembers) {
    var defer = $.Deferred();

    var restCall = (withMembers === true) ? "/_api/web/RoleAssignments?$expand=Member,Member/Users" : "/_api/web/RoleAssignments?$expand=Member"

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + restCall,
        type: "GET",
        headers: {
            'Accept': 'application/json;odata=verbose'
        }
    }).done(function (data) {
        var arr = [];

        for (i = 0; i < data.d.results.length; i++) {
            if (data.d.results[i].Member.PrincipalType === 8) {
                //is a sharepoint group
                arr.push(data.d.results[i].Member)
            }
        }

        defer.resolve(arr);

    }).fail(function (error) {
        defer.reject(error);
    });

    return defer.promise();
}

/**
 * Creats a new group and returns the ID
 *
 * @param {string} groupName then name of the group to be created
 * @param {string} description the description of the group
 * @param {integer} ownerID the ID number of the group that will own the new group
 */
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
        }, function (error) {
            //fail
            defer.reject()
        })
    }, function () {
        console.log("fail in ctx.executeQueryAsync");
    });
    return defer.promise();
}

/**
 * Deletes a group from the collection
 *
 * @param {integer} groupId the id of the group to be deleted
 */
function deleteGroup(groupId) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/sitegroups/removebyid(" + groupId + ")",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata"
        }
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (error) {
        defer.reject(error);
    });

    return defer.promise();
}

/**
 * Grants permissions to the current web
 *
 * @param {integer} groupId the group to grant permssions to
 * @param {string} permissionLevel the permission level to grant (eg 'Full Control')
 */
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

/**
 * Sets a list to have unique permissions
 *
 * @param {GUID} listId the guid for a list to apply unique permissions to
 * @param {boolean} copy keeps current permssions if true (default = true)
 * @param {boolean} clear changes all child items/containers to inherit if true (default = false)
 */
function breakListInheritance(listId, copy, clear) {
    var defer = $.Deferred();

    copy = (copy === undefined) ? true : copy;
    clear = (clear === undefined) ? false : clear;

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbyid('" + listId +
            "')/breakroleinheritance(copyRoleAssignments=" + copy + ",clearSubscopes=" + clear + ")",
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        dataType: "json"
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (error) {
        defer.reject(error);
    });

    return defer.promise();
}

/**
 * Grants permissions to a list
 *
 * @param {GUID} listId the guid for a list to grant permissions to
 * @param {integer} groupId the group to grant permssions to
 * @param {string} permissionLevel the permission level to grant (eg 'Full Control')
 */
function grantGroupPermissionToList(listId, groupId, permissionLevel) {
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
            url: _spPageContextInfo.webAbsoluteUrl +
                "/_api/web/lists('" + listId + "')/roleassignments/addroleassignment(principalid=" + groupId + ",roledefid=" + data.d.Id + ")",
            type: "POST",
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        }).done(function (data) {
            defer.resolve(data);
        }).fail(function (error) {
            defer.reject(error);
        });
    }).fail(function (error2) {
        defer.reject(error2);
    });
    return defer.promise();
}

/**
 * Adds a user to a group
 *
 * @param {integer} groupId the first value passed in must be the id of the group
 * @param {string} logonName user logon eg "i:0ǵ.t|bcgovidp|a32d6f859c66450ca4995b0b2bf0a844"
 */
function addUserToGroup(groupId, logonName) {
    SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
        var ctx = new SP.ClientContext();
        var groups = ctx.get_web().get_siteGroups();
        var group = groups.getById(groupId);
        var user = ctx.get_web().ensureUser(logonName);
        var groupUsers = group.get_users();
        groupUsers.addUser(user);

        ctx.load(user);
        ctx.load(group);
        ctx.executeQueryAsync(function (sender, args) {
            return true;
        }, function (sender, args) {
            window.console && console.log("Error: " + args.get_message());
            return false;
        })
    });
}

/**
 * Removes a user from a group
 *
 * @param {integer} groupId the first value passed in must be the id of the group
 * @param {integer} userId the user id
 */
function removeUserFromGroup(groupId, userId) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/sitegroups(" + groupId + ")/users/removebyid(" + userId + ")",
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        }
    }).done(function (data) {
        console.log(data);
    }).fail(function (error) {
        window.console & console.log(error);
    });
}

/**
 * Returns a promise of user information JSON object
 * @param {boolean} [withGroups=false] if true, includes groups the user is a member of
 * @param {integer} userId user id
 */
function getUserById(withGroups, userId) {
    var defer = $.Deferred();

    var restCall = (withGroups === true) ? "?$expand=Groups" : "";

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userId + ")" + restCall,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        defer.resolve(data.d);
    }).fail(function (error) {
        defer.reject(error);
    });

    return defer.promise();
}