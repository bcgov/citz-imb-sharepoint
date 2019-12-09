import React, { Component } from 'react'
import PublicQuestions from './PublicQuestions'
import PrivateQuestions from './PrivateQuestions'

export class QuestionTabContent extends Component {
    render() {
        return (
            <div>
                <h2>Site Management</h2>
                <div className='row'>
                    <div className='column'>
                        <PublicQuestions />
                    </div>

                    <div className='column'>
                        <PrivateQuestions />
                    </div>
                </div>
            </div>
        )
    }
}

export default QuestionTabContent
