# CITZ.IMB.SP.JSLibraries
Common 3rd party and custom Javascript Libraries to be used in SharePoint 2016

Includes:
* [jquery-3.3.1.min.js](https://jquery.com/)
* [jquery-ui.min.js](https://jqueryui.com/)
* [moment.min.js](https://momentjs.com/)
* [datatables.min.js](https://datatables.net/)
* [numeral.min.js](http://numeraljs.com/)
* [chart.min.js](https://www.chartjs.org/)
* [fontawesome.min.js](https://fontawesome.com)
* citz.imb.sp.library.js

## citz.imb.sp.library.js
### getWebGroups(*withMembers*)
> Returns a promise of a JSON object containing SharePoint Groups having permissions on the current web
### createGroup(*groupName, description, ownerID*)
> Creats a new group and returns the ID
### deleteGroup(*groupId*)
> Deletes a group from the collection
### grantGroupPermissionToWeb(*groupId, permissionLevel*)
> Grants permissions to the current web
### breakListInheritance(*listId, copy, clear*)
> Sets a list to have unique permissions
### grantGroupPermissionToList(*listId, groupId, permissionLevel*)
> Grants permissions to a list
### addUserToGroup(*groupId, logonName*)
> Adds a user to a group
### removeUserFromGroup(*groupId, userId*)
> Removes a user from a group
### getUserById(*withGroups, userId*)
> Returns a promise of user information JSON object