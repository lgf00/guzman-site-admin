import React, { useState } from 'react';
import boytired from './images/boytired.jpg';
import cute from './images/cute.png';
import stack from './images/stack.jpg';
import overalls from './images/overalls.jpg'
import DnD from './components/DnD.js';
import AddForm from './components/AddForm.js';
import './App.css';

// TODO: GET from s3 bucket(?)
const finalAlbums = [

];

function App() {
  const [albums, updateAlbums] = useState(finalAlbums);
  const [addModal, showAddModal] = useState(false);

  return (
    <div className="App">
      <div className="content">
        {addModal && (<AddForm albums={albums} updateAlbums={updateAlbums} addModal={addModal} showAddModal={showAddModal}/>)}
        <div className="controls">
          <button onClick={() => (showAddModal(true))}> Add </button>
          <button> Save </button>
        </div>
        <DnD albums={albums} updateAlbums={updateAlbums}/>
      </div>
    </div>
  );
}

export default App;
