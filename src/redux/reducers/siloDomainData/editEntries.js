import { applyDiff, entryAccessor, createEntry } from '#entities/editEntries';
import { analyzeErrors } from '#rscg/Faram/validator';
import {
    isFalsy,
    randomString,
    getDefinedElementAround,
    formatPdfText,
} from '#rsu/common';
import update from '#rsu/immutable-update';

const getNewSelectedEntryKey = (entries, selectedEntryKey) => {
    if (entries.length <= 0) {
        return undefined;
    }
    if (selectedEntryKey === undefined) {
        return entryAccessor.key(entries[0]);
    }
    const selectedEntry = entries.find(
        entry => entryAccessor.key(entry) === selectedEntryKey,
    );
    if (!selectedEntry) {
        return entryAccessor.key(entries[0]);
    }
    return selectedEntryKey;
};


// REDUX

export const EEB__SET_LEAD = 'siloDomainData/EEB__SET_LEAD';
export const EEB__SET_ENTRIES = 'siloDomainData/EEB__SET_ENTRIES';
export const EEB__UPDATE_ENTRIES_BULK = 'siloDomainData/EEB__UPDATE_ENTRIES_BULK';
export const EEB__CLEAR_ENTRIES = 'siloDomainData/EEB__CLEAR_ENTRIES';
export const EEB__SET_SELECTED_ENTRY_KEY = 'siloDomainData/EEB__SET_SELECTED_ENTRY_KEY';
export const EEB__SET_ENTRY_EXCERPT = 'siloDomainData/EEB__SET_ENTRY_EXCERPT';
export const EEB__SET_ENTRY_DATA = 'siloDomainData/EEB__SET_ENTRY_DATA';
export const EEB__SET_ENTRY_ERROR = 'siloDomainData/EEB__SET_ENTRY_ERROR';
export const EEB__ADD_ENTRY = 'siloDomainData/EEB__ADD_ENTRY';
export const EEB__REMOVE_ENTRY = 'siloDomainData/EEB__REMOVE_ENTRY';
export const EEB__REMOVE_LOCAL_ENTRIES = 'siloDomainData/EEB__REMOVE_LOCAL_ENTRIES';
export const EEB__MARK_AS_DELETED_ENTRY = 'siloDomainData/EEB__MARK_AS_DELETED_ENTRY';
export const EEB__APPLY_TO_ALL_ENTRIES = 'siloDomainData/EEB__APPLY_TO_ALL_ENTRIES';
export const EEB__APPLY_TO_ALL_ENTRIES_BELOW = 'siloDomainData/EEB__APPLY_TO_ALL_ENTRIES_BELOW';
export const EEB__FORMAT_ALL_ENTRIES = 'siloDomainData/EEB__FORMAT_ALL_ENTRIES';
export const EEB__SET_PENDING = 'siloDomainData/EEB__SET_PENDING';
export const EEB__SAVE_ENTRY = 'siloDomainData/EEB__SAVE_ENTRY';
export const EEB__RESET_UI_STATE = 'siloDomainData/EEB__RESET_UI_STATE';

export const editEntriesSaveEntryAction = ({ leadId, entryKey, response, color }) => ({
    type: EEB__SAVE_ENTRY,
    leadId,
    entryKey,
    response,
    color,
});

export const editEntriesSetPendingAction = ({ leadId, entryKey, pending }) => ({
    type: EEB__SET_PENDING,
    leadId,
    entryKey,
    pending,
});

export const editEntriesApplyToAllEntriesAction = ({ leadId, key, value, entryKey }) => ({
    type: EEB__APPLY_TO_ALL_ENTRIES,
    leadId,
    key,
    value,
    entryKey,
});

export const editEntriesApplyToAllEntriesBelowAction = ({ leadId, key, value, entryKey }) => ({
    type: EEB__APPLY_TO_ALL_ENTRIES_BELOW,
    leadId,
    key,
    value,
    entryKey,
});

export const editEntriesFormatAllEntriesAction = ({ leadId }) => ({
    type: EEB__FORMAT_ALL_ENTRIES,
    leadId,
});

export const editEntriesAddEntryAction = ({ leadId, entry }) => ({
    type: EEB__ADD_ENTRY,
    leadId,
    entry,
});

export const editEntriesRemoveEntryAction = ({ leadId, key }) => ({
    type: EEB__REMOVE_ENTRY,
    leadId,
    key,
});

export const editEntriesSetLeadAction = ({ lead }) => ({
    type: EEB__SET_LEAD,
    lead,
});

