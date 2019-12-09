import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

export class PublicQuestions extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [
            ],
            columns:  [
                {
                    title: "Questions",
                    data: "Questions"
                },
                {
                    title: "Answers",
                    data: "Answers"
                }
            ],
            dom: 'ftp'
        }
    }
    
    render() {
        return (
            <div>
                <DataTable 
                data={this.state.data}
                buttons={this.state.buttons}
                columns={this.state.columns}
                dom={this.state.dom}
                ></DataTable>
            </div>

        )
    }
}

export default PublicQuestions
