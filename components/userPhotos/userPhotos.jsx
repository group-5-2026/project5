import React from 'react';
import {
  Button, TextField,
  ImageList, ImageListItem, Typography
} from '@mui/material';
import axios from 'axios'; // Replace fetchModel import with axios
import './userPhotos.css';

/**
 * Define UserPhotos, a React component of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: undefined,
      photos: [],
      error: null
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
    // 1. Fetch User Info (to update the TopBar/MainContent title)
    axios.get(`http://localhost:3001/user/${user_id}`)
      .then((userResponse) => {
        const user = userResponse.data;
        const main_content = `User Photos for ${user.first_name} ${user.last_name}`;
        
        if (typeof this.props.changeMainContent === "function") {
          this.props.changeMainContent(main_content);
        }
      })
      .catch((err) => console.error("Error fetching user for header:", err));

    // 2. Fetch Photos using the new endpoint
    axios.get(`http://localhost:3001/photosOfUser/${user_id}`)
      .then((photoResponse) => {
        this.setState({
          user_id: user_id,
          photos: photoResponse.data,
          error: null
        });
      })
      .catch((err) => {
        console.error("Error fetching photos:", err);
        this.setState({ 
          user_id: user_id, 
          photos: [], 
          error: "No photos found for this user" 
        });
      });
  }

  render() {
    if (this.state.error) {
      return <Typography sx={{ m: 2 }} color="error">{this.state.error}</Typography>;
    }

// Inside your render return...
return this.state.user_id ? (
  <div className="user-photos-view"> {/* Added Class */}
    <div>
      <Button variant="contained" component="a" href={"#/users/" + this.state.user_id}>
        User Detail
      </Button>
    </div>
    
    <ImageList variant="masonry" cols={1} gap={24}>
      {this.state.photos.map((item) => (
        <div key={item._id} className="photo-card"> {/* Added Class */}
          <TextField 
            label="Photo Date" variant="outlined" disabled fullWidth margin="normal"
            value={item.date_time} 
          />
          
          <ImageListItem key={item.file_name}>
            <img
              src={`http://localhost:3001/images/${item.file_name}`}
              alt={item.file_name}
              loading="lazy"
            />
          </ImageListItem>

          {item.comments ? (
            item.comments.map((comment) => (
              <div key={comment._id} className="comment-block"> {/* Added Class */}
                <TextField label="Comment Date" variant="outlined" disabled fullWidth
                           margin="normal" value={comment.date_time} size="small" />
                <TextField label="User" variant="outlined" disabled fullWidth
                           margin="normal" value={comment.user.first_name + " " + comment.user.last_name}
                           component="a" href={"#/users/" + comment.user._id} size="small" />
                <TextField label="Comment" variant="outlined" disabled fullWidth
                           margin="normal" multiline rows={2} value={comment.comment} size="small" />
              </div>
            ))
          ) : (
            <TextField label="No Comments" variant="outlined" disabled fullWidth margin="normal" />
          )}
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
