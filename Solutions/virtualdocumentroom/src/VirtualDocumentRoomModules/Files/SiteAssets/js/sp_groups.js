function getWebGroups(withMembers) {
    var defer = $.Deferred();

    var restCall = (withMembers === true) ? "/_api/web/RoleAssignments?$expand=Member,Member/Users" : "/_api/web/RoleAssignments?$expand=Member"

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + restCall,
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
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