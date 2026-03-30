import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import './userDetail.css';
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined
        };
    }

    componentDidMount() {
        const newUserId = this.props.match.params.userId;
        this.handleUserChange(newUserId);
    }

    componentDidUpdate(prevProps) {
        const newUserId = this.props.match.params.userId;
        const currentUserId = this.state.user?._id;

        if (currentUserId !== newUserId) {
            this.handleUserChange(newUserId);
        }
    }

    handleUserChange(userId) {
        fetchModel(`/user/${userId}`)
            .then((response) => {
                const newUser = response.data;
                this.setState({ user: newUser });

                // Escape apostrophe in JSX string just in case
                const mainContent = `User Details for ${newUser.first_name} ${newUser.last_name}`;
                this.props.changeMainContent(mainContent);
            })
            .catch((err) => {
                console.error("Error fetching user:", err);
            });
    }

    render() {
        const { user } = this.state;

        if (!user) return <div />;

        return (
            <Box component="form" noValidate autoComplete="off">
                <Box mb={2}>
                    <Button
                        variant="contained"
                        component="a"
                        href={`#/photos/${user._id}`}
                    >
                        User Photos
                    </Button>
                </Box>

                <TextField
                    id="first_name"
                    label="First Name"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    value={user.first_name}
                />

                <TextField
                    id="last_name"
                    label="Last Name"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    value={user.last_name}
                />

                <TextField
                    id="location"
                    label="Location"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    value={user.location}
                />

                <TextField
                    id="description"
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    disabled
                    fullWidth
                    margin="normal"
                    value={user.description}
                />

                <TextField
                    id="occupation"
                    label="Occupation"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    value={user.occupation}
                />
            </Box>
        );
    }
}

export default UserDetail;
