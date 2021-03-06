import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rscg/FaramList';
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
import Faram, { requiredCondition } from '#rscg/Faram';
import { randomString } from '#rsu/common';
import { iconNames } from '#constants';
import _ts from '#ts';

import { widgetList } from '#widgets/conditionalWidget';
import { widgetListingVisibility } from '#widgets';

import WidgetPreview from './WidgetPreview';
import SelectedWidgetItem from './SelectedWidgetItem';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    properties: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

export default class ConditionalWidgetEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.widgetId;
    static itemKeyExtractor = ({ widget }) => widget.key;

    static schema = {
        fields: {
            title: [requiredCondition],
            widgets: {
                keySelector: ConditionalWidgetEdit.itemKeyExtractor,
                member: {
                    fields: {
                        widget: {
                            fields: {
                                title: [requiredCondition],
                                key: [requiredCondition],
                                widgetId: [requiredCondition],
                                properties: [],
                            },
                        },
                        conditions: [],
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
            properties: { addedFrom },
        } = this.props;

        this.state = {
            faramErrors: {},
            faramValues: {
                title,
                widgets,
            },
            pristine: false,
            disableEverything: false,
        };

        this.widgets = widgetList.filter(
            w => widgetListingVisibility(w.widgetId, addedFrom),
        );
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

    handleModalVisibilityChange = (disableEverything) => {
        this.setState({ disableEverything });
    }

    widgetListRendererParams = (key, widget) => {
        const { title } = widget;

        return ({
            title: _ts('widgetTitle', title),
            widget,
            widgetKey: key,
            createNewElement: widgetData => ({
                widget: {
                    key: `${widgetData.widgetId}-${randomString(16)}`.toLowerCase(),
                    widgetId: widgetData.widgetId,
                    title: _ts('widgetTitle', title),
                    properties: {},
                },
                conditions: {
                    list: [],
                    operator: 'AND',
                },
            }),
        });
    }

    itemRendererParams = (key, elem, i) => ({
        index: i,
        item: elem,
        onModalVisibilityChange: this.handleModalVisibilityChange,
    });

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            disableEverything,
        } = this.state;

        const {
            onClose,
            title,
        } = this.props;

        const titleInputLabel = _ts('widgets.editor.conditional', 'titleLabel');
        const titleInputPlaceholder = _ts('widgets.editor.conditional', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('widgets.editor.conditional', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.conditional', 'saveButtonLabel');
        const widgetsTitle = _ts('widgets.editor.conditional', 'widgetsTitle');
        const addedWidgetsTitle = _ts('widgets.editor.conditional', 'addedWidgetsTitle');

        const widgetsHeaderInfo = _ts('widgets.editor.conditional', 'supportedWidgetsInfoText');
        const addedWidgetsHeaderInfo = _ts('widgets.editor.conditional', 'addedWidgetsHeaderInfoText');

        const modalClassNames = [styles.modal];
        if (disableEverything) {
            modalClassNames.push(styles.disabledEverything);
        }

        return (
            <Modal className={modalClassNames.join(' ')}>
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
                            <FaramList
                                faramElementName="widgets"
                                keySelector={ConditionalWidgetEdit.itemKeyExtractor}
                            >
                                <div className={styles.leftContainer}>
                                    <header className={styles.header}>
                                        {widgetsTitle}
                                        <span
                                            className={`${iconNames.info} ${styles.headerInfo}`}
                                            title={widgetsHeaderInfo}
                                        />
                                    </header>
                                    <ListView
                                        className={styles.widgetList}
                                        data={this.widgets}
                                        renderer={WidgetPreview}
                                        keySelector={ConditionalWidgetEdit.keySelector}
                                        rendererParams={this.widgetListRendererParams}
                                    />
                                </div>
                                <div className={styles.rightContainer}>
                                    <header className={styles.header}>
                                        {addedWidgetsTitle}
                                        <span
                                            className={`${iconNames.info} ${styles.headerInfo}`}
                                            title={addedWidgetsHeaderInfo}
                                        />
                                    </header>
                                    <SortableListView
                                        className={styles.editList}
                                        dragHandleClassName={styles.dragHandle}
                                        faramElement
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
