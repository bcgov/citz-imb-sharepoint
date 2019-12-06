import React, { Component } from 'react'

class form extends Component {

    constructor(props) {
        super(props)

        this.state = {
            firstname: '',
            lastname: ''
        }
    }
    handleInputChange = (event) => {
        console.log(event.target.id, event.target.value)
        this.setState({
            [event.target.id]: event.target.value
        })
    }
    render() {
        return (
            <form>
                <div>
                    <label>First Name</label>
                    <input id='firstname' type='text' value={this.state.firstname} onChange={this.handleInputChange}></input>
                </div>
                <div>
                    <label>First Name</label>
                    <input id='lastname' type='text' value={this.state.lastname} onChange={this.handleInputChange}></input>
                </div>
            </form>
        )
    }
}

export default form
