import React from 'react';
import {
  Divider, List, ListItem, ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom';
import './userList.css';

/**
 * Define UserList, a React component of project #5.
 */
class UserList extends React.Component {
  render() {
    const users = window.models.userListModel();

    return (
      <List component="nav">
        {users.map((user, index) => (
          <div key={user._id}>
            <ListItem
              button
              component={Link}
              to={`/users/${user._id}`}
            >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            {index < users.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    );
  }
}

export default UserList;
    );
  }
}

export default UserList;
