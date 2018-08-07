import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rsci/Faram/FaramList';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rsci/Faram';
import { findDuplicates, randomString } from '#rsu/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
};

const defaultProps = {
    data: {},
};

export default class MultiSelectEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            options: {
                validation: (options) => {
                    const errors = [];
                    if (!options || options.length <= 0) {
                        errors.push(_ts('framework', 'atLeastOneError'));
                    }

                    const duplicates = findDuplicates(options, o => o.label);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'framework',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                member: {
                    fields: {
                        label: [requiredCondition],
                        key: [requiredCondition],
                    },
                },
            },
        },
    };

    static faramInfoForAdd = {
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            label: '',
        }),
    }

    static keyExtractor = elem => elem.key;

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    constructor(props) {
        super(props);

        const {
            title,
            data: { options },
        } = props;
        this.state = {
            faramValues: { title, options },
            faramErrors: {},
            pristine: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const { title, ...otherProps } = faramValues;
        this.props.onSave(otherProps, title);
    };

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

        const cancelButtonLabel = 'Cancel';
        const saveButtonLabel = 'Save';

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={MultiSelectEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors
                            className={styles.nonFieldErrors}
                            faramElement
                        />
                        <TextInput
                            faramElementName="title"
                            className={styles.title}
                            autoFocus
                            selectOnFocus
                            label={_ts('framework.excerptWidget', 'titleLabel')}
                            placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
                        />
                        <div className={styles.optionInputs} >
                            <FaramList faramElementName="options">
                                <NonFieldErrors
                                    className={styles.nonFieldErrors}
                                    faramElement
                                />
                                <header className={styles.header}>
                                    <h4>
                                        {_ts('framework.multiselectWidget', 'optionsHeader')}
                                    </h4>
                                    <PrimaryButton
                                        iconName={iconNames.add}
                                        faramAction="add"
                                        faramInfo={MultiSelectEditWidget.faramInfoForAdd}
                                        transparent
                                    >
                                        {_ts('framework.multiselectWidget', 'addOptionButtonLabel')}
                                    </PrimaryButton>
                                </header>
                                <SortableListView
                                    className={styles.editList}
                                    dragHandleClassName={styles.dragHandle}
                                    faramElement
                                    keyExtractor={MultiSelectEditWidget.keyExtractor}
                                    rendererParams={MultiSelectEditWidget.rendererParams}
                                    itemClassName={styles.sortableUnit}
                                    renderer={InputRow}
                                />
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