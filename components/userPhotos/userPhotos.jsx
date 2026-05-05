import React from 'react';
import {
  Button, TextField,
  ImageList, ImageListItem, Typography
} from '@mui/material';
import axios from 'axios';
import './userPhotos.css';

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: undefined,
      photos: [],
      error: null,
      commentTexts: {}
    };
  }

  componentDidMount() {
    const new_user_id = this.props.match.params.userId;
    this.handleUserChange(new_user_id);
  }

  componentDidUpdate() {
    const new_user_id = this.props.match.params.userId;
    const current_user_id = this.state.user_id;
    if (current_user_id !== new_user_id) {
      this.handleUserChange(new_user_id);
    }
  }

  handleUserChange(user_id) {
    axios.get(`http://localhost:3001/user/${user_id}`)
      .then((userResponse) => {
        const user = userResponse.data;
        const main_content = `User Photos for ${user.first_name} ${user.last_name}`;

        if (typeof this.props.changeMainContent === "function") {
          this.props.changeMainContent(main_content);
        }
      })
      .catch((err) => console.error("Error fetching user:", err));

    axios.get(`http://localhost:3001/photosOfUser/${user_id}`)
      .then((photoResponse) => {
        this.setState({
          user_id,
          photos: photoResponse.data,
          error: null
        });
      })
      .catch((err) => {
        console.error("Error fetching photos:", err);
        this.setState({
          user_id,
          photos: [],
          error: "No photos found for this user"
        });
      });
  }

  handleCommentChange = (photoId, value) => {
    this.setState((prevState) => ({
      commentTexts: {
        ...prevState.commentTexts,
        [photoId]: value
      }
    }));
  };

  handleSubmitComment = (photoId) => {
    const comment = this.state.commentTexts[photoId];
    if (!comment || comment.trim() === "") return;

    axios.post(
      `http://localhost:3001/commentsOfPhoto/${photoId}`,
      { comment }
    )
    .then(() => {
      return axios.get(
        `http://localhost:3001/photosOfUser/${this.state.user_id}`
      );
    })
    .then((response) => {
      this.setState((prevState) => ({
        photos: response.data,
        commentTexts: {
          ...prevState.commentTexts,
          [photoId]: ""
        }
      }));
    })
    .catch((err) => {
      console.error("Error posting comment:", err);
    });
  };

  // ✅ FAVORITE HANDLER
  handleFavorite = (photoId) => {
    axios.post(`http://localhost:3001/photos/${photoId}/favorite`)
      .then(() => {
        return axios.get(
          `http://localhost:3001/photosOfUser/${this.state.user_id}`
        );
      })
      .then((response) => {
        this.setState({
          photos: response.data
        });
      })
      .catch((err) => {
        console.error("Error favoriting photo:", err);
      });
  };

  render() {
    if (this.state.error) {
      return (
        <Typography sx={{ m: 2 }} color="error">
          {this.state.error}
        </Typography>
      );
    }

    return this.state.user_id ? (
      <div className="user-photos-view">

        <div>
          <Button
            variant="contained"
            component="a"
            href={"#/users/" + this.state.user_id}
          >
            User Detail
          </Button>
        </div>

        <ImageList variant="masonry" cols={1} gap={24}>
          {this.state.photos.map((item) => (
            <div key={item._id} className="photo-card">

              <TextField
                label="Photo Date"
                variant="outlined"
                disabled
                fullWidth
                margin="normal"
                value={item.date_time}
              />

              <ImageListItem>
                <img
                  src={`http://localhost:3001/images/${item.file_name}`}
                  alt={item.file_name}
                  loading="lazy"
                />
              </ImageListItem>

              {/* ✅ FAVORITE BUTTON */}
              <Button
                variant="contained"
                disabled={item.isFavorited}
                onClick={() => this.handleFavorite(item._id)}
                sx={{ mt: 1, mb: 2 }}
              >
                {item.isFavorited ? "Favorited" : "Favorite"}
              </Button>

              {/* COMMENTS */}
              {item.comments && item.comments.length > 0 ? (
                item.comments.map((comment) => (
                  <div key={comment._id} className="comment-block">

                    <TextField
                      label="Comment Date"
                      variant="outlined"
                      disabled
                      fullWidth
                      margin="normal"
                      value={comment.date_time}
                      size="small"
                    />

                    <TextField
                      label="User"
                      variant="outlined"
                      disabled
                      fullWidth
                      margin="normal"
                      value={
                        comment.user.first_name +
                        " " +
                        comment.user.last_name
                      }
                      component="a"
                      href={"#/users/" + comment.user._id}
                      size="small"
                    />

                    <TextField
                      label="Comment"
                      variant="outlined"
                      disabled
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                      value={comment.comment}
                      size="small"
                    />
                  </div>
                ))
              ) : (
                <TextField
                  label="No Comments"
                  variant="outlined"
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}

              <TextField
                label="Add Comment"
                variant="outlined"
                fullWidth
                margin="normal"
                value={this.state.commentTexts[item._id] || ""}
                onChange={(e) =>
                  this.handleCommentChange(item._id, e.target.value)
                }
              />

              <Button
                variant="contained"
                onClick={() =>
                  this.handleSubmitComment(item._id)
                }
              >
                Submit Comment
              </Button>

            </div>
          ))}
        </ImageList>

      </div>
    ) : (
      <div />
    );
  }
}

export default UserPhotos;
