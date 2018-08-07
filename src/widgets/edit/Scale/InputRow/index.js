import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rsci/Faram/FaramGroup';
import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class InputRow extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { index } = this.props;
        return (
            <div className={styles.inputContainer}>
                <FaramGroup
                    faramElementName={String(index)}
                >
                    <ColorInput
                        className={styles.colorInput}
                        faramElementName="color"
                        label={_ts('framework.scaleWidget', 'colorLabel')}
                    />
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="label"
                        label={_ts('framework.scaleWidget', 'inputLabel', { index: index + 1 })}
                        placeholder={_ts('framework.scaleWidget', 'titlePlaceholderScale')}
                        autoFocus
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    title={_ts('framework.scaleWidget', 'removeButtonTitle')}
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}