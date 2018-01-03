const initialSiloDomainData = {
    activeProject: undefined,
    activeCountry: undefined,

    addLeadView: {
        filters: {
            search: '',
            type: [],
            source: '',
            status: '',
        },
        activeLeadId: 'lead-1',
        leads: [
            /*
            {
                data: {
                    id: 'lead-1',
                    type: 'text', // dropbox, file, website, text
                    serverId: undefined,
                },
                form: {
                    values: {
                        title: 'Lead #1',
                        source: 'TV',
                        project: 1,
                    },
                    errors: [],
                    fieldErrors: {
                        title: 'Title is not defined',
                    },
                },
                uiState: {
                    error: true,
                    pristine: false,
                },
            },
            */
        ],
    },

    // i specifies project
    leadPage: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            viewMode: 'viz',
            filters: {
            },
            leads: [],
            totalLeadsCount: 123,
        },
        */
    },

    entriesView: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            filters: { },
            entries: [],
            totalEntriesCount: 123,
        },
        */
    },

    // i specifies lead
    editEntryView: {
        /*
        1: {
            leadId: 1,
            lead: {},
            selectedEntryId: undefined,
            entries: [
            ],
        },
        */
    },

    analysisFrameworkView: {
        analysisFramework: {
            /*
            id: 1,
            title: 'ACAPS Framework',
            createdAt: '',
            modifiedAt: '',
            createdBy: 1,
            modifiedBy: 1,

            widgets: [
                {
                    id: 1,
                    widgetId: 'excerpt-1xs',
                    title: 'Excerpt',
                    properties: {},
                }
            ],

            filters: [
            ],
            exportables: [
            ],
            */
        },
    },

    // SubCategory = {
    //     id: <string>,
    //     title: <string>,
    //     subCategories: <SubCategory>[],
    // }
    categoryEditorView: {
        1: {
            title: '',
            versionId: 0,
            data: {
                activeCategoryId: undefined,
                categories: [
                    // {
                    //     id: <string>,
                    //     title: <string>,
                    //     selectedSubCategorie: <string>[] : SubCategory.id,
                    //     subCategories: <SubCategory>[],
                    // }
                ],
            },
        },
    },

    categoryEditorDocument: {
        // index is category editor id
        1: {
            documents: [],
            previewId: undefined,
            extractedWords: {
                // index is n-gram
                '1grams': [],
                '2grams': [],
                '3grams': [],
            },
        },
    },

    userGalleryFiles: [],
};

export default initialSiloDomainData;
