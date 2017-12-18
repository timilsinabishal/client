import { createSelector } from 'reselect';
import { activeUserSelector } from './auth';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};


// Using props

export const userIdFromRoute = (state, { match }) => match.params.userId;
export const groupIdFromRoute = (state, { match }) => match.params.userGroupId;
export const analysisFrameworkIdFromProps = (state, { match }) => match.params.analysisFrameworkId;

export const regionIdFromProps = (state, { regionId }) => regionId;
export const userGroupIdFromProps = (state, { userGroupId }) => userGroupId;
export const analysisFrameworkIdFromPropsForProject = (state, { afId }) => afId;

// Using state

export const leadFilterOptionsSelector = ({ domainData }) => (
    domainData.leadFilterOptions || emptyObject
);

export const entriesSelector = ({ domainData }) => (
    domainData.entries || emptyObject
);

export const regionsSelector = ({ domainData }) => (
    domainData.regions || emptyObject
);

export const analysisFrameworksSelector = ({ domainData }) => (
    domainData.analysisFrameworks || emptyObject
);

export const analysisFrameworkDetailSelector = createSelector(
    analysisFrameworksSelector,
    analysisFrameworkIdFromPropsForProject,
    (analysisFrameworks, afId) => (
        analysisFrameworks[afId] || emptyObject
    ),
);

export const analysisFrameworkListSelector = createSelector(
    analysisFrameworksSelector,
    analysisFrameworks => (
        analysisFrameworks && Object.values(analysisFrameworks).filter(
            analysisFramework => analysisFramework,
        )) || emptyList,
);

export const countriesListSelector = createSelector(
    regionsSelector,
    regions => (
        regions && Object.values(regions).filter(region => region && region.public)
    ) || emptyList,
);

export const adminLevelsSelector = ({ domainData }) => (
    domainData.adminLevels || emptyObject
);
export const usersSelector = ({ domainData }) => (
    domainData.users || emptyObject
);
export const projectsSelector = ({ domainData }) => (
    domainData.projects || emptyObject
);
export const projectsOptionsSelector = ({ domainData }) => (
    domainData.projectsOptions || emptyObject
);

export const groupsSelector = ({ domainData }) => (
    domainData.userGroups || emptyObject
);

export const adminLevelForRegionSelector = createSelector(
    adminLevelsSelector,
    regionIdFromProps,
    (adminLevels, regionId) => (
        adminLevels[regionId] || emptyList
    ),
);

export const regionDetailForRegionSelector = createSelector(
    regionsSelector,
    regionIdFromProps,
    (regions, regionId) => (
        regions[regionId] || emptyObject
    ),
);

// Selector depending on user id from route (url)

export const userSelector = createSelector(
    userIdFromRoute,
    usersSelector,
    (userId, users) => (users[userId] || emptyObject),
);

export const userInformationSelector = createSelector(
    userSelector,
    user => (user.information || emptyObject),
);
export const usersInformationListSelector = createSelector(
    usersSelector,
    users => (Object.keys(users).map(id =>
        users[id].information,
    ) || emptyList).filter(d => d),
);

export const userProjectsSelector = createSelector(
    projectsSelector,
    userSelector,
    (projects, user) => ((user.projects &&
        user.projects.map(projectId => (
            projects[projectId]
        ))) || emptyList),
);

export const userGroupsSelector = createSelector(
    groupsSelector,
    userSelector,
    (userGroups, user) => ((user.userGroups &&
        user.userGroups.map(userGroupId => (
            userGroups[userGroupId]
        ))) || emptyList),
);

export const userGroupProjectSelector = createSelector(
    projectsSelector,
    groupIdFromRoute,
    (projects, userGroupId) => (Object.keys(projects).reduce((acc, projectId) => {
        const userGroups = (projects[projectId] || emptyObject).userGroups;
        if (userGroups && userGroups.find(userGroup => (userGroup.id === +userGroupId))) {
            acc.push(projects[projectId]);
        }
        return acc;
    }, []) || emptyList),
);

export const groupSelector = createSelector(
    groupsSelector,
    groupIdFromRoute,
    (userGroups, userGroupId) => (userGroups[userGroupId] || emptyObject),
);

export const userGroupDetailsSelector = createSelector(
    groupsSelector,
    userGroupIdFromProps,
    (userGroups, userGroupId) => (userGroups[userGroupId] || emptyObject),
);
// Selector depending on user id from state (logged-in user)

export const currentUserSelector = createSelector(
    activeUserSelector,
    usersSelector,
    (activeUser, users) => (users[activeUser.userId] || emptyObject),
);

export const currentUserInformationSelector = createSelector(
    currentUserSelector,
    user => (user.information || emptyObject),
);

export const currentUserProjectsSelector = createSelector(
    currentUserSelector,
    projectsSelector,
    (user, projects) => ((user.projects &&
        user.projects.map(projectId => (
            projects[projectId] || emptyObject
        ))
    ) || emptyList),
);

export const currentUserAdminProjectsSelector = createSelector(
    currentUserProjectsSelector,
    projects => projects.filter(project => (project.role === 'admin')),
);


/*
export const categoriesSelector = ({ domainData }) => (
    domainData.categories || emptyObject
);

export const categoriesListSelector = createSelector(
    categoriesSelector,
    categories => Object.values(categories),
);


export const subCategoriesSelector = ({ domainData }) => (
    domainData.subCategories || emptyObject
);

export const subSubCategoriesSelector = ({ domainData }) => (
    domainData.subSubCategories || emptyObject
);
<<<<<<< HEAD
*/

// Visualization Selectors

export const hierarchialDataSelector = ({ domainData }) => (
    domainData.visualization.hierarchialData || emptyObject
);

export const chordDataSelector = ({ domainData }) => (
    domainData.visualization.chordData || emptyObject
);

export const correlationDataSelector = ({ domainData }) => (
    domainData.visualization.correlationData || emptyObject
);

export const barDataSelector = ({ domainData }) => (
    domainData.visualization.barData || emptyObject
);

export const forceDirectedDataSelector = ({ domainData }) => (
    domainData.visualization.forceDirectedData || emptyObject
);
