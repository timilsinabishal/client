import _ts from '#ts';

const isObjectEmpty = obj => (
    Object.keys(obj).length === 0
);

const emptyArray = [];

const getDimensionOptions = ({ dimensions = emptyArray } = {}) => (
    dimensions.map(r => ({
        key: r.id,
        title: r.title,
    }))
);

const getSubdimensionOptions = ({ dimensions = emptyArray } = {}) => (
    dimensions.reduce((acc, r) => [
        ...(r.subdimensions || emptyArray).map(c => ({
            key: c.id,
            title: c.title,
        })),
        ...acc,
    ], [])
);

const getSectorOptions = ({ sectors = emptyArray } = {}) => (
    sectors.map(r => ({
        key: r.id,
        title: r.title,
    }))
);

const getSubsectorOptions = ({ sectors = emptyArray } = {}) => (
    sectors.reduce((acc, r) => [
        ...(r.subsectors || emptyArray).map(c => ({
            key: c.id,
            title: c.title,
        })),
        ...acc,
    ], [])
);

const containsDimension = {
    title: _ts('conditional.matrix2d', 'containsDimensionTitle'),
    attributes: [{
        key: 'dimension',
        type: 'select',
        title: _ts('conditional.matrix2d', 'dimensionTitle'),
        options: getDimensionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} } = {}, { dimension } = {}) => {
        const dimensionValue = value[dimension];
        if (!dimensionValue) {
            return false;
        }

        const selectedKeys = Object.keys(dimensionValue)
            .filter(k => !isObjectEmpty(dimensionValue[k]));
        return selectedKeys.length !== 0;
    },
};

const containsSubdimension = {
    title: _ts('conditional.matrix2d', 'containsSubdimensionTitle'),
    attributes: [{
        key: 'subdimension',
        type: 'select',
        title: _ts('conditional.matrix2d', 'subdimensionTitle'),
        options: getSubdimensionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} } = {}, { subdimension } = {}) => {
        const dimensionOfSubdimension = Object.keys(value)
            .find(v => value[v][subdimension] !== undefined);
        if (!dimensionOfSubdimension) {
            return false;
        }
        return !isObjectEmpty(value[dimensionOfSubdimension][subdimension]);
    },
};

const containsSector = {
    title: _ts('conditional.matrix2d', 'containsSectorTitle'),
    attributes: [{
        key: 'sector',
        type: 'select',
        title: _ts('conditional.matrix2d', 'sectorTitle'),
        options: getSectorOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} } = {}, { sector } = {}) => (
        Object.keys(value).some((v) => {
            const subdimen = value[v];
            if (isObjectEmpty(subdimen)) {
                return false;
            }

            return Object.keys(subdimen).some(sd => (
                subdimen[sd] && subdimen[sd][sector]
            ));
        })
    ),
};

const containsSubsector = {
    title: _ts('conditional.matrix2d', 'containsSubsectorTitle'),
    attributes: [{
        key: 'subsector',
        type: 'select',
        title: _ts('conditional.matrix2d', 'subsectorTitle'),
        options: getSubsectorOptions,
        keySelector: d => d.key,
        labelSelector: d => d.title,
    }],
    test: ({ value = {} } = {}, { subsector } = {}) => (
        Object.keys(value).some((v) => {
            const subdimen = value[v];
            if (isObjectEmpty(subdimen)) {
                return false;
            }

            return Object.keys(subdimen).some((sd) => {
                const subdimenSector = subdimen[sd];
                if (isObjectEmpty(subdimenSector)) {
                    return false;
                }
                return Object.keys(subdimenSector).some(sds => (
                    subdimenSector[sds].indexOf(subsector) >= 0
                ));
            });
        })
    ),
};

export default {
    containsDimension,
    containsSubdimension,
    containsSector,
    containsSubsector,
};
