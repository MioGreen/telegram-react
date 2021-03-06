/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    IconButton
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import MainMenuButton from './MainMenuButton';
import { debounce, isAuthorizationReady, throttle } from '../../Utils/Common';
import ApplicationStore from '../../Stores/ApplicationStore';
import TdLibController from '../../Controllers/TdLibController';
import '../ColumnMiddle/Header.css';

const styles = {
    headerIconButton: {
        margin: '8px 12px 8px 0'
    }
};

class DialogsHeader extends React.Component {
    constructor(props) {
        super(props);

        this.searchInput = React.createRef();

        this.state = {
            authorizationState: ApplicationStore.getAuthorizationState(),
            open: false
        };

        this.handleInput = debounce(this.handleInput, 250);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.openSearch
            && this.props.openSearch !== prevProps.openSearch) {
            setTimeout(() => {
                if (this.searchInput.current){
                    this.searchInput.current.focus();
                }
            }, 250);
        }
    }

    componentDidMount(){
        ApplicationStore.on('updateAuthorizationState', this.onUpdateAuthorizationState);
    }

    componentWillUnmount(){
        ApplicationStore.removeListener('updateAuthorizationState', this.onUpdateAuthorizationState);
    }

    onUpdateAuthorizationState = (update) => {
        this.setState({ authorizationState: update.authorization_state });
    };

    handleLogOut = () => {
        this.setState({ open: true });
    };

    handleDone = () => {
        this.handleClose();
        TdLibController.logOut();
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleSearch = () => {
        const { onSearch, openSearch } = this.props;
        const { authorizationState } = this.state;
        if (!isAuthorizationReady(authorizationState)) return;

        onSearch(!openSearch);
    };

    handleKeyDown = () => {

    };

    handleKeyUp = () => {

    };

    handleInput = () => {
        const innerText = this.searchInput.current.innerText;
        const innerHTML = this.searchInput.current.innerHTML;

        if (innerText && innerText === '\n'
            && innerHTML && (innerHTML === '<br>' || innerHTML === '<div><br></div>')){
            this.searchInput.current.innerHTML = '';
        }

        ApplicationStore.emit('clientUpdateSearchText', { text: innerText });
    };

    render() {
        const { classes, onClick, openSearch } = this.props;
        const { open } = this.state;

        const confirmLogoutDialog = open ? (
            <Dialog
                open={open}
                onClose={this.handleClose}
                aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>Telegram</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={this.handleDone} color='primary'>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        ) : null;

        return (
            <div className='header-master'>
                {   !openSearch
                    ? <>
                        <MainMenuButton onLogOut={this.handleLogOut} />
                        { confirmLogoutDialog }
                        <div className='header-status grow cursor-pointer' onClick={onClick}>
                            <span className='header-status-content'>Telegram</span>
                        </div>
                    </>
                    : <>
                        <div className='header-search-input grow'>
                            <div
                                id='header-search-inputbox'
                                ref={this.searchInput}
                                placeholder='Search'
                                key={Date()}
                                contentEditable
                                suppressContentEditableWarning
                                onKeyDown={this.handleKeyDown}
                                onKeyUp={this.handleKeyUp}
                                onInput={this.handleInput}>
                            </div>
                        </div>
                    </>
                }
                <IconButton
                    className={classes.headerIconButton}
                    aria-label='Search'
                    onMouseDown={this.handleSearch}>
                    { openSearch ? <CloseIcon/> : <SearchIcon/> }
                </IconButton>
            </div>
        );
    }
}

DialogsHeader.propTypes = {
    openSearch: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    onSearchTextChange: PropTypes.func.isRequired
};

export default withStyles(styles)(DialogsHeader);
