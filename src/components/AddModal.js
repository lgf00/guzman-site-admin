import React, { Component } from 'react';

class AddModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Album Name',
            images: [],
            noPreview: true,
            duplicateFound: false,
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const albums = this.props.albums;
        const newAlbum = {
            name: this.state.name,
            images: this.state.images,
            oldName: "new",
        }
        albums.push(newAlbum);
        this.props.updateAlbums(albums);
        this.props.showAddModal(false);
    }

    handleFileSelect = (e) => {
        this.setState({duplicateFound: false});
        const files = Array.from(e.target.files);
        let newImages = this.state.images;
        files.forEach(file => {
            let duplicate = false;
            newImages.forEach(image => {
                if (file.name === image.name) duplicate = true;
            })
            duplicate ? this.setState({duplicateFound: true}) : newImages.push(file);
        })
        this.setState({images: newImages, noPreview: false});
    }

    handleName = (e) => {
        this.setState({name: e.target.value});
    }

    render() {
        return(
            <div className="modal">
                <div className="modal-content">
                    <p> Add New Album </p>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <input type="text" placeholder={this.state.name} onChange={(e) => this.handleName(e)}/>
                        <br/>
                        <input type="file" accept="image/*" multiple onChange={(e) => this.handleFileSelect(e)}/>
                        <br/>
                        <DisplayFiles noPreview={this.state.noPreview} images={this.state.images}/>
                        {this.state.duplicateFound && (<p className="warning"> one or more files were already uploaded and have been skipped </p>)}
                        <input type="submit"/>
                    </form>
                </div>
            </div>
        );
    }
}

class DisplayFiles extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.noPreview === nextProps.noPreview) {
            return false;
        } else {
            return true;
        }
    }
    
    render() {
        return (
            <div className="preview">
                {this.props.noPreview && (<p> no files upload </p>)}
                {this.props.images.map((file) => {
                    return (
                        <div className="image" style={{ backgroundImage: 'url(' + URL.createObjectURL(file) + ')' }} key={file.size}>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default AddModal;