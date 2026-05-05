import React from 'react';
import { Typography, Button } from '@mui/material';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import './userDetail.css';

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null
    };
  }

  fetchUserData(userId) {
    if (!userId) return;

    axios.get(`/user/${userId}`)
      .then((response) => {
        this.setState({ user: response.data, error: null });
      })
      .catch((err) => {
        console.error("Axios Error:", err);
        this.setState({ error: "User not found or server error", user: null });
      });
  }

  componentDidMount() {
    const userId = this.props.match?.params?.userId;
    this.fetchUserData(userId);
  }

  componentDidUpdate(prevProps) {
    const prevUserId = prevProps.match?.params?.userId;
    const currentUserId = this.props.match?.params?.userId;

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

        <Typography><strong>Location:</strong> {user.location}</Typography>
        <Typography><strong>Description:</strong> {user.description}</Typography>
        <Typography><strong>Occupation:</strong> {user.occupation}</Typography>

        <Button
          variant="contained"
          href={`#/photos/${user._id}`}
          style={{ marginTop: '16px' }}
        >
          View Photos
        </Button>
      </div>
    );
  }
}

export default withRouter(UserDetail);