const emptyArray = [];

const getScaleOptions = widgetData => (
    widgetData.scaleUnits || emptyArray
);

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'scale',
        type: 'select',
        title: 'Scale',
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: (data, attributes) => {
        console.warn(data, attributes);
        return false;
    },
};

const isGreaterThan = {
    title: 'Is greater than',
    attributes: [{
        key: 'scale',
        type: 'select',
        title: 'Scale',
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: (data, attributes) => {
        console.warn(data, attributes);
        return false;
    },
};

const isLessThan = {
    title: 'Is less than',
    attributes: [{
        key: 'scale',
        type: 'select',
        title: 'Scale',
        options: getScaleOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: (data, attributes) => {
        console.warn(data, attributes);
        return false;
    },
};

const isInBetween = {
    title: 'Is in between',
    attributes: [
        {
            key: 'lowerScale',
            type: 'select',
            title: 'Lower Scale',
            options: getScaleOptions,
            keySelector: d => d.key,
            labelSelector: d => d.label,
        },
        {
            key: 'upperScale',
            type: 'select',
            title: 'Upper Scale',
            options: getScaleOptions,
            keySelector: d => d.key,
            labelSelector: d => d.label,
        },
    ],
    test: (data, attributes) => {
        console.warn(data, attributes);
        return false;
    },
};

export default {
    isEqualTo,
    isGreaterThan,
    isLessThan,
    isInBetween,
};
