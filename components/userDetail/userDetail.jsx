import React from 'react';
import { Typography, Button } from '@mui/material';
import './userDetail.css';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }
  componentDidUpdate(prevProps) {
  const prevUserId = prevProps.match.params.userId;
  const currentUserId = this.props.match.params.userId;

  if (prevUserId !== currentUserId) {
    const user = window.models.userModel(currentUserId);
    this.setState({ user });
  }
}

  componentDidMount() {
    const userId = this.props.match.params.userId;
    const user = window.models.userModel(userId);
    this.setState({ user });
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return <Typography>Loading...</Typography>;
    }

    return (
      <div>
        <Typography variant="h4">
          {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="body1">
          Location: {user.location}
        </Typography>
        <Typography variant="body1">
          Description: {user.description}
        </Typography>
        <Typography variant="body1">
          Occupation: {user.occupation}
        </Typography>
        <Button variant="contained" component="a" href={"#/photos/" + user._id}>
        View Photos
        </Button>
      </div>
    );
  }
}


export default UserDetail;