export const editEntriesSetEntriesAction = ({ leadId, entryActions }) => ({
    type: EEB__SET_ENTRIES,
    entryActions,
    leadId,
});

export const editEntriesUpdateEntriesBulkAction = ({ leadId, bulkData }) => ({
    type: EEB__UPDATE_ENTRIES_BULK,
    leadId,
    bulkData,
});

export const editEntriesClearEntriesAction = ({ leadId }) => ({
    type: EEB__CLEAR_ENTRIES,
    leadId,
});

export const editEntriesSetSelectedEntryKeyAction = ({ leadId, key }) => ({
    type: EEB__SET_SELECTED_ENTRY_KEY,
    leadId,
    key,
});

export const editEntriesSetExcerptAction = ({ leadId, key, excerptValue, excerptType }) => ({
    type: EEB__SET_ENTRY_EXCERPT,
    leadId,
    key,
    excerptType,
    excerptValue,
});

export const editEntriesSetEntryDataAction = ({ leadId, key, values, errors, info, color }) => ({
    type: EEB__SET_ENTRY_DATA,
    leadId,
    key,
    values,
    errors,
    info,
    color,
});

export const editEntriesSetEntryErrorsAction = ({ leadId, key, errors, isServerError }) => ({
    type: EEB__SET_ENTRY_ERROR,
    leadId,
    key,
    errors,
    isServerError,
});

export const editEntriesMarkAsDeletedEntryAction = ({ leadId, key, value }) => ({
    type: EEB__MARK_AS_DELETED_ENTRY,
    leadId,
    key,
    value,
});

export const editEntriesResetUiStateAction = leadId => ({
    type: EEB__RESET_UI_STATE,
    leadId,
});

// ACTION-CREATOR
const setLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                lead: { $set: lead },
            } },
        } },
    };
    return update(state, settings);
};

const setEntries = (state, action) => {
    const { leadId, entryActions } = action;
    const {
        editEntries: {
            [leadId]: {
                entries = [],
                selectedEntryKey,
            } = {},
        } = {},
    } = state;

    const newEntries = applyDiff(entries, entryActions);
    const newSelectedEntryKey = getNewSelectedEntryKey(newEntries, selectedEntryKey);

    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entries: { $set: newEntries },
                selectedEntryKey: { $set: newSelectedEntryKey },
            } },
        } },
    };
    return update(state, settings);
};

const updateEntriesBulk = (state, action) => {
    const { leadId, bulkData } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    if (entries.length === 0 || Object.keys(bulkData).length === 0) {
        return state;
    }

    const entriesSettings = Object.keys(bulkData).reduce(
        (acc, key) => {
            const { localData = {}, data = {} } = bulkData[key];

            const entryIndex = entries.findIndex(
                entry => entryAccessor.key(entry) === key,
            );

            acc[entryIndex] = { $auto: {
                localData: { $auto: {
                    $merge: localData,
                } },
                data: { $auto: {
                    $merge: data,
                } },
            } };

            return acc;
        },
        {},
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entries: entriesSettings,
            },
        },
    };

    return update(state, settings);
};

const clearEntries = (state, action) => {
    const { leadId } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entries: { $set: [] },
            } },
        } },
    };
    return update(state, settings);
};

const setSelectedEntryKey = (state, action) => {
    const { leadId, key } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                selectedEntryKey: { $set: key },
            } },
        } },
    };
    return update(state, settings);
};

