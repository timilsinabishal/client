import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    withRouter,
    Link,
} from 'react-router-dom';
import { List } from '../../../public/components/View';
import {
    DropdownMenu,
    DropdownGroup,
} from '../../../public/components/Action';
import { SelectInput } from '../../../public/components/Input';
import {
    isTruthy,
    reverseRoute,
} from '../../../public/utils/common';

import NavMenu from './NavMenu';

import {
    iconNames,
    pageTitles,
    pathNames,
} from '../../constants';


import LinkOutsideRouter from '../LinkOutsideRouter';
import logo from '../../../img/black-logo.png';
import styles from './styles.scss';

import {
    stopSiloBackgroundTasksAction,
} from '../../../common/middlewares/siloBackgroundTasks';
import {
    stopRefreshAction,
} from '../../../common/middlewares/refresher';

import {
    logoutAction,
    setActiveProjectAction,

    activeCountrySelector,
    activeProjectSelector,
    activeUserSelector,
    currentUserInformationSelector,
    currentUserProjectsSelector,

    navbarActiveLinkSelector,
    navbarValidLinksSelector,
    navbarVisibleSelector,
} from '../../../common/redux';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    activeCountry: activeCountrySelector(state),
    navbarActiveLink: navbarActiveLinkSelector(state),
    navbarValidLinks: navbarValidLinksSelector(state),
    navbarVisible: navbarVisibleSelector(state),
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
    userProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    stopRefresh: () => dispatch(stopRefreshAction()),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
});

const propTypes = {
    activeCountry: PropTypes.number,
    activeProject: PropTypes.number,
    logout: PropTypes.func.isRequired,
    navbarValidLinks: PropTypes.arrayOf(PropTypes.string),
    navbarVisible: PropTypes.bool,
    setActiveProject: PropTypes.func.isRequired,
    stopRefresh: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userInformation: PropTypes.object, // eslint-disable-line
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
};

const defaultProps = {
    activeProject: undefined,
    activeCountry: undefined,
    navbarValidLinks: [],
    navbarVisible: false,
    activeUser: {},
    userProjects: {},
    userInformation: {},
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getDropdownItems = (projectId, { userId }, countryId) => {
        const params = {
            projectId,
            userId,
            countryId,
            analysisFrameworkId: 1,
        };

        const links = [
            'userProfile',
            'categoryEditor',
            'adminPanel',
        ];

        const dropdownItemIcons = {
            userProfile: iconNames.person,
            categoryEditor: iconNames.text,
            adminPanel: iconNames.locked,
        };

        const items = links.map(link => ({
            linkTo: reverseRoute(pathNames[link], params),
            name: pageTitles[link],
            iconName: dropdownItemIcons[link],
            private: true,
        }));

        return items;
    }

    handleProjectChange = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
        }
    }

    handleLogoutButtonClick = () => {
        this.props.stopRefresh();
        this.props.stopSiloTasks();
        this.props.logout();
    }

    selectProjectKey = (option = {}) => (option.id)
    selectProjectLabel = (option = {}) => (option.title)

    calcNavbarKey = item => item.name

    calcDropdownGroupKey = group => group.key
    calcDropdownItemKey = item => item.name

    renderDropdownItem = (key, item) => {
        const {
            navbarValidLinks,
            userProjects,
            activeUser,
        } = this.props;
        if (navbarValidLinks.indexOf(item.name) === -1) {
            return null;
        }
        if (item.needsProject && userProjects.length <= 0) {
            return null;
        }
        if (item.private && !activeUser.userId) {
            console.warn('here');
            return null;
        }

        return (
            <LinkOutsideRouter
                key={key}
                className={styles['dropdown-item']}
                to={item.linkTo}
            >
                {
                    item.iconName &&
                    <span
                        className={`${item.iconName} ${styles.icon}`}
                    />
                }
                {item.name}
            </LinkOutsideRouter>
        );
    }

    render() {
        const {
            activeProject,
            activeCountry,
            activeUser,
            navbarVisible,
            userProjects,
            userInformation,
        } = this.props;

        const userName = userInformation.displayName || activeUser.displayName || 'Anon';

        if (!navbarVisible) {
            return null;
        }

        return (
            <nav
                styleName="navbar"
            >
                <Link
                    to="/"
                    styleName="brand"
                >
                    <img
                        styleName="icon"
                        src={logo}
                        alt="DEEP"
                        draggable="false"
                    />
                    <span styleName="title">Deep</span>
                </Link>

                {
                    userProjects.length > 0 && activeUser.userId && (
                        <SelectInput
                            clearable={false}
                            keySelector={this.selectProjectKey}
                            labelSelector={this.selectProjectLabel}
                            onChange={this.handleProjectChange}
                            options={this.props.userProjects}
                            placeholder="Select Event"
                            showHintAndError={false}
                            showLabel={false}
                            styleName="project-select-input"
                            value={activeProject}
                        />
                    )
                }

                <NavMenu
                    styleName="main-menu"
                    projectId={activeProject}
                    countryId={activeCountry}
                />

                <DropdownMenu
                    styleName="user-menu"
                    iconName={iconNames.person}
                    title={userName}
                >
                    <DropdownGroup>
                        <List
                            data={this.getDropdownItems(activeProject, activeUser, activeCountry)}
                            keyExtractor={this.calcDropdownItemKey}
                            modifier={this.renderDropdownItem}
                        />
                    </DropdownGroup>
                    {
                        activeUser.userId && (
                            <DropdownGroup>
                                <button
                                    styleName="dropdown-item"
                                    onClick={this.handleLogoutButtonClick}
                                >
                                    <span
                                        className="ion-log-out"
                                        styleName="icon"
                                    />
                                    Logout
                                </button>
                            </DropdownGroup>
                        )
                    }
                </DropdownMenu>
            </nav>
        );
    }
}
