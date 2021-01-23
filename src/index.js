import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AWS from 'aws-sdk';

var oldAlbums =[];
var formattedAlbums = [];
var oldAlbumNames = [];

var albumBucketName = "albums-tara";

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:d79f18a6-2e1e-4a82-b459-dbf36f29713f',
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

console.log("s3", s3);

var promises = [];
var promise = s3.listObjects({ Delimiter: "/" }).promise();
promise.then(function (data) {
  data.CommonPrefixes.forEach((commonPrefix) => {
    var prefix = commonPrefix.Prefix;
    var albumName = decodeURIComponent(prefix.replace("/", ""));
    oldAlbumNames.push(albumName);
  });
  oldAlbumNames.forEach((album) => {
    var albumPhotosKey = encodeURIComponent(album) + "/";
    var listObjectsPromise = s3.listObjects({ Prefix: albumPhotosKey }).promise();
    promises.push(
      listObjectsPromise.then(function (data) {
        var href = "https://s3.amazonaws.com/" //this.request.httpRequest.endpoint.href;
        var bucketUrl = href + albumBucketName + "/";
        var images = [];
        let modifiedData = Array.from(data.Contents);
        modifiedData.splice(0, 1);
        modifiedData.forEach((photo) => {
          var photoKey = photo.Key;
          console.log("photokey", photoKey);
          var photoUrl = bucketUrl + encodeURIComponent(photoKey);
          console.log("photoURL", photoUrl);
          images.push(photoUrl);
        });
        formattedAlbums.push({
          name: album,
          images: images,
          oldName: album,
        });
        oldAlbums.push({
          name: album,
          contents: modifiedData,
        })
      }).catch(function (err) {
        console.log("There was an error viewing your album: " + err.message);
      })
    );
    Promise.all(promises).then(() => {
      console.log("formattedAlbums", formattedAlbums);
      console.log("oldAlbums", oldAlbums);
      ReactDOM.render(
        <React.StrictMode>
          <App albums={formattedAlbums} s3={s3} oldAlbumNames={oldAlbumNames} oldAlbums={oldAlbums}/>
        </React.StrictMode>,
        document.getElementById('root')
      );
    });
  });
}).catch(function(err) {
  console.log("There was an error listing your albums: " + err.message);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
