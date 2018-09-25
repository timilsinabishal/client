import _ts from '#ts';

const isLessThan = {
    title: _ts('conditional.number', 'isLessThanTitle'),
    attributes: [{
        key: 'value',
        title: _ts('conditional.number', 'isLessThanTitle'),
        type: 'number',
    }],
    test: (data, attributes) => (
        data.value && data.value < attributes.value
    ),
};

const isGreaterThan = {
    title: _ts('conditional.number', 'isGreaterThanTitle'),
    attributes: [{
        key: 'value',
        type: 'number',
        title: _ts('conditional.number', 'isGreaterThanTitle'),
    }],
    test: (data, attributes) => (
        data.value && data.value > attributes.value
    ),
};

const isEqualTo = {
    title: _ts('conditional.number', 'isEqualThanTitle'),
    attributes: [{
        key: 'value',
        title: _ts('conditional.number', 'isEqualThanTitle'),
        type: 'number',
    }],
    test: (data, attributes) => (
        data.value && data.value === attributes.value
    ),
};

export default {
    isLessThan,
    isGreaterThan,
    isEqualTo,
};