const setEntryExcerpt = (state, action) => {
    const { leadId, key, excerptType, excerptValue } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const excerpt = excerptType === 'excerpt' ? excerptValue : undefined;
    const image = excerptType === 'image' ? excerptValue : undefined;
    const dataSeries = excerptType === 'dataSeries' ? excerptValue : undefined;

    const entryIndex = entries.findIndex(entry => entryAccessor.key(entry) === key);
    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            entryType: { $set: excerptType },
                            excerpt: { $set: excerpt },
                            image: { $set: image },
                            dataSeries: { $set: dataSeries },
                        },
                        localData: {
                            isPristine: { $set: false },
                            hasServerError: { $set: false },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const addEntry = (state, action) => {
    const { entry, leadId } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const {
        excerptType,
        excerptValue,
        color,
        ...otherEntry
    } = entry;

    // Add order to entries during creation
    const maxEntryOrder = entries.reduce(
        (acc, e) => {
            const val = entryAccessor.data(e) || {};
            const entryOrder = val.order;
            if (isFalsy(entryOrder)) {
                return acc;
            }
            return Math.max(acc, entryOrder);
        },
        0,
    );

    // Create data for new entry
    const newData = {
        ...otherEntry,
        entryType: excerptType,
        excerpt: excerptType === 'excerpt' ? excerptValue : undefined,
        image: excerptType === 'image' ? excerptValue : undefined,
        dataSeries: excerptType === 'dataSeries' ? excerptValue : undefined,
        lead: leadId,
        order: maxEntryOrder + 1,
    };

    // Get random key for new entry
    const localId = randomString();

    const newEntry = createEntry({
        key: localId,
        data: newData,
        color,
    });

    const settings = {
        editEntries: {
            [leadId]: { $auto: {
                selectedEntryKey: { $set: localId },
                entries: { $autoArray: {
                    $push: [newEntry],
                } },
            } },
        },
    };
    return update(state, settings);
};

const setEntryData = (state, action) => {
    const { leadId, key, values, errors, info, color } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    let newState = state;

    if (info.action === 'changeExcerpt') {
        const excerpt = info.type === 'excerpt' ? info.value : undefined;
        const image = info.type === 'image' ? info.value : undefined;
        const dataSeries = info.type === 'dataSeries' ? info.value : undefined;

        const settings = {
            editEntries: {
                [leadId]: {
                    entries: {
                        [entryIndex]: {
                            data: {
                                entryType: { $set: info.type },
                                excerpt: { $set: excerpt },
                                image: { $set: image },
                                dataSeries: { $set: dataSeries },
                            },
                            localData: {
                                isPristine: { $set: false },
                                hasServerError: { $set: false },
                            },
                        },
                    },
                },
            },
        };

        newState = update(newState, settings);
    }

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: {
                            attributes: {
                                $set: values,
                            },
                        },
                        localData: {
                            isPristine: { $set: false },
                            error: { $set: errors },
                            hasError: { $set: analyzeErrors(errors) },
                            hasServerError: { $set: false },
                            color: { $set: color },
                        },
                    },
                },
            },
        },
    };
    newState = update(newState, settings);

    return newState;
};

