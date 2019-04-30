import React from 'react';
import LastModified from './Modified.js';

class Card extends React.Component {
    render() {
        const site = this.props;
        return (
                <div className="card shadow-sm m-2" style={{width: 400, height: 285}}>
                    <h6 className="card-header text-center bg-primary text-white">
                        {site.Title}
                    </h6>
                    <div className="card-body overflow-auto">
                        <p className="card-text">{site.Description}</p>
                    </div>
                    <div className="card-footer text-muted">
                        <div className="float-right">
                            <LastModified {...site}/>
                        </div>
                    </div>
                </div>
        )
    }
}

export default Card;