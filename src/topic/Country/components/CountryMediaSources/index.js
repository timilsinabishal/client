import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    iso: PropTypes.string.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class CountryMediaSources extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { iso } = this.props;
        return (
            <div>Media Sources {iso}</div>
        );
    }
}
