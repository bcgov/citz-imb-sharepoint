$().ready(function () {
    //put the css references on the page
    var head = document.getElementsByTagName("head")[0];

    var jqueryStyle = document.createElement("link");
    jqueryStyle.type = "text/css";
    jqueryStyle.rel = "stylesheet";
    jqueryStyle.href = _spPageContextInfo.siteAbsoluteUrl + "/Style%20Library/Libraries/css/jquery-ui.min.css";;
    head.appendChild(jqueryStyle);

    var dataTablesStyle = document.createElement("link");
    dataTablesStyle.type = "text/css";
    dataTablesStyle.rel = "stylesheet";
    dataTablesStyle.href = _spPageContextInfo.siteAbsoluteUrl + "/Style%20Library/Libraries/css/datatables.min.css";;
    head.appendChild(dataTablesStyle);
    var jqueryUIStyle = document.createElement("link");
    jqueryUIStyle.type = "text/css";
    jqueryUIStyle.rel = "stylesheet";
    jqueryUIStyle.href = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/Libraries/css/jquery-ui.min.css";
    head.appendChild(jqueryUIStyle);

    var chartStyle = document.createElement("link");
    chartStyle.type = "text/css";
    chartStyle.rel = "stylesheet";
    chartStyle.href = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/Libraries/css/chart.min.css";
    head.appendChild(chartStyle);

    var fontAwesomeStyle = document.createElement("link");
    fontAwesomeStyle.type = "text/css";
    fontAwesomeStyle.rel = "stylesheet";
    fontAwesomeStyle.href = "https://" + window.location.hostname + _spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/Libraries/css/fontawesome.min.css";
    head.appendChild(fontAwesomeStyle);

});

//-----------------------------------------------------------------------------------
// Groups
//-----------------------------------------------------------------------------------
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
 * returns a promise of the associated owner, member, and visitor groups
 * @param {url} webSite uses webAbsoluteUrl if omitted
 */
function getAssociatedGroups(webSite) {
    var defer = $.Deferred();

    var _webSite = webSite || _spPageContextInfo.webAbsoluteUrl;

    $.ajax({
        url: _webSite +
            "/_api/web?$expand=AssociatedOwnerGroup,AssociatedMemberGroup,AssociatedvisitorGroup" +
            "&$select=AssociatedOwnerGroup,AssociatedMemberGroup,AssociatedvisitorGroup",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        defer.resolve(data.d);
    }).fail(function (error) {
        window.console && console.log(error);
        defer.reject();
    });

    return defer.promise();
}

//-----------------------------------------------------------------------------------
// Users
//-----------------------------------------------------------------------------------

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
 * @param {integer or string} user the user id or the display name (eg 'Toews, Scott D CITZ:EX')
 */
function removeUserFromGroup(groupId, user) {
    var defer = $.Deferred();
    var _userId;

    var removeUser = function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl +
                "/_api/web/sitegroups(" + groupId + ")/users/removebyid(" + _userId + ")",
            type: "POST",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        }).done(function (data) {
            defer.resolve(data);
        }).fail(function (error) {
            window.console & console.log(error);
            defer.reject();
        });
    }

    if (typeof user === "number") {
        _userId = user;
        removeUser();
    } else if (typeof user === "string") {
        $.when(getUserByName(user)).done(function (data) {
            console.log(data);
            _userId = data.Id;
            removeUser();
        }).fail(function (err) {
            window.console && console.log(err);
            defer.reject(err);
        });
    } else {
        defer.reject("not a valid userId");
    }

    return defer.promise();
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

function getUserByName(userName) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteUserInfoList/items?$filter=Title eq '" + userName + "'",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        defer.resolve(data.d.results[0]);
    }).fail(function (error) {
        defer.reject(error);
    });

    return defer.promise();
}
/**
 * returns a promise about the current user
 */
function getCurrentUser() {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/CurrentUser",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        defer.resolve(data.d);
    }).fail(function (error) {
        window.console && console.log(error);
        defer.reject(err);
    });

    return defer.promise();
}
//-----------------------------------------------------------------------------------
// Permissions
//-----------------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------------
// Sites
//-----------------------------------------------------------------------------------
var SPWeb = (function () {
    var instance = Object.create(this);
    var _private = {
        _getValues: function (values) {
            values = (values === undefined) ? {} : values;

            Object.keys(values).forEach(function (key) {
                instance[key] = values[key];
            });

            instance.url = (instance.url === undefined) ? _spPageContextInfo.webAbsoluteUrl : instance.url;
            instance.async = (instance.async === undefined) ? true : instance.async;

            return instance;

        },
        _get: function (values) {
            var defer = $.Deferred();
            _private._getValues(values);

            $.ajax({
                url: instance.url + "/_api/web",
                method: "GET",
                async: instance.async,
                headers: {
                    "accept": "application/json;odata=nometadata",
                    "content-type": "application/json;odata=nometadata"
                }
            }).done(function (results) {
                instance.results = results;
                defer.resolve(instance);
            }).fail(function (err) {
                instance.error = err;
                defer.reject(instance);
            });

            return defer.promise();
        }
    };

    return {
        data: instance,
        get: _private._get
    }
})

