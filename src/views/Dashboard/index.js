import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import Numeral from '#rscv/Numeral';
import NormalTaebul from '#rscv/Taebul';
// import Header from '#rscv/Taebul/Header';
// import Cell from '#rscv/Taebul/Cell';
import TextInput from '#rsci/TextInput';
// import MultiSortable from '#rscv/Taebul/MultiSortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import Sortable from '#rscv/Taebul/Sortable';
import Searchable from '#rscv/Taebul/Searchable';
import { compareString, caseInsensitiveSubmatch } from '#rsu/common';
import update from '#rsu/immutable-update';

import { currentUserActiveProjectSelector } from '#redux';
import logo from '#resources/img/deep-logo.svg';
import BoundError from '#rscg/BoundError';
import AppError from '#components/AppError';

import styles from './styles.scss';

const Taebul = ColumnWidth(Searchable(Sortable(NormalTaebul)));

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state, props),
});

@BoundError(AppError)
@connect(mapStateToProps, undefined)
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    static keySelector = datum => datum.id;

    static searchFunction = ({ firstName, lastName }, searchString) => (
        caseInsensitiveSubmatch(firstName, searchString) ||
            caseInsensitiveSubmatch(lastName, searchString)
    )

    constructor(props) {
        super(props);

        const Header = d => (
            <div className={styles.cell}>
                {d.title}
            </div>
        );

        this.columns = [
            {
                key: 'firstName',
                title: 'First Name',

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,

                cellRendererParams: ({ datum, column }) => ({
                    firstName: datum.firstName,
                    width: column.width,
                }),

                cellRenderer: (d) => {
                    const { firstName } = d;

                    return (
                        <div className={styles.cell}>
                            {firstName}
                        </div>
                    );
                },

                comparator: (foo, bar, d) => compareString(foo.firstName, bar.firstName, d),
            },
            {
                key: 'lastName',
                title: 'Last Name',

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,

                cellRendererParams: ({ datum, column }) => ({
                    lastName: datum.lastName,
                    width: column.width,
                }),
                cellRenderer: ({ lastName }) => <div className={styles.cell}>{lastName}</div>,

                comparator: (foo, bar, d) => compareString(foo.lastName, bar.lastName, d),
            },
            {
                key: 'name',
                title: 'Name',

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,

                cellRendererParams: ({ datum, column }) => ({
                    lastName: datum.lastName,
                    firstName: datum.firstName,
                    width: column.width,
                }),
                cellRenderer: ({ lastName, firstName }) => (
                    <div className={styles.cell}>{lastName}, {firstName}</div>
                ),
            },
            {
                key: 'salary',
                title: 'Salary',

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,

                cellRendererParams: ({ datum, column }) => ({
                    value: datum.salary,
                    className: styles.cell,
                    width: column.width,
                }),
                cellRenderer: Numeral,
            },
        ];

        this.state = {
            data: [
                { id: 1, firstName: 'Hari', lastName: 'Subedi', salary: 834792 },
                { id: 2, firstName: 'Shyam', lastName: 'Sundar', salary: 328329 },
                { id: 3, firstName: 'Kiran', lastName: 'Gyawali', salary: 283934 },
                { id: 4, firstName: 'Bibek', lastName: 'Ayer', salary: 28391 },
                { id: 5, firstName: 'Hari', lastName: 'Gyawali', salary: 839292 },
                { id: 6, firstName: 'Hari', lastName: 'Sundar', salary: 3229 },
                { id: 7, firstName: 'Kiran', lastName: 'Subedi', salary: 83934 },
                { id: 8, firstName: 'Bibek', lastName: 'Aryal', salary: 288391 },
            ],
            settings: {
                /*
                sortOrders: {
                    firstName: {
                        key: 'firstName',
                        order: 'dsc',
                        logicalOrder: 1,
                    },
                    lastName: {
                        key: 'lastName',
                        order: 'asc',
                        logicalOrder: 2,
                    },
                },
                */
                sortOrder: {
                    key: 'firstName',
                    order: 'asc',
                },

                searchString: '',

                columnWidths: {
                    firstName: 200,
                    lastName: 200,
                    name: 240,
                    salary: 160,
                },
            },
        };
    }

    headerRendererParams = ({ column, columnKey }) => ({
        title: column.title,
        sortOrder: column.sortOrder,
        onHeaderClick: column.onHeaderClick,
        sortable: column.sortable,
        width: column.width,
        columnKey,
    });

    handleSettingsChange = (settings) => {
        this.setState({ settings });
    }

    handleSearchChange = (text) => {
        this.setState((state) => {
            const settings = {
                settings: {
                    searchString: { $set: text },
                },
            };
            return update(state, settings);
        });
    }

    render() {
        const { currentUserActiveProject } = this.props;

        return (
            <div className={styles.dashboard}>
                <p className={styles.header}>
                    { currentUserActiveProject.title }
                </p>
                <TextInput
                    onChange={this.handleSearchChange}
                    value={this.state.settings.searchString}
                />
                <Taebul
                    data={this.state.data}
                    keySelector={Dashboard.keySelector}
                    columns={this.columns}
                    settings={this.state.settings}
                    onChange={this.handleSettingsChange}
                    searchFunction={Dashboard.searchFunction}
                />
                <div className={styles.content}>
                    <ReactSVG
                        svgClassName={styles.deepLogo}
                        path={logo}
                    />
                    <div className={styles.deepText} >
                        {/* FIXME: Use string */}
                        DEEP Beta
                    </div>
                </div>
            </div>
        );
    }
}
