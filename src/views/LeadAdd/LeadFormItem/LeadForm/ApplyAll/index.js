import PropTypes from 'prop-types';
import React from 'react';

import AccentConfirmButton from '#rsca/ConfirmButton/AccentConfirmButton';
import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

import _ts from '#ts';
import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    identiferName: PropTypes.string.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class ApplyAll extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            disabled,
            children,
            identiferName,
            onApplyAllClick,
            onApplyAllBelowClick,
        } = this.props;

        return (
            <div className={`${styles.applyInput} ${className}`}>
                { children }
                <div className={styles.applyButtons}>
                    <AccentConfirmButton
                        className={styles.applyButton}
                        transparent
                        title={_ts('addLeads', 'applyAllButtonTitle')}
                        disabled={disabled}
                        onClick={() => onApplyAllClick(identiferName)}
                        tabIndex="-1"
                        iconName={iconNames.applyAll}
                        confirmationMessage={_ts('addLeads', 'applyToAll')}
                    />
                    <WarningConfirmButton
                        className={styles.applyButton}
                        transparent
                        title={_ts('addLeads', 'applyAllBelowButtonTitle')}
                        disabled={disabled}
                        onClick={() => onApplyAllBelowClick(identiferName)}
                        tabIndex="-1"
                        iconName={iconNames.applyAllBelow}
                        confirmationMessage={_ts('addLeads', 'applyToAllBelow')}
                    />
                </div>
            </div>
        );
    }
}

export { default as ExtractThis } from './ExtractThis';
