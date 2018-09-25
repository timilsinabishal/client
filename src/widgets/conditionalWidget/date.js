import _ts from '#ts';
import { compareDate } from '#rsu/common';

const isEqualTo = {
    title: _ts('conditional.date', 'isEqualToTitle'),
    attributes: [{
        key: 'value',
        type: 'date',
        title: _ts('conditional.date', 'isEqualToTitle'),
    }],
    test: ({ value } = {}, { value: attrValue } = {}) => (
        compareDate(value, attrValue) === 0
    ),
};

const after = {
    title: _ts('conditional.date', 'afterDateTitle'),
    attributes: [{
        key: 'value',
        type: 'date',
        title: _ts('conditional.date', 'afterDateTitle'),
    }],
    test: ({ value } = {}, { value: attrValue } = {}) => (
        compareDate(value, attrValue) > 0
    ),
};

const before = {
    title: _ts('conditional.date', 'beforeDateTitle'),
    attributes: [{
        key: 'value',
        type: 'date',
        title: _ts('conditional.date', 'beforeDateTitle'),
    }],
    test: ({ value } = {}, { value: attrValue } = {}) => (
        compareDate(value, attrValue) < 0
    ),
};

const isInBetween = {
    title: _ts('conditional.date', 'isInBetweenTitle'),
    attributes: [
        {
            key: 'minValue',
            type: 'date',
            title: _ts('conditional.date', 'minDateTitle'),
        },
        {
            key: 'maxValue',
            type: 'date',
            title: _ts('conditional.date', 'maxDateTitle'),
        },
    ],
    test: ({ value } = {}, { minValue, maxValue } = {}) => (
        compareDate(value, maxValue) < 0 &&
        compareDate(value, minValue) > 0
    ),
};

export default {
    isEqualTo,
    after,
    before,
    isInBetween,
};
