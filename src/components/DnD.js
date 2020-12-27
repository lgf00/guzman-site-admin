import React, { Component, PureComponent } from 'react';
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

    editAlbum(name, images, e) {
        this.props.setEditName(name);
        this.props.setEditImages(images);
        this.props.showEditModal(true);
    }

    getItemStyle = (isDragging, draggableStyle) => ({
        background: '#111111',    
        // change background colour if dragging
        border: isDragging ? "1px solid white" : "none",
      
        // styles we need to apply on draggables
        ...draggableStyle
      });

    render() {
        return (
            <div>
                <DragDropContext onDragEnd={(r) => this.handleOnDragEnd(this.props, r)}>
                    <Droppable droppableId="albums">
                        {(provided) => (
                            <ul className="albums" {...provided.droppableProps} ref={provided.innerRef}>
                                {this.props.albums.map(({ name, images }, index) => {
                                    return (
                                        <Draggable key={name} draggableId={name} index={index}>
                                            {(provided, snapshot) => (
                                                <li {...provided.draggableProps} 
                                                {...provided.dragHandleProps} 
                                                ref={provided.innerRef}
                                                style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                                                    <div className="li-col1">
                                                        <p>{name}</p>
                                                        <div className="images">
                                                            <AlbumDisplay album={images}/>
                                                        </div>
                                                    </div>
                                                    <div className="li-col2">
                                                        <button onClick={(e) => this.editAlbum(name, images, e)}>Edit</button>
                                                        <button onClick={(e) => this.deleteAlbum(name, e)}>Delete</button>
                                                    </div>
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
            </div>
        );
    }
}

class AlbumDisplay extends PureComponent {
    render() {
        //let album = this.props.album;
        // if (album.length > 4) {
        //     album = album.slice(0, 5);
        // }
        return(
            this.props.album.map(file => {
                return (
                    <div className="image" style={{ backgroundImage: 'url(' + URL.createObjectURL(file) + ')' }} key={file.name}>
                    </div>
                );
            })
        );
    }
}

export default DnD;