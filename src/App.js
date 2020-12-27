import React, { useState } from 'react';
import DnD from './components/DnD.js';
import AddModal from './components/AddModal.js';
import './App.css';
import EditModal from './components/EditModal.js';
import AWS from 'aws-sdk';

// TODO: GET from s3 bucket(?)
let finalAlbums = [];
let albumNames = [];

var albumBucketName = "albums-tara";
var bucketRegion = "us-east-1";
var IdentityPoolId = "us-east-1:d79f18a6-2e1e-4a82-b459-dbf36f29713f";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

async function getAlbumNames() {
  await s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      console.log(data);
      data.CommonPrefixes.forEach((commonPrefix) => {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace("/", ""));
        console.log(albumName);
        albumNames.push(albumName);
      });
      console.log("in getAlbumNames", albumNames);
    }
  }).promise();
}

async function getAlbumImages(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  await s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";
    let images = [];
    data.Contents.forEach((photo) => {
      var photoKey = photo.key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      images.push(photoUrl);
    });

    finalAlbums.push( {
      name: albumName,
      images: images
    })
  }).promise();
}

function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert("Album names must contain at least one non-space character.");
  }
  if (albumName.indexOf("/") !== -1) {
    return alert("Album names cannot contain slashes.");
  }
  var albumKey = encodeURIComponent(albumName) + "/" ;
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
    if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }
    s3.putObject({ Key: albumKey }, function(err, data) {
      if (err) {
        return alert("There was an error creating your album: " + err.message);
      }
      console.log("success creating album", albumName);
    });
  });
}

function addPhoto(albumName, image) {
  var file = image;
  console.log("file", file);
  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(albumName) + "/";

  var photoKey = albumPhotosKey + fileName;

  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file,
      ACL: "public-read"
    }
  });

  var promise = upload.promise();

  promise.then(
    function(data) {
      console.log("Successfully uploaded photo.");
    },
    function(err) {
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
}

function deleteAlbum(albumName) {
  console.log("in delete album");
  var albumKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumKey }, function(err, data) {
    if (err) {
      return alert("There was an error deleting your album: ", err.message);
    }
    var objects = data.Contents.map(function(object) {
      return { Key: object.Key };
    });
    s3.deleteObjects(
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

function bigBoy(newAlbums) {
  albumNames.forEach(album => {
    deleteAlbum(album);
  });
  console.log("new albums", newAlbums);
  newAlbums.forEach((album) => {
    createAlbum(album.name);
    console.log('in bigboy albums', album);
    album.images.forEach((image) => {
      console.log('in bigboy images', image);
      addPhoto(image);
    });
  });
}

function App() {
  getAlbumNames();
  albumNames.forEach((album) => {
    getAlbumImages(album);
  });
  console.log("albumNames", albumNames)
  console.log("finalAlbums", finalAlbums);
  
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
          <button onClick={() => showAddModal(true)}> Add </button>
          <button onClick={() => bigBoy(albums)}> Save </button>
        </div>
        <div className="content">
          <DnD albums={albums} updateAlbums={updateAlbums} showEditModal={showEditModal} setEditName={setEditName} setEditImages={setEditImages}/>
        </div>
      </div>
    </div>
  );
}

export default App;
