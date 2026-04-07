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
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // Fetch users from the model
    const users = window.models.userListModel();

    return (
      <div>
        {/* Optional header */}
        <Typography variant="h6" sx={{ padding: '10px' }}>
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
