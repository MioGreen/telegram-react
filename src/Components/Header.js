import React, {Component} from 'react';
import './Header.css';
import ChatStore from '../Stores/ChatStore';
import UserStore from '../Stores/UserStore';
import BasicGroupStore from '../Stores/BasicGroupStore';
import SupergroupStore from '../Stores/SupergroupStore';
import TdLibController from '../Controllers/TdLibController';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import {getChatSubtitle, isAccentChatSubtitle} from '../Utils/Chat';

const styles = {
    button : {
        margin: '14px',
    },
    menuIconButton : {
        margin: '8px -2px 8px 12px',
    },
    searchIconButton : {
        margin: '8px 12px 8px 0',
    },
    messageSearchIconButton : {
        margin: '8px 0 8px 12px',
    },
    moreIconButton : {
        margin: '8px 12px 8px 0',
    }
};

class Header extends Component{

    constructor(props){
        super(props);

        this.state = {
            authorizationState: TdLibController.getState(),
            connectionState : '',
            open: false,
            anchorEl: null
        };

        this.onAuthorizationStatusUpdated = this.onAuthorizationStatusUpdated.bind(this);
        this.onConnectionStateUpdated = this.onConnectionStateUpdated.bind(this);
        this.onUpdateChatTitle = this.onUpdateChatTitle.bind(this);
        this.onUpdateUserStatus = this.onUpdateUserStatus.bind(this);
        this.onUpdateUserChatAction = this.onUpdateUserChatAction.bind(this);
        this.onUpdateBasicGroup = this.onUpdateBasicGroup.bind(this);
        this.onUpdateSupergroup = this.onUpdateSupergroup.bind(this);
        this.onUpdateBasicGroupFullInfo = this.onUpdateBasicGroupFullInfo.bind(this);
        this.onUpdateSupergroupFullInfo = this.onUpdateSupergroupFullInfo.bind(this);
        this.onUpdateUserFullInfo = this.onUpdateUserFullInfo.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleDone = this.handleDone.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
        this.handleClearCache = this.handleClearCache.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState){
        if (nextState !== this.state){
            return true;
        }
        if (nextProps.selectedChat !== this.props.selectedChat){
            return true;
        }

        return false;
    }

    componentDidMount(){
        TdLibController.on('tdlib_status', this.onAuthorizationStatusUpdated);
        TdLibController.on('tdlib_connection_state', this.onConnectionStateUpdated);

        ChatStore.on('updateChatTitle', this.onUpdateChatTitle);
        UserStore.on('updateUserStatus', this.onUpdateUserStatus);
        ChatStore.on('updateUserChatAction', this.onUpdateUserChatAction);
        UserStore.on('updateUserFullInfo', this.onUpdateUserFullInfo);
        BasicGroupStore.on('updateBasicGroup', this.onUpdateBasicGroup);
        BasicGroupStore.on('updateSupergroup', this.onUpdateSupergroup);
        BasicGroupStore.on('updateBasicGroupFullInfo', this.onUpdateBasicGroupFullInfo);
        SupergroupStore.on('updateSupergroupFullInfo', this.onUpdateSupergroupFullInfo);
    }

    componentWillUnmount(){
        TdLibController.removeListener('tdlib_status', this.onAuthorizationStatusUpdated);
        TdLibController.removeListener('tdlib_connection_state', this.onConnectionStateUpdated);

        ChatStore.removeListener('updateChatTitle', this.onUpdateChatTitle);
        UserStore.removeListener('updateUserStatus', this.onUpdateUserStatus);
        ChatStore.removeListener('updateUserChatAction', this.onUpdateUserChatAction);
        UserStore.removeListener('updateUserFullInfo', this.onUpdateUserFullInfo);
        SupergroupStore.removeListener('updateBasicGroup', this.onUpdateBasicGroup);
        SupergroupStore.removeListener('updateSupergroup', this.onUpdateSupergroup);
        SupergroupStore.removeListener('updateBasicGroupFullInfo', this.onUpdateBasicGroupFullInfo);
        SupergroupStore.removeListener('updateSupergroupFullInfo', this.onUpdateSupergroupFullInfo);
    }

    onConnectionStateUpdated(payload) {
        this.setState({ connectionState: payload});
    }

    onAuthorizationStatusUpdated(payload) {
        this.setState({ authorizationState: payload});
    }

    onUpdateChatTitle(update){
        const chat = this.props.selectedChat;
        if (!chat) return;
        if (chat.id !== update.chat_id) return;

        this.forceUpdate();
    }

    onUpdateUserStatus(update){
        const chat = this.props.selectedChat;
        if (!chat) return;
        if (!chat.type) return;

        switch (chat.type['@type']) {
            case 'chatTypeBasicGroup' : {
                const fullInfo = BasicGroupStore.getFullInfo(chat.type.basic_group_id);
                if (fullInfo && fullInfo.members) {
                    const member = fullInfo.members.find(x => x.user_id === update.user_id);
                    if (member) {
                        this.forceUpdate();
                    }
                }
                break;
            }
            case 'chatTypePrivate' : {
                if (chat.type.user_id === update.user_id) {
                    this.forceUpdate();
                }
                break;
            }
            case 'chatTypeSecret' : {
                if (chat.type.user_id === update.user_id) {
                    this.forceUpdate();
                }
                break;
            }
            case 'chatTypeSupergroup' : {
                break;
            }
        }
    }

