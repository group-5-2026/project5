import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@mui/material';
import { withRouter } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: undefined,
      contextText: ''
    };
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    this.handleAppInfoChange();
    this.handleContextChange();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.handleContextChange();
    }
  }

  handleAppInfoChange = () => {
    fetchModel('/test/info')
      .then((response) => {
        this.setState({ app_info: response.data });
      })
      .catch((err) => {
        console.error('Error fetching app info:', err);
      });
  };

  handleContextChange = () => {
    const path = this.props.location.pathname;
    const parts = path.split('/');
    const userId = parts[2];

    if (!userId) {
      this.setState({ contextText: '' });
      return;
    }

    fetchModel(`/user/${userId}`)
      .then((response) => {
        const user = response.data;

        if (path.startsWith('/photos/')) {
          this.setState({
            contextText: `Photos of ${user.first_name} ${user.last_name}`
          });
        } else if (path.startsWith('/users/')) {
          this.setState({
            contextText: `${user.first_name} ${user.last_name}`
          });
        }
      })
      .catch(() => {
        this.setState({ contextText: '' });
      });
  };

  handleAddPhotoClick = () => {
    this.fileInputRef.current.click();
  };

  handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('uploadedphoto', file);

    fetch('/photos/new', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Upload Failed');
        }
        return res.json();
      })
      .then(() => {
        console.log('Photo uploaded successfully');
      })
      .catch((err) => {
        console.error('Error uploading photo:', err);
      });
  };

  render() {
    const { contextText, app_info } = this.state;
    const isLoggedIn = app_info !== undefined;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Nick Weigelt
          </Typography>

          <Typography variant="h6" sx={{ marginRight: 2 }}>
            {contextText}
          </Typography>

          {isLoggedIn && (
            <>
              <Button
                color="inherit"
                onClick={() => this.props.history.push('/favorites')}
              >
                Favorites
              </Button>

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