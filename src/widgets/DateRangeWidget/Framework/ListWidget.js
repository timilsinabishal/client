import PropTypes from 'prop-types';
import React from 'react';

import DateInput from '#rs/components/Input/DateInput';
import TextInput from '#rs/components/Input/TextInput';
import Button from '#rs/components/Action/Button';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import BoundError from '#rs/components/General/BoundError';

import WidgetError from '#components/WidgetError';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

@BoundError(WidgetError)
export default class DateFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            title,
            editAction,
        } = props;

        this.state = {
            showEditModal: false,
            title,
        };
        editAction(this.handleEdit);
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleEditModalCancelButtonClick = () => {
        const {
            title,
        } = this.props;

        this.setState({
            showEditModal: false,
            title,
        });
    }

    handleEditModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { onChange } = this.props;
        const {
            title,
        } = this.state;
        onChange(undefined, title);
    }

    renderEditModal = () => {
        const {
            showEditModal,
            title: titleValue,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('framework.dateRangeWidget', 'editTitleModalHeader');
        const titleInputLabel = _ts('framework.dateRangeWidget', 'titleLabel');
        const titleInputPlaceholder = _ts('framework.dateRangeWidget', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('framework.dateRangeWidget', 'cancelButtonLabel');
        const saveButtonLabel = _ts('framework.dateRangeWidget', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <ModalHeader title={headerTitle} />
                <ModalBody>
                    <TextInput
                        autoFocus
                        label={titleInputLabel}
                        onChange={this.handleWidgetTitleChange}
                        placeholder={titleInputPlaceholder}
                        selectOnFocus
                        showHintAndError={false}
                        value={titleValue}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleEditModalCancelButtonClick}>
                        {cancelButtonLabel}
                    </Button>
                    <PrimaryButton onClick={this.handleEditModalSaveButtonClick}>
                        {saveButtonLabel}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const EditModal = this.renderEditModal;

        return (
            <div className={styles.list}>
                <DateInput
                    className={styles.dateInput}
                    onChange={this.noop}
                    showHintAndError={false}
                    disabled
                />
                <span
                    className={styles.to}
                >
                    {/* FIXME: use strings */}
                    to
                </span>
                <DateInput
                    className={styles.dateInput}
                    onChange={this.noop}
                    showHintAndError={false}
                    disabled
                />
                <EditModal />
            </div>
        );
    }
}