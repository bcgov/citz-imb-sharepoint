import 'react-tabs/style/react-tabs.css';
import React, { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import HomeTabContent from './HomeTabContent';
import QuestionTabContent from './QuestionTabContent';
import ManagementTabContent from './ManagementTabContent';

class AppContent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            authenticated: true
        }
    }

    render() {
        let jsx = <Tabs>
            <TabList>
                <Tab>Home</Tab>
                <Tab>Questions</Tab>
                {this.state.authenticated ? <Tab>Management</Tab> : ''}
            </TabList>
            <TabPanel>
                <HomeTabContent />
            </TabPanel>
            <TabPanel>
                <QuestionTabContent />
            </TabPanel>
            {this.state.authenticated ? <TabPanel><ManagementTabContent/></TabPanel> : ''}
        </Tabs >

        return jsx
    }
}

export default AppContent
