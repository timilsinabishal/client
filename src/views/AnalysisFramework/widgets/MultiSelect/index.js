import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import FaramList from '#rs/components/Input/Faram/FaramList';
import List from '#rs/components/View/List';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import Faram, { requiredCondition } from '#rs/components/Input/Faram';
import { randomString, unique } from '#rs/utils/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const InputRow = ({ index }) => (
    <div className={styles.sortableUnit}>
        <FaramGroup
            faramElementName={String(index)}
        >
            <TextInput
                className={styles.titleInput}
                faramElementName="label"
                autoFocus
                label="Title"
                placeholder={`Option ${index + 1}`}
            />
        </FaramGroup>
        <DangerButton
            className={styles.deleteButton}
            iconName={iconNames.delete}
            faramAction="remove"
            faramElementIndex={index}
        />
    </div>
);

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
                        // FIXME: use strings
                        errors.push('There should be at least one option.');
                    } else if (options && unique(options, o => o.label).length !== options.length) {
                        errors.push('Duplicate options are not allowed.');
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
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            autoFocus
                            label={_ts('framework.excerptWidget', 'titleLabel')}
                            placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
                            selectOnFocus
                            className={styles.titleInput}
                        />
                        <div className={styles.optionInputs} >
                            <FaramList faramElementName="options">
                                <NonFieldErrors faramElement />
                                <header className={styles.header}>
                                    <h3>
                                        Options
                                    </h3>
                                    <PrimaryButton
                                        faramAction="add"
                                        faramInfo={{
                                            newElement: () => ({
                                                key: randomString(16).toLowerCase(),
                                                label: '',
                                            }),
                                        }}
                                        iconName={iconNames.add}
                                    />
                                </header>
                                <div className={styles.editOptionList}>
                                    <List
                                        faramElement
                                        keyExtractor={elem => elem.key}
                                        rendererParams={(key, elem, i) => ({ index: i })}
                                        renderer={InputRow}
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
