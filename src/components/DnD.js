import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

class DnD extends Component {
    handleOnDragEnd(props, result) {
        if (!result.destination) return;
        const items = Array.from(props.albums);
        const [reoarderItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reoarderItem);

        props.updateAlbums(items);
    }
    
    deleteAlbum(name, e) {
        const items = Array.from(this.props.albums)
        let index = items.map((album) => {
            return album.name;
        }).indexOf(name);
        items.splice(index, 1);
        this.props.updateAlbums(items);
    }

    render() {
        return (
            <DragDropContext onDragEnd={(r) => this.handleOnDragEnd(this.props, r)}>
                <Droppable droppableId="albums">
                    {(provided) => (
                        <ul className="albums" {...provided.droppableProps} ref={provided.innerRef}>
                            {this.props.albums.map(({ name, images }, index) => {
                                return (
                                    <Draggable key={name} draggableId={name} index={index}>
                                        {(provided) => (
                                            <li {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                                <p>{name}</p>
                                                <div className="images">
                                                    <AlbumDisplay album={images} />
                                                </div>
                                                <button>Edit</button>
                                                <button onClick={(e) => this.deleteAlbum(name, e)}>Delete</button>
                                            </li>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }
}

class AlbumDisplay extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.album === nextProps.album) {
            return false;
        } else {
            return true;
        }
    }

    render() {
        let album = this.props.album;
        if (album.length > 4) {
            album = album.slice(0, 5);
        }
        return(
            album.map(file => {
                return (
                    <div className="image" style={{ backgroundImage: 'url(' + URL.createObjectURL(file) + ')' }} key={file.name}>
                    </div>
                );
            })
        );
    }
}

export default DnD;