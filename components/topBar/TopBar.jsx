import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import fetchModel from "../../lib/fetchModelData";
import { withRouter } from "react-router-dom";


/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: undefined
    };
  }

  componentDidMount() {
    this.handleAppInfoChange();
  }

  handleAppInfoChange() {
    const app_info = this.state.app_info;
    if(app_info === undefined){
      fetchModel("/test/info")
      .then((response) =>
        {
          this.setState({
            app_info: response.data
          });
        });
    }
  }
  render() {
    const path = this.props.location.pathname;
    let contextText = "";

    const parts = path.split("/");
    const userId = parts[2];

    if (userId) {
      const user = window.models.userModel(userId);
    if (user) {
      if (path.startsWith("/photos/")) {
        contextText = `Photos of ${user.first_name} ${user.last_name}`;
      } else if (path.startsWith("/users/")){
        contextText = `${user.first_name} ${user.last_name}`;
      }
    }
    }
    return ( <AppBar className="topbar-appBar" position="absolute">
            <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>Nick Weigelt</Typography>
              <Typography variant="h5" color="inherit"> {contextText} </Typography>
            </Toolbar>
            </AppBar>
            );
  }

}
export default withRouter(TopBar);

