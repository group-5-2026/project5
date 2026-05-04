import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@mui/material';

import { withRouter } from 'react-router-dom';
//import async from 'async';
import fetchModel from '../../lib/fetchModelData';
import './TopBar.css';




/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: undefined
    };
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    this.handleAppInfoChange();
  }

  handleAppInfoChange() {
    if(this.state.app_info === undefined){
      fetchModel("/test/info")
      .then((response) =>
        {
          this.setState({
            app_info: response.data
          });
        });
    }
  }

  handleAddPhotoClick = () => {
    this.fileInputRef.current.click();
  };

  handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    fetch("/photos/new", {
      method: "POST",
      body: formData,
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Upload Failed");
        }
        return res.json();
      })
      .then(() => {
        alert("Photo uploaded successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error uploading photo");
      });
  };

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

    const isLoggedIn = this.state.app_info?.loggedIn;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Nick Weigelt
          </Typography>

          <Typography variant="h6" sx={{ marginRight: 2}}>
            {contextText}
          </Typography>

          {isLoggedIn && (
            <>
              <Button
                color="inherit"
                variant="outlined"
                onClick={this.handleAddPhotoClick}
              >
                Add Photo
              </Button>
              
              <input
                type="file"
                hidden
                ref={this.fileInputRef}
                onChange={this.handleFileChange}
              />
            </>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}
export default withRouter(TopBar);
