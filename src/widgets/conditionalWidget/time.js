import _ts from '#ts';

const decodeTimeInMinutes = (value, separator = ':') => {
    if (!value) {
        return 0;
    }
    const values = value.split(separator);
    return ((+values[0] * 60) + values[1]);
};

const compareTime = (a, b) => (
    decodeTimeInMinutes(a) - decodeTimeInMinutes(b)
);

const isEqualTo = {
    title: _ts('conditional.time', 'isEqualToTitle'),
    attributes: [{
        key: 'value',
        type: 'time',
        title: _ts('conditional.time', 'isEqualToTitle'),
    }],
    test: ({ value } = {}, { value: attrValue } = {}) => (
        compareTime(value, attrValue) === 0
    ),
};

const after = {
    title: _ts('conditional.time', 'afterTimeTitle'),
    attributes: [{
        key: 'value',
        type: 'time',
        title: _ts('conditional.time', 'afterTimeTitle'),
    }],
    test: ({ value } = {}, { value: attrValue } = {}) => (
        compareTime(value, attrValue) > 0
    ),
};

const before = {
    title: _ts('conditional.time', 'beforeTimeTitle'),
    attributes: [{
        key: 'value',
        type: 'time',
        title: _ts('conditional.time', 'beforeTimeTitle'),
    }],
    test: ({ value } = {}, { value: attrValue } = {}) => (
        compareTime(value, attrValue) < 0
    ),
};

const isInBetween = {
    title: _ts('conditional.time', 'isInBetweenTitle'),
    attributes: [
        {
            key: 'minValue',
            type: 'time',
            title: _ts('conditional.time', 'minTimeTitle'),
        },
        {
            key: 'maxValue',
            type: 'time',
            title: _ts('conditional.time', 'maxTimeTitle'),
        },
    ],
    test: ({ value } = {}, { minValue, maxValue } = {}) => (
        compareTime(value, maxValue) < 0 &&
        compareTime(value, minValue) > 0
    ),
};

export default {
    isEqualTo,
    after,
    before,
    isInBetween,
};