//==================DEPRECATED=======================================================
function getWebInfo(url) {
    var defer = $.Deferred();

    url = (url === undefined) ? _spPageContextInfo.webAbsoluteUrl : url;

    $.ajax({
        url: url +
            "/_api/web",
        type: "GET",
        headers: {
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata"
        }
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    });

    return defer.promise();
}



//-----------------------------------------------------------------------------------
// Lists
//-----------------------------------------------------------------------------------

var SPList = (function () {
    var instance = Object.create(this);
    var _private = {
        _getValues: function (values) {
            values = (values === undefined) ? {} : values;

            Object.keys(values).forEach(function (key) {
                instance[key] = values[key];
            });

            instance.url = (instance.url === undefined) ? _spPageContextInfo.webAbsoluteUrl : instance.url;
            instance.async = (instance.async === undefined) ? true : instance.async;

            return instance;

        },
        _get: function (values) {
            var defer = $.Deferred();
            _private._getValues(values);

            if (instance.guid === undefined) {
                if (instance.title === undefined) {
                    instance.error = "Requires title or guid";
                    defer.reject(instance);
                } else {
                    $.ajax({
                        url: instance.url + "/_api/web/Lists/getbytitle('" + instance.title + "')",
                        method: "GET",
                        async: instance.async,
                        headers: {
                            "accept": "application/json;odata=nometadata",
                            "content-type": "application/json;odata=nometadata"
                        }
                    }).done(function (results) {
                        instance.results = results;
                        defer.resolve(instance);
                    }).fail(function (err) {
                        instance.error = err;
                        defer.reject(instance);
                    });
                }
            } else {
                $.ajax({
                    url: instance.url + "/_api/web/Lists('" + instance.guid + "')",
                    method: "GET",
                    async: instance.async,
                    headers: {
                        "accept": "application/json;odata=nometadata",
                        "content-type": "application/json;odata=nometadata"
                    }
                }).done(function (results) {
                    instance.results = results;
                    defer.resolve(instance);
                }).fail(function (err) {
                    instance.error = err;
                    defer.reject(instance);
                });
            }

            return defer.promise();
        },
        _create: function (values) {
            var defer = $.Deferred();
            _private._getValues(values);



            if (instance.title === undefined) {
                instance.error = "a Title is required";
                defer.reject(instance);
            } else {
                var listInfo = {};

                listInfo.Title = instance.title.replace(/[^A-Za-z0-9\_\-]/gi, "");
                listInfo.AllowContentTypes = (instance.AllowContentTypes === undefined) ? false : instance.allowContentTypes;
                listInfo.BaseTemplate = (instance.BaseTemplate === undefined) ? 101 : instance.baseTemplate;
                listInfo.ContentTypesEnabled = (instance.ContentTypesEnabled === undefined) ? false : instance.contentTypesEnabled;
                listInfo.Description = (instance.Description === undefined) ? "" : instance.description;

                $.ajax({
                    url: instance.url + "/_api/web/Lists",
                    method: "POST",
                    async: instance.async,
                    headers: {
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "accept": "application/json;odata=nometadata",
                        "content-type": "application/json;odata=nometadata"
                    },
                    data: JSON.stringify(listInfo)
                }).done(function (results) {
                    console.log("Ajax results", results)
                    instance.results = results;
                    defer.resolve(instance);
                }).fail(function (err) {
                    instance.error = err;
                    defer.reject(instance);
                })

            }

            return defer.promise();
        },
        _getItems: function () {
            var defer = $.Deferred();

            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists('" + instance.results.Id + "')/items",
                type: "GET",
                headers: {
                    'Accept': 'application/json;odata=verbose'
                }
            }).done(function (data) {
                instance.items = data.d.results;
                defer.resolve(instance);
            }).fail(function (err) {
                window.console && console.log(err);
                instance.error = err;
                defer.reject(instance);
            });

            return defer.promise();
        }
    };

    return {
        data: instance,
        get: _private._get,
        getItems: _private._getItems,
        create: _private._create
    }
})

//==================================DEPRACATED=======================================
function getListByGuid(guid) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/lists('" + guid + "')",
        type: "GET",
        headers: {
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata"
        }
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (error) {
        window.console && console.log(error);
        defer.reject(error);
    });

    return defer.promise();
}