    onUpdateUserChatAction(update){
        const chat = this.props.selectedChat;
        if (!chat) return;

        if (chat.id === update.chat_id){
            this.forceUpdate();
        }
    }

    onUpdateBasicGroup(update){
        const chat = this.props.selectedChat;
        if (!chat) return;

        if (chat.type
            && chat.type['@type'] === 'chatTypeBasicGroup'
            && chat.type.basic_group_id === update.basic_group.id){
            this.forceUpdate();
        }
    }

    onUpdateSupergroup(update){
        const chat = this.props.selectedChat;
        if (!chat) return;

        if (chat.type
            && chat.type['@type'] === 'chatTypeSupergroup'
            && chat.type.supergroup_id === update.supergroup.id){
            this.forceUpdate();
        }
    }

    onUpdateBasicGroupFullInfo(update){
        const chat = this.props.selectedChat;
        if (!chat) return;

        if (chat.type
            && chat.type['@type'] === 'chatTypeBasicGroup'
            && chat.type.basic_group_id === update.basic_group_id){
            this.forceUpdate();
        }
    }

    onUpdateSupergroupFullInfo(update){
        const chat = this.props.selectedChat;
        if (!chat) return;

        if (chat.type
            && chat.type['@type'] === 'chatTypeSupergroup'
            && chat.type.supergroup_id === update.supergroup_id){
            this.forceUpdate();
        }
    }

    onUpdateUserFullInfo(update){
        const chat = this.props.selectedChat;
        if (!chat) return;

        if (chat.type
            && (chat.type['@type'] === 'chatTypePrivate' || chat.type['@type'] === 'chatTypeSecret')
            && chat.type.user_id === update.user_id){
            this.forceUpdate();
        }
    }

    handleMenuClick(event){
        this.setState({ anchorEl : event.currentTarget });
    }

    handleMenuClose(){
        this.setState({ anchorEl : null });
    }

    handleLogOut(){
        this.setState({ open: true });

        this.handleMenuClose();
    }

    handleClearCache(){
        this.props.onClearCache();

        this.handleMenuClose();
    }

    handleClose(){
        this.setState({ open: false });
    }

    handleDone(){
        this.setState({ open: false });
        TdLibController.logOut();
    }

    render(){
        const {classes} = this.props;
        const {anchorEl, authorizationState, connectionState} = this.state;
        const chat = this.props.selectedChat ? ChatStore.get(this.props.selectedChat.id) : null;

        let title = '';
        let titleProgressAnimation = (
            <React.Fragment>
                <span className='header-progress'>.</span>
                <span className='header-progress'>.</span>
                <span className='header-progress'>.</span>
            </React.Fragment>);
        let subtitle = '';
        let isAccentSubtitle = isAccentChatSubtitle(chat);
        if (authorizationState && authorizationState.status !== 'ready'){
            title = 'Loading';
        }
        else if (connectionState){
            switch (connectionState['@type'] ){
                case 'connectionStateUpdating':
                    title = 'Updating';
                    break;
                case 'connectionStateConnecting':
                    title = 'Connecting';
                    break;
                case 'connectionStateReady':
                    break;
            }
        }

        if (title === ''){
            titleProgressAnimation = null;

            if (chat){
                title = chat.title || 'Deleted account';
                subtitle = getChatSubtitle(chat);
            }
        }

        const mainMenuControl = authorizationState && authorizationState.status === 'ready'
            ? (<Menu
                id='simple-menu'
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={this.handleMenuClose}>
                <MenuItem onClick={this.handleClearCache}>Clear cache</MenuItem>
                <MenuItem onClick={this.handleLogOut}>Log out</MenuItem>
            </Menu>)
            : null;

        const confirmLogoutDialog = this.state.open?
            (<Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Telegram</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleDone} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>)
            : null;


        return (
            <div className='header-wrapper'>
                <div className='header-master'>
                    <IconButton
                        aria-owns={anchorEl ? 'simple-menu' : null}
                        aria-haspopup='true'
                        className={classes.menuIconButton}
                        aria-label='Menu'
                        onClick={this.handleMenuClick}>
                        <MenuIcon />
                    </IconButton>
                    { mainMenuControl }
                    { confirmLogoutDialog }
                    <div className='header-status grow cursor-default'>
                        <span className='header-status-content'>Telegram</span>
                    </div>
                    <IconButton className={classes.searchIconButton} aria-label="Search">
                        <SearchIcon />
                    </IconButton>
                </div>
                <div className='header-details'>
                    <div className='header-status grow cursor-default'>
                        <span className='header-status-content'>{title}</span>
                        {titleProgressAnimation}
                        <span className={isAccentSubtitle ? 'header-status-title-accent' : 'header-status-title'}>{subtitle}</span>
                    </div>
                    <IconButton className={classes.messageSearchIconButton} aria-label="Search">
                        <SearchIcon />
                    </IconButton>
                    <IconButton className={classes.moreIconButton} aria-label="More">
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Header);