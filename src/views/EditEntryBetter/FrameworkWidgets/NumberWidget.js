import React from 'react';
// import PropTypes from 'prop-types';

import NumberInput from '#rs/components/Input/NumberInput';

import _ts from '#ts';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class NumberWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const separatorText = ' ';
        return (
            <div>
                <NumberInput
                    faramElementName="value"
                    // faramInfo={{ action: 'newEntry' }}
                    placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                    showLabel={false}
                    separator={separatorText}
                />
            </div>
        );
    }
}
