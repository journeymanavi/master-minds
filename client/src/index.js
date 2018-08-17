import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MasterMinds from './MasterMinds';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<MasterMinds />, document.getElementById('master-minds'));
registerServiceWorker();
