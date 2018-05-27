import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '#rs/utils/common';
import Table from '#rs/components/View/Table';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import {
    linkCollectionSelector,
} from '#redux';

import { iconNames } from '#constants';

import DeleteConfirm from '../../DeleteConfirm';
import EditLinkModal from './EditLinkModal';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    linkCollection: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    linkCollection: linkCollectionSelector(state, props),
});

@connect(mapStateToProps)
export default class LinksTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;

    constructor(props) {
        super(props);

        this.state = {
            editLinkId: undefined,
            deleteLinkId: undefined,
            showDeleteLinkConfirmModal: false,
            showEditLinkModal: false,
        };

        this.linksTableHeader = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.id, b.id),
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
                key: 'stringId',
                label: 'String Id',
                order: 3,
                sortable: false,
            },
            {
                key: 'refs',
                label: 'Refs',
                order: 4,
                sortable: true,
                comparator: (a, b) => compareNumber(a.refs, b.refs),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: data => (
                    <Fragment>
                        <WarningButton
                            onClick={() => { this.handleEditButtonClick(data.stringId); }}
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

        this.linksTableDefaultSort = {
            key: 'id',
            order: 'asc',
        };
    }

    handleEditButtonClick = (id) => {
        this.setState({
            editLinkId: id,
            showEditLinkModal: true,
        });
    }

    handleDeleteButtonClick = (id) => {
        this.setState({
            deleteLinkId: id,
            showDeleteLinkConfirmModal: true,
        });
    }

    handleDeleteLinkConfirmClose = () => {
        this.setState({ showDeleteLinkConfirmModal: false });
    }

    handleEditLinkModalClose = () => {
        this.setState({ showEditLinkModal: false });
    }

    render() {
        const { linkCollection } = this.props;
        const {
            showDeleteLinkConfirmModal,
            deleteLinkId,
            showEditLinkModal,
            editLinkId,
        } = this.state;

        return (
            <React.Fragment>
                <Table
                    className={styles.linksTable}
                    data={linkCollection}
                    headers={this.linksTableHeader}
                    keyExtractor={LinksTable.keyExtractor}
                    defaultSort={this.linksTableDefaultSort}
                />
                <DeleteConfirm
                    show={showDeleteLinkConfirmModal}
                    deleteId={deleteLinkId}
                    type="link"
                    onClose={this.handleDeleteLinkConfirmClose}
                />
                { showEditLinkModal &&
                    <EditLinkModal
                        editLinkId={editLinkId}
                        onClose={this.handleEditLinkModalClose}
                    />
                }
            </React.Fragment>
        );
    }
}
