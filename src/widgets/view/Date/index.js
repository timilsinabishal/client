import React from 'react';
import PropTypes from 'prop-types';

import NormalFormattedDate from '#rscv/FormattedDate';
import { FaramOutputElement } from '#rscg/FaramElements';

import styles from './styles.scss';

const FormattedDate = FaramOutputElement(NormalFormattedDate);

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class DateListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.dateOutput}
        `;

        return (
            <div className={className} >
                <FormattedDate
                    faramElementName="value"
                    showLabel={false}
                    mode="dd-MM-yyyy"
                />
            </div>
        );
    }
}
