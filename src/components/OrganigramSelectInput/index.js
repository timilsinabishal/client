import PropTypes from 'prop-types';
import React from 'react';

import OrgChart from '#rscz/OrgChart';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import HintAndError from '#rsci/HintAndError';
import { FaramInputElement } from '#rscg/FaramElements';

import { iconNames } from '#constants';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),

    childrenSelector: PropTypes.func,
    labelSelector: PropTypes.func.isRequired,
    idSelector: PropTypes.func,

    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    showHintAndError: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    showLabel: true,
    onChange: undefined,
    value: undefined,

    childrenSelector: d => d.children,
    labelSelector: d => d.name,
    idSelector: d => d.id,

    disabled: false,
    error: '',
    hint: '',
    showHintAndError: true,
};

@FaramInputElement
export default class OrganigramSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            showOrgModal: false,
        };

        this.processData(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }

        if (nextProps.data !== this.props.data) {
            this.processData(nextProps);
        }
    }

    getClassName = () => {
        const { className, error, disabled } = this.props;
        const classNames = [
            className,
            styles.organigramSelectInput,
            'organigram-select-input',
        ];

        if (error) {
            classNames.push('error');
            classNames.push(styles.error);
        }

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        return classNames.join(' ');
    }

    processData = ({ data, idSelector, labelSelector, childrenSelector }) => {
        this.idLabels = {};
        this.processNode(data[0], idSelector, labelSelector, childrenSelector);
    }

    processNode = (node, idSelector, labelSelector, childrenSelector) => {
        if (!node) {
            return;
        }

        this.idLabels[idSelector(node)] = labelSelector(node);
        const children = childrenSelector(node);
        children.forEach(c => this.processNode(c, idSelector, labelSelector, childrenSelector));
    }

    handleCancelClick = () => {
        const { value } = this.props;
        this.setState({ showOrgModal: false, value });
    }

    handleApplyClick = () => {
        const { value } = this.state;
        const { onChange } = this.props;

        this.setState({ showOrgModal: false }, () => {
            if (onChange) {
                onChange(value);
            }
        });
    }

    handleShowModal = () => {
        this.setState({ showOrgModal: true });
    }

    handleOrgSelection = (value) => {
        this.setState({ value });
    }

    renderOrgModal = () => {
        const {
            label,
            data,
            idSelector,
            labelSelector,
            childrenSelector,
            value,
        } = this.props;
        const { showOrgModal } = this.state;

        if (!showOrgModal) {
            return null;
        }

        return (
            <Modal>
                <ModalHeader title={label} />
                <ModalBody>
                    <OrgChart
                        data={data}
                        labelSelector={this.labelSelector}
                        idSelector={this.idSelector}
                        childSelector={this.childSelector}
                        onSelection={this.handleSelection}
                        value={this.state.values}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        Cancel
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    renderValue = () => {
        const { value, labelSelector } = this.props;
        const { idLabels } = this;

        if (value === undefined) {
            return (
                <div className={`${styles.undefined} ${styles.value}`}>
                    Select a value
                </div>
            );
        }

        return (
            <div className={styles.value}>
                { idLabels[value] }
            </div>
        );
    }

    renderLabel = () => {
        const {
            showLabel,
            label,
        } = this.props;

        if (!showLabel) {
            return null;
        }

        const classNames = [
            'label',
            styles.label,
        ];

        return (
            <div className={classNames.join(' ')}>
                { label }
            </div>
        );
    }

    render() {
        const {
            showHintAndError,
            hint,
            error,
        } = this.props;
        const OrgModal = this.renderOrgModal;
        const Value = this.renderValue;

        const Label = this.renderLabel;

        return (
            <div className={this.getClassName()}>
                <Label />
                <div className={styles.input}>
                    <Value />
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.chart}
                        onClick={this.handleShowModal}
                        transparent
                    />
                </div>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
                <OrgModal />
            </div>
        );
    }
}
