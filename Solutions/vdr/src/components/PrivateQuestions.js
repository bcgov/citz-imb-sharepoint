import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

class PrivateQuestions extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            buttons: [
                {
                    text: 'Ask a Question',
                    action: function (e, dt, node, config) {
                        alert("Ask a Question");
                    }
                }
            ],
            columns: [
                {
                    title: "My Questions",
                    data: "Question"
                }
            ],
            dom: 'tBp'
        }
    }
    
    componentWillMount() {
        //get public question list data
        let _this = this;
        let QuestionList = '' //TODO: define this properly
        
        $.ajax({
            url: `../_api/web/lists/getByTitle('${QuestionList}')/items`,
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

export default PrivateQuestions