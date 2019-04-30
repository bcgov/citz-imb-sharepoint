import React from 'react';
import "bootstrap/dist/css/bootstrap.css"
import CardList from './CardList.js';
import FilterForm from './Filter.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
      items: [
        {"Title":"AMCS RFS",
        "Size":"0",
        "Path":"https://citz.sp.gov.bc.ca/sites/UAT/AMCS_RFS/Forms/AllItems.aspx",
        "Description":"Bacon ipsum dolor amet frankfurter ribeye kielbasa spare ribs swine, pork loin pig rump ball tip. Rump turkey cupim, doner buffalo venison short ribs kielbasa boudin alcatra pig drumstick ham hock ground round. Tail short ribs short loin pork chop ball tip turkey flank boudin ham hock shank corned beef. Venison beef andouille, fatback bacon capicola meatloaf spare ribs. Doner turducken cow, salami corned beef sausage sirloin ham hock frankfurter tri-tip short ribs strip steak pig. Picanha beef short ribs corned beef.",
        "LastModifiedTime":"2019-04-08T14:46:35.0000000Z",
        "contentclass":"STS_List_DocumentLibrary",
        "ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},
        {"Title":"Change Management CoP","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/ChangeManagementCoP/Forms/AllItems.aspx","Description":null,"LastModifiedTime":"2019-04-07T17:00:38.0000000Z","contentclass":"STS_List_DocumentLibrary","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"Change Management CoP Calendar","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/Change Management CoP Calendar/calendar.aspx","Description":null,"LastModifiedTime":"2018-09-12T17:30:14.0000000Z","contentclass":"STS_List_Events","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"Create page REST","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/Create page REST/AllItems.aspx","Description":null,"LastModifiedTime":"2019-04-14T06:57:37.0000000Z","contentclass":"STS_List_GenericList","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"IMB User Acceptance Testing - discussion","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/discussion/AllItems.aspx","Description":null,"LastModifiedTime":"2019-04-10T18:39:50.0000000Z","contentclass":"STS_List_DiscussionBoard","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"IMB User Acceptance Testing - survey","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/survey/overview.aspx","Description":null,"LastModifiedTime":"2019-04-10T18:38:26.0000000Z","contentclass":"STS_List_Survey","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"MicroFeed","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/PublishedFeed/AllItems.aspx","Description":"MySite MicroFeed Persistent Storage List","LastModifiedTime":"2018-09-12T17:30:22.0000000Z","contentclass":"STS_List_544","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"Report Master List","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/ReportMasterList/AllItems.aspx","Description":"Master List for all STMS Report Obligations","LastModifiedTime":"2019-04-10T20:58:25.0000000Z","contentclass":"STS_List_GenericList","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"Site Master","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/Lists/SiteMaster/AllItems.aspx","Description":null,"LastModifiedTime":"2019-04-08T16:12:06.0000000Z","contentclass":"STS_List_GenericList","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"Site Pages","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/SitePages/Forms/AllPages.aspx","Description":null,"LastModifiedTime":"2019-04-17T17:27:30.0000000Z","contentclass":"STS_List_WebPageLibrary","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"},{"Title":"Site Post-Migration Checklist Library","Size":"0","Path":"https://citz.sp.gov.bc.ca/sites/UAT/SitePostMigrationChecklist/Forms/AllItems.aspx","Description":null,"LastModifiedTime":"2019-04-07T18:31:53.0000000Z","contentclass":"STS_List_DocumentLibrary","ParentLink":"https://citz.sp.gov.bc.ca/sites/UAT"}
      ]
    }
  }

  render() {
    var {isLoaded} = this.state;

    if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div id="csp_srchlists">
          <div className="container-fluid">
            <h1>Lists and Libraries</h1>
            <FilterForm />
            <CardList items={this.state.items} />
          </div>
        </div>
      );
    }
  }
}

export default App;
