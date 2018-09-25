import _ts from '#ts';

const emptyArray = [];

const getScaleOptions = widgetData => (
    widgetData.scaleUnits || emptyArray
);

const isEqualTo = {
    title: _ts('conditional.scale', 'isEqualToTitle'),
    attributes: [{
        key: 'scale',
        type: 'select',
        title: _ts('conditional.scale', 'isEqualToTitle'),
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value } = {}, { scale } = {}) => (
        value === scale
    ),
};

const isGreaterThan = {
    title: _ts('conditional.scale', 'isGreaterThanTitle'),
    attributes: [{
        key: 'scale',
        type: 'select',
        title: _ts('conditional.scale', 'isGreaterThanTitle'),
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value } = {}, { scale } = {}, { scaleUnits = [] } = {}) => (
        scaleUnits.findIndex(s => s.key === value) >=
        scaleUnits.findIndex(s => s.key === scale)
    ),
};

const isLessThan = {
    title: _ts('conditional.scale', 'isLessThanTitle'),
    attributes: [{
        key: 'scale',
        type: 'select',
        title: _ts('conditional.scale', 'isLessThanTitle'),
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value } = {}, { scale } = {}, { scaleUnits = [] } = {}) => (
        scaleUnits.findIndex(s => s.key === value) <=
        scaleUnits.findIndex(s => s.key === scale)
    ),
};

const isInBetween = {
    title: _ts('conditional.scale', 'isInBetweenTitle'),
    attributes: [
        {
            key: 'lowerScale',
            type: 'select',
            title: _ts('conditional.scale', 'lowerScaleTitle'),
            options: getScaleOptions,
            keySelector: d => d.key,
            labelSelector: d => d.label,
        },
        {
            key: 'upperScale',
            type: 'select',
            title: _ts('conditional.scale', 'upperScaleTitle'),
            options: getScaleOptions,
            keySelector: d => d.key,
            labelSelector: d => d.label,
        },
    ],
    test: ({ value } = {}, { lowerScale, upperScale } = {}, { scaleUnits = [] } = {}) => (
        (scaleUnits.findIndex(s => s.key === value) >=
        scaleUnits.findIndex(s => s.key === lowerScale)) &&
        (scaleUnits.findIndex(s => s.key === value) <=
        scaleUnits.findIndex(s => s.key === upperScale))
    ),
};

export default {
    isEqualTo,
    isGreaterThan,
    isLessThan,
    isInBetween,
};
