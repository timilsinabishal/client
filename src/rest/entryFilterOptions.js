import { wsEndpoint, p } from '#config/rest';

// eslint-disable-next-line import/prefer-default-export
export const createUrlForEntryFilterOptions = projectId => (
    `${wsEndpoint}/entry-options/?${p({ project: projectId })}`
);
