# Breadcrumb Navigation
Creates a breadcrumb on all pages within the SharePoint Collection.  Also hides pageTitle.

Pre-requisites:
- requires jquery.  Jquery is included in [CITZ.IMB.SP.JSLibraries](../jslibraries) solution.
- requires minimal download feature to be disabled in all sites in the collection.

Usage:
1. download CITZ.IMB.SP.Breadcrumb.wsp
2. upload and activate CITZ.IMB.SP.Breadcrumb.wsp to the Solution Gallery of your Site Collection

Known issues:
- apostraphes in a folder name results in a broken link.  Don't use apostraphes.