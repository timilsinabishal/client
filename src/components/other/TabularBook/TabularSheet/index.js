import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Button from '#rsca/Button';
import Searchable from '#rscv/Taebul/Searchable';
import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import {
    compareString,
    compareNumber,
    compareDate,
    caseInsensitiveSubmatch,
    isFalsyString,
    isTruthyString,
} from '#rsu/common';
import update from '#rsu/immutable-update';
import _cs from '#cs';
import _ts from '#ts';

import { iconNames } from '#constants';
import { DATA_TYPE } from '#entities/tabular';

import Header from './Header';
import { handleInvalidCell } from './renderers';
import StringCell from './renderers/StringCell';
import NumberCell from './renderers/NumberCell';
import DateCell from './renderers/DateCell';
import StringFilter from './filters/StringFilter';
import NumberFilter from './filters/NumberFilter';
import DateFilter from './filters/DateFilter';

import styles from './styles.scss';

const Taebul = Searchable(Sortable(ColumnWidth(NormalTaebul)));

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        rows: PropTypes.array,
        options: PropTypes.object,
    }),
    onSheetChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    sheet: {},
};

// FIXME: don't use compareNumber as it is not exactly basic number type
// Try generating actual values which can be used for sorting
const comparators = {
    [DATA_TYPE.string]: compareString,
    [DATA_TYPE.number]: compareNumber,
    [DATA_TYPE.geo]: compareString,
    [DATA_TYPE.datetime]: compareDate,
};

const renderers = {
    [DATA_TYPE.string]: StringCell,
    [DATA_TYPE.geo]: StringCell,
    [DATA_TYPE.number]: handleInvalidCell(NumberCell),
    [DATA_TYPE.datetime]: handleInvalidCell(DateCell),
};

const filterRenderers = {
    [DATA_TYPE.string]: StringFilter,
    [DATA_TYPE.geo]: StringFilter,
    [DATA_TYPE.number]: NumberFilter,
    [DATA_TYPE.datetime]: DateFilter,
};

const emptyObject = {};

export default class TabularSheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    // NOTE: searchTerm is used inside this.headerRendererParams
    calcSheetColumns = memoize((fields, searchTerm) => (
        fields
            .filter(field => !field.hidden)
            .map(field => ({
                key: String(field.id),
                value: field,

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,
                cellRendererParams: this.cellRendererParams,

                cellRenderer: renderers[field.type] || renderers[DATA_TYPE.string],
                comparator: (a, b, d = 1) => comparators[field.type](
                    a[field.id].invalid || a[field.id].empty ? undefined : a[field.id].value,
                    b[field.id].invalid || b[field.id].empty ? undefined : b[field.id].value,
                    d,
                ),
            }))
    ));

    headerRendererParams = ({ column, columnKey }) => {
        const {
            sheet: {
                options: {
                    searchTerm = {},
                } = {},
                fieldsStats: {
                    [columnKey]: {
                        healthBar,
                    },
                },
            },
        } = this.props;

        return {
            columnKey,
            onChange: this.handleFieldValueChange,
            onFilterChange: this.handleFilterChange,
            value: column.value,
            sortOrder: column.sortOrder,
            onSortClick: column.onSortClick,
            className: styles.header,
            statusData: healthBar,
            filterValue: searchTerm[columnKey],
            filterComponent: (
                filterRenderers[column.value.type] || filterRenderers[DATA_TYPE.string]
            ),
        };
    }

    cellRendererParams = ({ datum, column: { value: { type, id, options } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: datum[id].value,
        invalid: datum[id].invalid,
        empty: datum[id].empty,
        options,
    })

    handleFieldValueChange = (key, value) => {
        const { sheet } = this.props;
        const index = sheet.fields.findIndex(c => String(c.id) === key);
        const settings = {
            fields: {
                [index]: { $merge: value },
            },
        };
        const newSheet = update(sheet, settings);
        this.props.onSheetChange(newSheet);
    }

    handleFilterChange = (key, value) => {
        const { sheet } = this.props;
        const settings = {
            options: { $auto: {
                searchTerm: { $auto: {
                    [key]: { $set: value },
                } },
            } },
        };
        const newSheet = update(sheet, settings);
        this.props.onSheetChange(newSheet);
    }

    handleSettingsChange = (settings) => {
        this.props.onSheetChange({
            ...this.props.sheet,
            options: settings,
        });
    }

    handleResetSort = () => {
        const { sheet } = this.props;
        const settings = {
            options: { $auto: {
                sortOrder: { $set: undefined },
            } },
        };
        const newSheet = update(sheet, settings);
        this.props.onSheetChange(newSheet);
    }

    handleSearch = (datum, searchTerm = emptyObject) => {
        const { sheet } = this.props;
        const { fields, options: { searchTerm: oldSearchTerm } = {} } = sheet;
        const columns = this.calcSheetColumns(fields, oldSearchTerm);

        return columns.every((sheetColumn) => {
            const {
                key: columnKey,
                value: {
                    type,
                },
            } = sheetColumn;

            const { value, empty, invalid } = datum[columnKey];

            const searchTermForColumn = searchTerm[columnKey];
            if (searchTermForColumn === undefined) {
                return true;
            }

            if (type === DATA_TYPE.number) {
                const { from, to } = searchTermForColumn;
                if (empty || invalid) {
                    return isFalsyString(from) && isFalsyString(to);
                }
                return (
                    ((isFalsyString(from) && isFalsyString(to)) || isTruthyString(value)) &&
                    (isFalsyString(from) || parseFloat(value) >= parseFloat(from)) &&
                    (isFalsyString(to) || parseFloat(value) <= parseFloat(to))
                );
            } else if (type === DATA_TYPE.datetime) {
                const { from, to } = searchTermForColumn;
                if (empty || invalid) {
                    return isFalsyString(from) && isFalsyString(to);
                }
                return (
                    ((isFalsyString(from) && isFalsyString(to)) || isTruthyString(value)) &&
                    (isFalsyString(from) || new Date(value) >= new Date(from)) &&
                    (isFalsyString(to) || new Date(value) <= new Date(to))
                );
            }
            // NOTE: we can do normal string search for other types
            if (empty) {
                return isFalsyString(searchTermForColumn);
            }
            return caseInsensitiveSubmatch(value, searchTermForColumn);
        });
    };

    render() {
        const { className, sheet } = this.props;
        const { fields, options: { searchTerm } = {} } = sheet;
        const columns = this.calcSheetColumns(fields, searchTerm);

        return (
            <div className={_cs(className, styles.tabularSheet, 'tabular-sheet')}>
                <div className={styles.optionsBar}>
                    <Button
                        iconName={iconNames.more}
                        title="Other Columns"
                    />
                    <Button
                        iconName={iconNames.sort}
                        onClick={this.handleResetSort}
                        title={_ts('tabular', 'resetSortLabel')}
                    />
                </div>
                <Taebul
                    className={styles.table}
                    data={sheet.rows}
                    settings={sheet.options}
                    keySelector={TabularSheet.keySelector}
                    columns={columns}
                    onChange={this.handleSettingsChange}
                    searchFunction={this.handleSearch}
                />
            </div>
        );
    }
}
