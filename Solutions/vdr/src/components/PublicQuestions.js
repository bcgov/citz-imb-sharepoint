import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

class PublicQuestions extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            columns: [
                {
                    title: "Questions",
                    data: "Question"
                },
                {
                    title: "Answers",
                    data: "Answer"
                }
            ],
            dom: 'ftp'
        }
    }
    
    componentWillMount() {
        //get public question list data
        let _this = this;

        $.ajax({
            url: "../_api/web/lists/getByTitle('Questions')/items",
            type: "GET",
            async: false,
            headers: {
                'Accept': 'application/json;odata=verbose'
            }
        }).done(function (result) {
            _this.state.data = result.d.results
        }).fail(function (err) {
            window.console && console.log(err)
        })
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