const setEntryError = (state, action) => {
    const { leadId, key, errors, isServerError } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        localData: {
                            $if: [
                                isServerError,
                                {
                                    hasServerError: { $set: true },
                                },
                                {
                                    error: { $set: errors },
                                    hasError: { $set: analyzeErrors(errors) },
                                    hasServerError: { $set: false },
                                },
                            ],
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const removeEntry = (state, action) => {
    const { leadId, key } = action;
    // NOTE: no need to get new selectedEntryKey
    // a new selectedEntryKey is calculated on mark as delete
    const settings = {
        editEntries: {
            [leadId]: {
                entries: {
                    $filter: entry => entryAccessor.key(entry) !== key,
                },
            },
        },
    };
    return update(state, settings);
};

const markAsDeletedEntry = (state, action) => {
    const { leadId, key, value } = action;
    const {
        editEntries: { [leadId]: { entries = [], selectedEntryKey } = {} } = {},
    } = state;

    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === key,
    );

    let newSelectedEntryKey = selectedEntryKey;
    if (value) {
        const filteredEntries = entries.map(
            e => (
                entryAccessor.isMarkedAsDeleted(e) || entryAccessor.key(e) === selectedEntryKey
                    ? undefined
                    : e
            ),
        );
        if (filteredEntries[entryIndex] === undefined) {
            const newSelectedEntry = getDefinedElementAround(filteredEntries, entryIndex);
            newSelectedEntryKey = newSelectedEntry
                ? entryAccessor.key(newSelectedEntry)
                : undefined;
        }
    } else {
        newSelectedEntryKey = key;
    }

    const settings = {
        editEntries: {
            [leadId]: {
                selectedEntryKey: { $set: newSelectedEntryKey },
                entries: {
                    [entryIndex]: {
                        localData: {
                            isPristine: { $set: false },
                            isMarkedAsDeleted: { $set: value },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const applyToAllEntries = mode => (state, action) => {
    // attribute key and value
    const { leadId, key, value, entryKey } = action;
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;

    const settings = {
        editEntries: {
            [leadId]: {
                entries: {},
            },
        },
    };

    // NOTE: setting entry to undefined instead of using filter to preserve index
    let iterableEntries;
    if (mode === 'all-below') {
        const entryIndex = entries.findIndex(entry => entryAccessor.key(entry) === entryKey);
        console.warn(entryIndex);
        // set all entries before current entry to undefined
        iterableEntries = entries.map((entry, i) => (i < entryIndex ? undefined : entry));
    } else if (mode === 'all') {
        iterableEntries = entries;
    }
    const stringifiedValue = JSON.stringify(value);
    iterableEntries = iterableEntries.map((entry) => {
        if (
            entry === undefined ||
            // set current entry to undefined
            key === entryAccessor.key(entry) ||
            // deep compare data and set same elements to undefined
            JSON.stringify(entryAccessor.dataAttribute(entry, key)) === stringifiedValue
        ) {
            return undefined;
        }
        return entry;
    });

    iterableEntries.forEach((entry, i) => {
        if (entry === undefined) {
            return;
        }
        settings.editEntries[leadId].entries[i] = {
            data: {
                attributes: { $auto: {
                    [key]: { $auto: {
                        data: { $set: value },
                    } },
                } },
            },
            localData: {
                isPristine: { $set: false },
                error: { $auto: {
                    attributes: { $auto: {
                        [key]: { $auto: {
                            data: { $set: undefined },
                        } },
                    } },
                } },
                hasServerError: { $set: false },
            },
        };
    });
    const newState = update(state, settings);

    // re-calculate errors
    const newSettings = {
        editEntries: {
            [leadId]: {
                entries: {},
            },
        },
    };

    const {
        editEntries: { [leadId]: { entries: newEntries = [] } = {} } = {},
    } = newState;

    newEntries.forEach((entry, i) => {
        const { localData: { error } = {} } = entry || {};
        settings.editEntries[leadId].entries[i] = {
            localData: {
                hasError: { $set: analyzeErrors(error) },
            },
        };
    });

    return update(newState, newSettings);
};

const setPending = (state, action) => {
    const { leadId, entryKey, pending } = action;
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entryRests: { $auto: {
                    [entryKey]: { $set: pending },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const saveEntry = (state, action) => {
    const { leadId, entryKey, response, color } = action;

    // NOTE: create new entry from remote entry
    const remoteEntry = response;
    const {
        id: remoteServerId,
        versionId: remoteVersionId,
    } = remoteEntry;

    const newEntry = createEntry({
        key: entryKey,
        serverId: remoteServerId,
        versionId: remoteVersionId,
        data: remoteEntry,
        isPristine: true,
        hasError: false,
        color,
    });

    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;
    const entryIndex = entries.findIndex(
        entry => entryAccessor.key(entry) === entryKey,
    );

    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                entries: { $auto: {
                    [entryIndex]: { $set: newEntry },
                } },
            } },
        } },
    };

    return update(state, settings);
};

const editEntriesResetUiState = (state, { leadId }) => {
    const settings = {
        editEntries: { $auto: {
            [leadId]: { $auto: {
                $unset: ['entryRests'],
            } },
        } },
    };
    return update(state, settings);
};

const formatAllEntries = (state, { leadId }) => {
    const {
        editEntries: { [leadId]: { entries = [] } = {} } = {},
    } = state;
    const settings = {
        editEntries: {
            [leadId]: {
                entries: {},
            },
        },
    };
    entries.forEach((entry, i) => {
        if (entry.data.entryType !== 'excerpt') {
            return;
        }
        const newExcerpt = formatPdfText(entry.data.excerpt);
        if (entry.data.excerpt === newExcerpt) {
            return;
        }
        settings.editEntries[leadId].entries[i] = {
            data: {
                excerpt: {
                    $set: newExcerpt,
                },
            },
            localData: {
                isPristine: { $set: false },
                hasServerError: { $set: false },
            },
        };
    });
    return update(state, settings);
};

const reducers = {
    [EEB__SET_LEAD]: setLead,
    [EEB__SET_ENTRIES]: setEntries,
    [EEB__UPDATE_ENTRIES_BULK]: updateEntriesBulk,
    [EEB__CLEAR_ENTRIES]: clearEntries,
    [EEB__SET_SELECTED_ENTRY_KEY]: setSelectedEntryKey,
    [EEB__SET_ENTRY_EXCERPT]: setEntryExcerpt,
    [EEB__SET_ENTRY_DATA]: setEntryData,
    [EEB__SET_ENTRY_ERROR]: setEntryError,
    [EEB__ADD_ENTRY]: addEntry,
    [EEB__REMOVE_ENTRY]: removeEntry,
    [EEB__MARK_AS_DELETED_ENTRY]: markAsDeletedEntry,
    [EEB__APPLY_TO_ALL_ENTRIES]: applyToAllEntries('all'),
    [EEB__APPLY_TO_ALL_ENTRIES_BELOW]: applyToAllEntries('all-below'),
    [EEB__SET_PENDING]: setPending,
    [EEB__SAVE_ENTRY]: saveEntry,
    [EEB__RESET_UI_STATE]: editEntriesResetUiState,
    [EEB__FORMAT_ALL_ENTRIES]: formatAllEntries,
};

export default reducers;
