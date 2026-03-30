import { withRouter } from 'react-router-dom';
import React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
}
from '@mui/material';
import './userList.css';
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                users: undefined,
                user_id: undefined
            };
    }

    componentDidMount() {
        this.handleUserListChange();
    }

    componentDidUpdate() {
        const new_user_id = this.props.match?.params?.userId; // add the extra '?'
        //console.log(new_user_id);
        const current_user_id = this.state.user_id;
        //console.log(current_user_id);
        if (current_user_id  !== new_user_id){
            this.handleUserChange(new_user_id);
        }
    }

    handleUserChange(user_id){
        this.setState({
            user_id: user_id
        });
    }

    handleUserListChange(){
        fetchModel("/user/list")
            .then((response) =>
            {
                console.log("SIDEBAR DATA ARRIVED:", response); // ADD THIS LINE
                this.setState({
                    users: response.data
                });
            });
    }

  render() {
    return (
      <div>
        <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window.
          You might choose to use <a href="https://mui.com/components/lists/">Lists</a> and <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so:
        </Typography>
        <List component="nav">
          <ListItem>
            <ListItemText primary="Item #1" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Item #2" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Item #3" />
          </ListItem>
          <Divider />
        </List>
        <Typography variant="body1">
          The model comes in from window.models.userListModel()
        </Typography>
      </div>
    );
  }
}

export default withRouter(UserList);