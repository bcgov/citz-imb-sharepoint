import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './script/App';
import * as serviceWorker from './serviceWorker';
import $ from 'jquery'

$(document).ready(function () {
    ReactDOM.render(<App />, document.getElementById('app-root'));
    var head = document.getElementsByTagName('head')[0]
    var vdrStyle = document.createElement('link')
    vdrStyle.type = 'text/css'
    vdrStyle.rel = 'stylesheet'
    vdrStyle.href = '../SiteAssets/css/vdr.css'
    head.appendChild(vdrStyle)

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister();
});
