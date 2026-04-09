import React from 'react';
import { Typography, Button } from '@mui/material';
import axios from 'axios'; // Import Axios
import './userDetail.css';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null // Added to handle error states
    };
  }

  // Helper method to fetch user data to keep code DRY
  fetchUserData(userId) {
  axios.get(`http://localhost:3001/user/${userId}`) // Change 3000 to 3001
    .then((response) => {
      this.setState({ user: response.data, error: null });
    })
    .catch((err) => {
      console.error("Axios Error:", err);
      this.setState({ error: "User not found or server error" });
    });
}

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.fetchUserData(userId);
  }

  componentDidUpdate(prevProps) {
    const prevUserId = prevProps.match.params.userId;
    const currentUserId = this.props.match.params.userId;

    // Only fetch if the userId in the URL has actually changed
    if (prevUserId !== currentUserId) {
      this.fetchUserData(currentUserId);
    }
  }

  render() {
    const { user, error } = this.state;

    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    if (!user) {
      return <Typography>Loading user details...</Typography>;
    }

    return (
      <div className="user-detail-container">
        <Typography variant="h4">
          {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="body1">
          <strong>Location:</strong> {user.location}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {user.description}
        </Typography>
        <Typography variant="body1">
          <strong>Occupation:</strong> {user.occupation}
        </Typography>
        
        <Button 
          variant="contained" 
          component="a" 
          href={`#/photos/${user._id}`}
          style={{ marginTop: '16px' }}
        >
          View Photos
        </Button>
      </div>
    );
  }
}

export default UserDetail;