function getList(listName) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/lists/GetByTitle('" + listName + "')",
        type: "GET",
        headers: {
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata"
        }
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (error) {
        window.console && console.log(error);
        defer.reject(error);
    });

    return defer.promise();
}
/**
 * creates a list or library
 * @param {object} listInfo
 * required properties: Title
 * optional properties: AllowContentTypes: [false]
 *                      BaseTemplate: [101]
 *                      ContentTypesEnabled: [false]
 *                      Description: []
 */
function createList(listInfo) {
    var defer = $.Deferred();

    listInfo.__metadata = { "type": "SP.List" };
    listInfo.AllowContentTypes = listInfo.AllowContentTypes || false;
    listInfo.BaseTemplate = listInfo.BaseTemplate || 101;
    listInfo.ContentTypesEnabled = listInfo.ContentTypesEnabled || false;
    listInfo.Description = listInfo.Description || "";

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        data: JSON.stringify(listInfo)
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    });

    return defer.promise();
}
//-----------------------------------------------------------------------------------
// Items
//-----------------------------------------------------------------------------------

/**
 * returns a promise of all items of a list
 * @param {string} listName - the name of the list
 */
function getItems(listName) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')/items",
        type: "GET",
        headers: {
            'Accept': 'application/json;odata=verbose'
        }
    }).done(function (data) {
        defer.resolve(data.d.results);
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    });

    return defer.promise();
}

/**
 * returns a promise of a specified item
 * @param {string} listName
 * @param {integer} itemId
 */
function getItem(listName, itemId) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')/items(" + itemId + ")",
        type: "GET",
        headers: {
            'Accept': 'application/json;odata=verbose'
        }
    }).done(function (data) {
        defer.resolve(data);
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    });

    return defer.promise();
}

/**
 *returns the promise of an array of IDs that match the itemFilter
 *see https://social.technet.microsoft.com/wiki/contents/articles/35796.sharepoint-2013-using-rest-api-for-selecting-filtering-sorting-and-pagination-in-sharepoint-list.aspx
 *for formatting of itemFilter
 * @param {string} listName
 * @param {string} itemFilter
 */
function lookupItemId(listName, itemFilter) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')/items?$filter=" + itemFilter + "&$select=ID",
        type: "GET",
        headers: {
            'Accept': 'application/json;odata=verbose'
        }
    }).done(function (data) {
        defer.resolve(data.d.results)
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    })

    return defer.promise();
}

/**
 * adds an item to a list
 * @param {string} listName
 * @param {object} item - properties are fields, values are values
 */
function addItemToList(listName, item) {
    var defer = $.Deferred();

    $.when(
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')/listItemEntityTypeFullName",
            type: "GET",
            async: false,
            headers: {
                'Accept': 'application/json;odata=verbose'
            }
        }).done(function (data) {
            item.__metadata = { 'type': data.d.ListItemEntityTypeFullName };
        }).fail(function (err) {
            window.console && console.log(err);
        })
    ).done(function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')/items",
            type: "POST",
            headers: {
                'X-RequestDigest': $("#__REQUESTDIGEST").val(),
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose'
            },
            data: JSON.stringify(item)
        }).done(function (data) {
            defer.resolve(data);
        }).fail(function (err) {
            window.console && console.log(err);
            defer.reject(err);
        });
    });

    return defer.promise();
}

/**
 *deletes an item from a list
 * @param {string} listName
 * @param {integer} itemId
 */
function removeItemFromList(listName, itemId) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")",
        method: "DELETE",
        headers: {
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": "*"
        }
    }).done(function (data) {
        console.log(data);
    }).fail(function (error) {
        window.console && console.log(err);
    });
}

/**
 * updates a list item
 * @param {string} listName
 * @param {object} item - must contain Id property.  other properies match columns
 */
function updateItem(listName, item) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/Items(" + item.Id + ")",
        type: "POST",
        data: JSON.stringify(item),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata",
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        }
    }).done(function () {
        defer.resolve();
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    });

    return defer.promise();
}

//-----------------------------------------------------------------------------------
// Fields
//-----------------------------------------------------------------------------------
/**
 * adds a field to a list
 * @param {string} listName
 * @param {object} fields
 * required Properties: Title
 * optional Properties: FieldTypeKind [2]
 *                      StaticName [Title]
 */
function addField(listName, field) {
    var defer = $.Deferred();

    field.__metadata = { "type": "SP.Field" };
    field.FieldTypeKind = field.FieldTypeKind || 2;  //text field
    field.StaticName = field.StaticName || field.Title;

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/fields",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        data: JSON.stringify(field)
    }).done(function (data) {
        console.log(data);
        defer.resolve(data.d);
    }).fail(function (err) {
        window.console && console.log(err);
        defer.reject(err);
    })

    return defer.promise();
}