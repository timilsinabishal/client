import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import Numeral from '#rscv/Numeral';
import NormalTaebul from '#rscv/Taebul';
import TextInput from '#rsci/TextInput';
// import MultiSortable from '#rscv/Taebul/MultiSortable';
import Sortable from '#rscv/Taebul/Sortable';
import Searchable from '#rscv/Taebul/Searchable';
import { compareString, caseInsensitiveSubmatch } from '#rsu/common';
import update from '#rsu/immutable-update';

import { currentUserActiveProjectSelector } from '#redux';
import logo from '#resources/img/deep-logo.svg';
import BoundError from '#rscg/BoundError';
import AppError from '#components/AppError';

import styles from './styles.scss';

const Taebul = Searchable(Sortable(NormalTaebul));

const Header = ({ title, sortOrder, onHeaderClick, columnKey, sortable }) => {
    if (!sortable) {
        return (
            <div className={styles.cell}>
                {title}
            </div>
        );
    }

    let symbol;
    switch (sortOrder) {
        case 'asc': {
            symbol = 'v';
            break;
        }
        case 'dsc': {
            symbol = '^';
            break;
        }
        default: {
            symbol = '';
            break;
        }
    }

    const handleButtonClick = () => {
        onHeaderClick(columnKey);
    };

    return (
        <div className={styles.cell}>
            <button onClick={handleButtonClick} type="button">
                {symbol} {title}
            </button>
        </div>
    );
};

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

        this.columns = [
            {
                key: 'firstName',
                title: 'First Name',

                cellRendererParams: ({ datum }) => ({ firstName: datum.firstName }),
                cellRenderer: ({ firstName }) => <div className={styles.cell}>{firstName}</div>,

                comparator: (foo, bar, d) => compareString(foo.firstName, bar.firstName, d),
            },
            {
                key: 'lastName',
                title: 'Last Name',

                cellRendererParams: ({ datum }) => ({ lastName: datum.lastName }),
                cellRenderer: ({ lastName }) => <div className={styles.cell}>{lastName}</div>,

                comparator: (foo, bar, d) => compareString(foo.lastName, bar.lastName, d),
            },
            {
                key: 'name',
                title: 'Name',

                cellRendererParams: ({ datum }) => ({
                    lastName: datum.lastName,
                    firstName: datum.firstName,
                }),
                cellRenderer: ({ lastName, firstName }) => (
                    <div className={styles.cell}>{lastName}, {firstName}</div>
                ),
            },
            {
                key: 'salary',
                title: 'Salary',

                cellRendererParams: ({ datum }) => ({
                    value: datum.salary, className: styles.cell,
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
            },
        };
    }

    headerRendererParams = ({ column, columnKey }) => ({
        title: column.title,
        sortOrder: column.sortOrder,
        onHeaderClick: column.onHeaderClick,
        sortable: column.sortable,
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
                    headerRendererParams={this.headerRendererParams}
                    headerRenderer={Header}
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
