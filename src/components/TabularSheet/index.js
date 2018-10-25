import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import { compareString, compareNumber } from '#rsu/common';
import _cs from '#cs';

import { Header, StringCell, NumberCell } from './renderers';

// eslint-disable-next-line css-modules/no-unused-class
import styles from './styles.scss';

const Taebul = Sortable(ColumnWidth(NormalTaebul));

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        data: PropTypes.array,
        options: PropTypes.object,
    }),
    onSheetChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    sheet: {},
};

const comparators = {
    string: compareString,
    number: compareNumber,
};

const renderers = {
    string: StringCell,
    number: NumberCell,
};

const stringifyId = d => ({
    ...d,
    id: String(d.id),
});

export default class TabularSheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    calcSheetSettings = memoize((columns, options = {}) => {
        const settings = { ...options };
        if (!settings.columnWidths) {
            settings.columnWidths = {};
        }

        columns.forEach((column) => {
            if (!settings.columnWidths[column.key]) {
                settings.columnWidths[column.key] = 200;
            }
        });

        return settings;
    });

    calcSheetColumns = memoize((fields = []) => (
        fields.map(stringifyId).map(this.createColumn)
    ));

    createColumn = ({ id: key, title, type }) => ({
        key,
        title,
        headerRendererParams: ({ column, columnKey }) => ({
            columnKey,
            type,
            onChange: this.handleColumnChange,
            title: column.title,
            sortOrder: column.sortOrder,
            onSortClick: column.onSortClick,
        }),
        headerRenderer: Header,
        cellRendererParams: ({ datum }) => ({
            className: _cs(styles[type], styles.cell),
            value: datum[key],
        }),
        cellRenderer: renderers[type],
        comparator: (a, b, d) => comparators[type](a[key], b[key], d),
    })

    handleColumnChange = (key, value) => {
        const sheet = { ...this.props.sheet };

        const fields = [...sheet.fields];
        const index = fields.findIndex(c => String(c.id) === key);
        fields[index] = { ...fields[index], ...value };

        sheet.fields = fields;
        this.props.onSheetChange(sheet);
    }

    handleSettingsChange = (settings) => {
        const sheet = { ...this.props.sheet };
        sheet.options = settings;
        this.props.onSheetChange(sheet);
    }

    render() {
        const { className, sheet } = this.props;
        const sheetColumns = this.calcSheetColumns(sheet.fields);
        const sheetSettings = this.calcSheetSettings(sheetColumns, sheet.options);

        return (
            <div className={_cs(className, styles.tabularSheet, 'tabular-sheet')}>
                <Taebul
                    data={sheet.data}
                    settings={sheetSettings}
                    keySelector={TabularSheet.keySelector}
                    columns={sheetColumns}
                    onChange={this.handleSettingsChange}
                />
            </div>
        );
    }
}
