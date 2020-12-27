import React, { useState } from 'react';
import DnD from './components/DnD.js';
import AddModal from './components/AddModal.js';
import './App.css';
import EditModal from './components/EditModal.js';

// TODO: GET from s3 bucket(?)
const finalAlbums = [

];

function App() {
  const [albums, updateAlbums] = useState(finalAlbums);
  const [addModal, showAddModal] = useState(false);
  const [editModal, showEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImages, setEditImages] = useState([]);
  
  return (
    <div className="App">
      <div className="container">
        {addModal && (<AddModal albums={albums} updateAlbums={updateAlbums} showAddModal={showAddModal}/>)}
        {editModal && (<EditModal albums={albums} updateAlbums={updateAlbums} editName={editName} setEditName={setEditName} editImages={editImages} setEditImages={setEditImages} showEditModal={showEditModal}/>)}
        <div className="controls">
          <button onClick={() => (showAddModal(true))}> Add </button>
          <button> Save </button>
        </div>
        <div className="content">
          <DnD albums={albums} updateAlbums={updateAlbums} showEditModal={showEditModal} setEditName={setEditName} setEditImages={setEditImages}/>
        </div>
      </div>
    </div>
  );
}

export default App;
