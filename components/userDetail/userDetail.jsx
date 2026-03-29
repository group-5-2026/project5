import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  render() {
    const userId = this.props.match.params.userId;
    const user = window.models.userModel(userId);

    if (!user) {
      return (
        <Typography variant="body1">
          User not found.
        </Typography>
      );
    }

    return (
      <div className="user-detail">
        <Typography variant="h4" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>

        <Typography variant="body1">
          <strong>First Name:</strong> {user.first_name}
        </Typography>

        <Typography variant="body1">
          <strong>Last Name:</strong> {user.last_name}
        </Typography>

        <Typography variant="body1">
          <strong>Location:</strong> {user.location}
        </Typography>

        <Typography variant="body1">
          <strong>Occupation:</strong> {user.occupation}
        </Typography>

        <Typography variant="body1">
          <strong>Description:</strong> {user.description}
        </Typography>

        <div className="photo-link-container">
          <Link to={`/photos/${user._id}`} className="photo-link">
            View {user.first_name}'s Photos
          </Link>
        </div>
      </div>
    );
  }
}

export default UserDetail;
