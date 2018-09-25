const emptyObject = {};

const getPillarOptions = widgetData => (
    widgetData.rows.map(r => ({
        key: r.key,
        title: r.title,
    }))
);

const getSubpillarOptions = widgetData => (
    widgetData.rows.reduce((acc, r) => [
        ...r.cells.map(c => ({
            key: c.key,
            title: c.value,
        })),
        ...acc,
    ], [])
);

const containsPillar = {
    title: 'Contains pillar',
    attributes: [{
        key: 'pillar',
        type: 'select',
        title: 'Pillar',
        options: getPillarOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value } = {}, { pillar } = {}) => {
        const subpillars = value[pillar] || emptyObject;
        return Object.keys(subpillars).some(key => value[key]);
    },
};

const containsSubpillar = {
    title: 'Contains subpillar',
    attributes: [{
        key: 'subpillar',
        type: 'select',
        title: 'Subpillar',
        options: getSubpillarOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} } = {}, { subpillar } = {}) => (
        Object.keys(value).some((p) => {
            const subpillars = value[p] || emptyObject;
            if (subpillars) {
                return Object.keys(subpillars).some(sp => (
                    sp === subpillar ? subpillars[sp] : false
                ));
            }
            return false;
        })
    ),
};


export default {
    containsPillar,
    containsSubpillar,
};
