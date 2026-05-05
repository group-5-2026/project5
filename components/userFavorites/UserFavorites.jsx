import React from "react";
import {
  Typography,
  Modal,
  Box,
  Button,
  ImageList,
  ImageListItem
} from "@mui/material";
import "./UserFavorites.css";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  maxWidth: "90vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  outline: 0
};

class UserFavorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: [],
      openModal: false,
      activePhoto: null
    };
  }

  componentDidMount() {
    fetch("/favorites", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ favorites: data });
      })
      .catch((err) => console.error(err));
  }

  handleOpenModal = (photo) => {
    this.setState({
      openModal: true,
      activePhoto: photo
    });
  };

  handleCloseModal = () => {
    this.setState({
      openModal: false,
      activePhoto: null
    });
  };

  handleRemoveFavorite = (photoId) => {
    fetch(`/favorites/remove/${photoId}`, {
      method: "POST",
      credentials: "include"
    })
      .then((res) => {
        if (res.ok) {
          this.setState((prevState) => ({
            favorites: prevState.favorites.filter(
              (photo) => photo._id !== photoId
            )
          }));
        }
      })
      .catch((err) => console.error(err));
  };

  render() {
    return (
      <div className="favorites-container">
        <Typography variant="h4" gutterBottom>
          My Favorites
        </Typography>

        <ImageList cols={4} rowHeight={160}>
          {this.state.favorites.map((item) => (
            <ImageListItem key={item._id} className="favorite-item">

              <img
                src={`/images/${item.file_name}`}
                alt="Favorite"
                onClick={() => this.handleOpenModal(item)}
                className="favorite-thumb"
              />

              {/* REMOVE BUTTON (correct per-photo placement) */}
              <Button
                size="small"
                color="error"
                className="remove-btn"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  this.handleRemoveFavorite(item._id);
                }}
              >
                X
              </Button>

            </ImageListItem>
          ))}
        </ImageList>

        <Modal open={this.state.openModal} onClose={this.handleCloseModal}>
          <Box sx={modalStyle}>
            {this.state.activePhoto && (
              <div style={{ textAlign: "center" }}>
                <img
                  src={`/images/${this.state.activePhoto.file_name}`}
                  alt="Full view"
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />

                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Uploaded on: {this.state.activePhoto.date_time}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={this.handleCloseModal}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </div>
            )}
          </Box>
        </Modal>
      </div>
    );
  }
}

export default UserFavorites;