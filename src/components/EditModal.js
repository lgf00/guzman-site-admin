import React, { Component, PureComponent } from 'react';

class EditModal extends Component {
    constructor(props) {
        super(props);
        this.prevName = props.editName;
        this.state = {
            newName: props.editName,
            newImages: props.editImages,
            duplicateFound: false,
        }
        this.updateNewImages = this.updateNewImages.bind(this);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        let albums = Array.from(this.props.albums);
        let index = albums.map((album) => {
            return album.name;
        }).indexOf(this.prevName);
        albums[index] = {
            name: this.state.newName,
            images: this.state.newImages,
        }       
        this.props.updateAlbums(albums);
        this.props.showEditModal(false);
    }

    handleFileSelect = (e) => {
        this.setState({duplicateFound: false});
        const files = Array.from(e.target.files);
        let images = Array.from(this.state.newImages);
        files.forEach(file => {
            let duplicate = false;
            images.forEach(image => {
                if (file.name === image.name) duplicate = true;
            })
            duplicate ? this.setState({duplicateFound: true}) : images.push(file);
        })
        this.updateNewImages(images);
    }

    handleName = (e) => {
        this.setState({newName: e.target.value});
    }

    updateNewImages(newer) {
        this.setState({newImages: newer});
    }
    
    render() {
        return(
            <div className="modal">
                <div className="modal-content">
                    <p> Edit Album </p>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <input type="text" value={this.state.newName} onChange={(e) => this.handleName(e)}/>
                        <br/>
                        <input type="file" accept="image/*" multiple onChange={(e) => this.handleFileSelect(e)}/>
                        <br/>
                        <DisplayFiles images={this.state.newImages} newImages={this.state.newImages} updateNewImages={this.updateNewImages}/>
                        {this.state.duplicateFound && (<p className="warning"> one or more files were already uploaded and have been skipped </p>)}
                        <input type="submit" value="Save Changes"/>
                    </form>
                </div>
            </div>
        );
    }
}

class DisplayFiles extends PureComponent {
    handleDelete = (e, name) => {
        let images = Array.from(this.props.newImages);
        let index = images.map((image) => {
            return image.name;
        }).indexOf(name);
        images.splice(index, 1);
        this.props.updateNewImages(images);
    }

    render() {
        return (
            <div className="preview">
                {this.props.images.map((file) => {
                    return (
                        <div onClick={(e) => this.handleDelete(e, file.name)} className="image delete" style={{ backgroundImage: 'url(' + URL.createObjectURL(file) + ')' }} key={file.size}/>
                    );
                })}
            </div>
        );
    }
}

export default EditModal;