import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rsci/Faram/FaramList';
import ListView from '#rscv/List/ListView';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ModalFooter from '#rscv/Modal/Footer';
import Faram, { requiredCondition } from '#rsci/Faram';
import { randomString } from '#rsu/common';

import { widgetList } from '#widgets';

import _ts from '#ts';

import WidgetPreview from './WidgetPreview';
import SelectedWidgetItem from './SelectedWidgetItem';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

export default class ConditionalWidgetEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = widget => widget.widgetId;
    static itemKeyExtractor = widget => widget.key;

    static schema = {
        fields: {
            title: [requiredCondition],
            widgets: {
                member: {
                    fields: {
                        title: [requiredCondition],
                        key: [requiredCondition],
                        widgetId: [requiredCondition],
                    },
                },
            },
        },
    }

    constructor(props) {
        super(props);

        const {
            title,
            data: { widgets },
        } = this.props;

        this.state = {
            faramErrors: {},
            faramValues: {
                title,
                widgets,
            },
            pristine: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationSuccess = (_, values) => {
        const {
            title,
            widgets,
        } = values;

        this.props.onSave({ widgets }, title);
    }

    widgetListRendererParams = (key, widget) => {
        const {
            widgetId,
            title,
        } = widget;

        return ({
            widget,
            faramInfoForAdd: {
                newElement: () => ({
                    key: `${widgetId}-${randomString(16)}`,
                    widgetId,
                    title: _ts('widgetTitle', title),
                }),
            },
        });
    }

    itemRendererParams = (key, elem, i) => ({
        index: i,
        title: elem.title,
    });

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const {
            onClose,
            title,
        } = this.props;

        const titleInputLabel = _ts('widgets.editor.number', 'titleLabel');
        const titleInputPlaceholder = _ts('widgets.editor.number', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('widgets.editor.number', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.number', 'saveButtonLabel');

        return (
            <Modal>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={ConditionalWidgetEdit.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.modalBody} >
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            className={styles.textInput}
                            autoFocus
                            selectOnFocus
                        />
                        <div className={styles.widgetsContainer}>
                            <FaramList faramElementName="widgets">
                                <div className={styles.leftContainer}>
                                    <header className={styles.header}>
                                        {/* FIXME: Use strings */}
                                        widgets
                                    </header>
                                    <ListView
                                        className={styles.widgetList}
                                        data={widgetList}
                                        renderer={WidgetPreview}
                                        keyExtractor={ConditionalWidgetEdit.keyExtractor}
                                        rendererParams={this.widgetListRendererParams}
                                    />
                                </div>
                                <div className={styles.rightContainer}>
                                    <header className={styles.header}>
                                        {/* FIXME: Use strings */}
                                        Added Widgets
                                    </header>
                                    <SortableListView
                                        className={styles.editList}
                                        dragHandleClassName={styles.dragHandle}
                                        faramElement
                                        keyExtractor={ConditionalWidgetEdit.itemKeyExtractor}
                                        rendererParams={this.itemRendererParams}
                                        itemClassName={styles.sortableUnit}
                                        renderer={SelectedWidgetItem}
                                    />
                                </div>
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
