import update from '#rsu/immutable-update';

import { LOGOUT_ACTION } from '../../reducers/auth';
import { SET_USER_PROJECTS } from '../../reducers/domainData/projects';

import initialSiloDomainData from '../../initial-state/siloDomainData';

// TYPE

export const SET_ACTIVE_PROJECT = 'siloDomainData/SET_ACTIVE_PROJECT';
export const SET_ACTIVE_COUNTRY = 'siloDomainData/SET_ACTIVE_COUNTRY';

// ACTION-CREATOR

export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setActiveCountryAction = ({ activeCountry }) => ({
    type: SET_ACTIVE_COUNTRY,
    activeCountry,
});

const getIdFromProject = project => project.id;

// REDUCER

const logout = () => initialSiloDomainData;

// NOTE: Only sets new active project id in this reducer
const setUserProjects = (state, action) => {
    const { activeProject: activeProjectId } = state;
    const { projects } = action;

    if (projects && projects.length > 0 && activeProjectId === undefined) {
        const newActiveProjectId = getIdFromProject(projects[0]);
        const settings = {
            activeProject: { $set: newActiveProjectId },
        };
        return update(state, settings);
    }
    return state;
};

const setActiveProject = (state, action) => {
    const { activeProject } = action;
    const settings = {
        activeProject: { $set: activeProject },
        leadPage: { $auto: {
            [activeProject]: { $auto: {
                grid: { $auto: {
                    activePage: { $set: 1 },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const setActiveCountry = (state, action) => {
    const { activeCountry } = action;
    const settings = {
        activeCountry: { $set: activeCountry },
    };
    return update(state, settings);
};

const reducers = {
    [LOGOUT_ACTION]: logout,
    [SET_USER_PROJECTS]: setUserProjects,
    [SET_ACTIVE_PROJECT]: setActiveProject,
    [SET_ACTIVE_COUNTRY]: setActiveCountry,
};

export default reducers;
