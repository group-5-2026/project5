import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      error: null
    };
  }

  componentDidMount() {
    // Fetch users from the Express server
    axios.get('http://localhost:3001/user/list')
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((err) => {
        console.error("Error fetching user list:", err);
        this.setState({ error: "Failed to load user list" });
      });
  }

  render() {
    const { users, error } = this.state;

    if (error) {
      return <Typography color="error" sx={{ p: 2 }}>{error}</Typography>;
    }

    if (users.length === 0) {
      return <Typography sx={{ p: 2 }}>Loading users...</Typography>;
    }

    return (
      <div>
        <Typography variant="h6" className="user-list-title" sx={{padding: '15px' }}>
          Users
        </Typography>

        <List component="nav">
          {users.map((user) => (
            <React.Fragment key={user._id}>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/users/${user._id}`}
                >
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
