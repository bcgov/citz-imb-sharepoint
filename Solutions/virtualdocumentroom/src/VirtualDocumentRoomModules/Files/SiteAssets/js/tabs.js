function tabSet(container, tabSetName) {
    var _tabSetInstance = {
        _container: container,
        _name: tabSetName,
        _tabSetId: '#' + tabSetName,
        _tabSetHeaderId: '#' + tabSetName + '_tab_headers',
        _tabSetContentsId: '#' + tabSetName + '_tab_contents',
        _tabs: []
    }

    var tabHtml = '<div id="' + _tabSetInstance._name + '">';
    tabHtml += '<ul id="' + _tabSetInstance._tabSetHeaderId + '">';
    tabHtml += "</ul>";
    tabHtml += '<div id="' + _tabSetInstance._tabSetContentsId + '">';
    tabHtml += "</div>";
    tabHtml += '</div>';

    $(_tabSetInstance._container).append(tabHtml);

    return {
        tabs: _tabSetInstance._tabs,
        addTab: _addTab
    };

    function _addTab(tabName) {
        var nextTabIndex = _tabSetInstance._tabs.length;
        _tabSetInstance._tabs.push(new _tab(tabName, nextTabIndex));

        $(_tabSetInstance._tabSetHeaderId).append(_tabSetInstance._tabs[_tabSetInstance._tabs.length - 1].html)

        if (nextTabIndex < 1) {
            _setActiveTab(nextTabIndex);
        }
    }

    function _setActiveTab(index) {
        $(_tabSetInstance._tabSetId + " .tabcontent").removeClass('active');
        $(_tabSetInstance._tabSetId + " .tabcontent[data-tab-id=" + index + "]").addClass('active');
    }

    //-------------------------
    function _tab(tabname, index) {
        var _tabInstance = {
            _name: tabname,
            _baseHtml: '<div id=' + tabname + ' class="tabcontent" data-tab-id=' + index + '>' +
                '<h2>' + tabname + '</h2>' +
                '</div>',
            _tabId: '#tab-' + tabname,
            _index: index
        }

        $(_tabSetInstance._tabSetId).append(_tabInstance._baseHtml);

        return {
            html: _tabInstance._baseHtml,
            name: _name(),
            id: _tabInstance._tabId,
            content: _addContent
        }

        function _name() {
            return _tabInstance._name;
        }
        function _html() {
            //console.log(_instance._html[0])
            //return _instance._html[0].outerHTML;
        }
        function _addContent(htmlcontent) {
            //console.log(htmlcontent)
            _tabInstance._html.append("bloop bleep");
            return _tabInstance._html;
        }
    }
}
