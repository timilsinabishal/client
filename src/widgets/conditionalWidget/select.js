import _ts from '#ts';

const emptyArray = [];

const getSelectionOptions = ({ options } = {}) => (
    options || emptyArray
);

const isSelected = {
    title: _ts('conditional.select', 'isSelectedTitle'),
    attributes: [{
        key: 'selection',
        type: 'select',
        title: _ts('conditional.select', 'selectionTitle'),
        options: getSelectionOptions,
        keySelector: d => d.key,
        labelSelector: d => d.label,
    }],
    test: ({ value } = {}, { selection } = {}) => {
        if (Array.isArray(value)) {
            return value.indexOf(selection) >= 0;
        }
        return value === selection;
    },
};

export default {
    isSelected,
};
