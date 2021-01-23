import React, { useState } from 'react';
import DnD from './components/DnD.js';
import AddModal from './components/AddModal.js';
import './App.css';
import EditModal from './components/EditModal.js';
import AWS from 'aws-sdk';

// TODO: GET from s3 bucket(?)


// async function getAlbumNames() {
//   // await s3.listObjects({ Delimiter: "/" }, function (err, data) {
//   //   if (err) {
//   //     return alert("There was an error listing your albums: " + err.message);
//   //   } else {
//   //     console.log(data);
//   //     data.CommonPrefixes.forEach((commonPrefix) => {
//   //       var prefix = commonPrefix.Prefix;
//   //       var albumName = decodeURIComponent(prefix.replace("/", ""));
//   //       console.log(albumName);
//   //       albumNames.push(albumName);
//   //     });
//   //     console.log("in getAlbumNames", albumNames);
//   //   }
//   // }).promise();
// }

// async function getAlbumImages(albumName) {

// }

function App(props) {
  const [albums, updateAlbums] = useState(props.albums);
  const [addModal, showAddModal] = useState(false);
  const [editModal, showEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImages, setEditImages] = useState([]);

  function createAlbumPromise(albumName) {
    albumName = albumName.trim();
    if (!albumName) {
      return alert("Album names must contain at least one non-space character.");
    }
    if (albumName.indexOf("/") !== -1) {
      return alert("Album names cannot contain slashes.");
    }
    var albumKey = encodeURIComponent(albumName) + "/";
    // props.s3.headObject({ Key: albumKey }, function(err, data) {
    //   if (!err) {
    //     return alert("Album already exists.");
    //   }
    //   if (err.code !== "NotFound") {
    //     return alert("There was an error creating your album: " + err.message);
    //   }
    //   props.s3.putObject({ Key: albumKey }, function(err, data) {
    //     if (err) {
    //       return alert("There was an error creating your album: " + err.message);
    //     }
    //     console.log("success creating album", albumName);
    //   });
    // });
    let headobjectPromise = props.s3.headObject({ Key: albumKey }).promise();
    headobjectPromise.then((data) => {
      console.log("object already exists: ", data);
    }).catch((err) => {
      return props.s3.putObject({ Key: albumKey }).promise();
    })
  }
  
  function addPhotoPromise(albumName, image) {
    var file = image;
    console.log("file", file);
    var fileName = file.name;
    var albumPhotosKey = encodeURIComponent(albumName) + "/";
  
    var photoKey = albumPhotosKey + fileName;
  
    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: "albums-tara",
        Key: photoKey,
        Body: file,
        ACL: "public-read"
      }
    });
    return upload.promise();;
  }
  
  function deleteAlbum(albumName) {
    console.log("in delete album");
    var albumKey = encodeURIComponent(albumName) + "/";
    props.s3.listObjects({ Prefix: albumKey }, function(err, data) {
      if (err) {
        return alert("There was an error deleting your album: ", err.message);
      }
      var objects = data.Contents.map(function(object) {
        return { Key: object.Key };
      });
      props.s3.deleteObjects(
        {
          Delete: { Objects: objects, Quiet: true }
        },
        function(err, data) {
          if (err) {
            return alert("There was an error deleting your album: ", err.message);
          }
          console.log("Successfully deleted album.", albumName);
        }
      );
    });
  }
  
  function bigBoy(newAlbums, oldAlbumNames) {
    newAlbums.forEach((album) => {
      if (album.oldName === "new") {
        // TODO: upload album and contents
        let promises = [createAlbumPromise(album.name)];
        album.images.forEach((image) => {
          promises.push(addPhotoPromise(album.name, image));
        })
        Promise.all(promises).then(() => {
          console.log("new album created, photos uploaded");
        }).catch((err) => {
          console.log("an error occured creating your album and uploading images: ", err.message);
        })
      } else {
        // check if album existed and was renamed
        for (var i = 0; i < oldAlbumNames.length; i++) {
          if (oldAlbumNames[i] === album.oldName && oldAlbumNames[i] !== album.name) {
            // TODO: copy and rename objects
            console.log("album already exists but was renamed", album.name, album.oldName);
            break;  
          }
        }
        // TODO: handle content change
        // requirements: All album 
      }
    });
  }

    return (
      <div className="App">
        <div className="container">
          {addModal && (<AddModal albums={albums} updateAlbums={updateAlbums} showAddModal={showAddModal}/>)}
          {editModal && (<EditModal albums={albums} updateAlbums={updateAlbums} editName={editName} setEditName={setEditName} editImages={editImages} setEditImages={setEditImages} showEditModal={showEditModal}/>)}
          <div className="controls">
            <button onClick={() => showAddModal(true)}> Add </button>
            <button onClick={() => bigBoy(albums, props.oldAlbumNames)}> Save </button>
          </div>
          <div className="content">
            <DnD albums={albums} updateAlbums={updateAlbums} showEditModal={showEditModal} setEditName={setEditName} setEditImages={setEditImages}/>
          </div>
        </div>
      </div>
    );
}

export default App;
