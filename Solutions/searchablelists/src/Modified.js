import React from 'react';
import Moment from 'react-moment';
import momentjs from 'moment';

class LastModified extends React.Component {
    render() {
        var r = "";
        const lastModified = this.props.LastModifiedTime;
        const dateDiff = momentjs().diff(momentjs(lastModified), 'days');

        if (dateDiff > 18 ){
            r = <Moment element="span" className="badge badge-danger" fromNow>{lastModified}</Moment> ;
        } else if (dateDiff > 9){
            r = <Moment element="span" className="badge badge-warning" fromNow>{lastModified}</Moment> ;
        } else {
            r = <Moment element="span" className="badge badge-light" fromNow>{lastModified}</Moment> ;
        }

        return r;
    }
}

export default LastModified;