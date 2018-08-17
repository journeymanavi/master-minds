import React from 'react';
import ReactDOM from 'react-dom';
import MasterMinds from './MasterMinds';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MasterMinds />, div);
  ReactDOM.unmountComponentAtNode(div);
});
