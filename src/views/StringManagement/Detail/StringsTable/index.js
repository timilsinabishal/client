import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import Table from '#rs/components/View/Table';
import {
    compareBoolean,
    compareNumber,
    compareString,
    compareStringAsNumber,
    compareStringByWordCount,
} from '#rs/utils/common';

import { iconNames } from '#constants';
import { allStringsSelector } from '#redux';

import DeleteConfirm from '../../DeleteConfirm';
import EditStringModal from './EditStringModal';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    allStrings: allStringsSelector(state),
});

@connect(mapStateToProps)
export default class StringsTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;

    constructor(props) {
        super(props);

        this.state = {
            editStringId: undefined,
            deleteStringId: undefined,
            showDeleteStringConfirmModal: false,
            showEditStringModal: false,
        };

        this.stringsTableHeader = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareStringAsNumber(a.id, b.id),
            },
            {
                key: 'string',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
            },
            {
                key: 'refs',
                label: 'Refs',
                order: 3,
                sortable: true,
                comparator: (a, b) => compareNumber(a.refs, b.refs),
            },
            {
                key: 'duplicates',
                label: 'Duplicates',
                order: 4,
                sortable: true,
                comparator: (a, b) => (
                    compareBoolean(!!a.duplicates, !!b.duplicates, -1) ||
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
                modifier: a => (a.duplicates ? a.duplicates : '-'),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: data => (
                    <Fragment>
                        <WarningButton
                            onClick={() => { this.handleEditButtonClick(data.id); }}
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                        />
                        <DangerButton
                            onClick={() => { this.handleDeleteButtonClick(data.id); }}
                            iconName={iconNames.delete}
                            transparent
                            smallVerticalPadding
                        />
                    </Fragment>
                ),
            },
        ];

        this.stringsTableDefaultSort = {
            key: 'string',
            order: 'asc',
        };
    }

    handleEditButtonClick = (stringId) => {
        this.setState({
            editStringId: stringId,
            showEditStringModal: true,
        });
    }

    handleDeleteButtonClick = (stringId) => {
        this.setState({
            deleteStringId: stringId,
            showDeleteStringConfirmModal: true,
        });
    }

    handleDeleteStringConfirmClose = () => {
        this.setState({
            showDeleteStringConfirmModal: false,
        });
    }

    handleEditStringClose = (status, id, value) => {
        if (status) {
            // TODO: update string
            // updateString({ id, value });
            console.warn('change string', id, value);
        }

        this.setState({
            showEditStringModal: false,
        });
    }

    render() {
        const { allStrings } = this.props;
        const {
            showDeleteStringConfirmModal,
            deleteStringId,
            editStringId,
            showEditStringModal,
        } = this.state;

        return (
            <React.Fragment>
                <Table
                    className={styles.stringsTable}
                    data={allStrings}
                    headers={this.stringsTableHeader}
                    keyExtractor={StringsTable.keyExtractor}
                    defaultSort={this.stringsTableDefaultSort}
                />
                <DeleteConfirm
                    show={showDeleteStringConfirmModal}
                    deleteId={deleteStringId}
                    type="all"
                    onClose={this.handleDeleteStringConfirmClose}
                />
                <EditStringModal
                    show={showEditStringModal}
                    editStringId={editStringId}
                    onClose={this.handleEditStringClose}
                />
            </React.Fragment>
        );
    }
}
