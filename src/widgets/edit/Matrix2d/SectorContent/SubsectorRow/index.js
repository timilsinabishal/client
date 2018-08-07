import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rsci/Faram/FaramGroup';
import TextInput from '#rsci/TextInput';

import { iconNames } from '#constants';

import styles from './styles.scss';

const SubsectorRow = ({ index }) => (
    <div className={styles.subsectorRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="title"
                autoFocus
                // FIXME: use strings
                label={`Subsector ${index + 1}`}
            />
            <TextInput
                className={styles.input}
                faramElementName="tooltip"
                // FIXME: use strings
                label="Tooltip"
            />
        </FaramGroup>
        <DangerButton
            className={styles.deleteButton}
            iconName={iconNames.delete}
            faramAction="remove"
            // FIXME: use strings
            title="Remove Subsectors"
            faramElementIndex={index}
            transparent
        />
    </div>
);

SubsectorRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubsectorRow;
