import React from 'react';
import '../css/App.css';
import TabSet from '../components/TabSets'
import Terms from '../components/Terms'
import Form from '../components/form'

function App() {
  return (
    <div className="App">
      <Terms />
      <TabSet />
    </div>
  );
}

export default App;
