import React from 'react';
import PropTypes from 'prop-types';

import List from '#rscv/List';

import Cell from './Cell';


const propTypes = {
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    subdimension: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
    rowStyle: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    children: undefined,
    subdimension: {},
    sectors: [],
};

export default class SubdimensionRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = sector => sector.id;

    rendererParams = (key) => {
        const {
            subdimension, // eslint-disable-line no-unused-vars
            sectors, // eslint-disable-line no-unused-vars
            rowStyle, // eslint-disable-line no-unused-vars
            children, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;
        return {
            sectorId: key,
            ...otherProps,
        };
    }

    render() {
        const {
            subdimension,
            sectors,
            rowStyle,
            children,
        } = this.props;

        return (
            <tr style={rowStyle}>
                { children }
                <td title={subdimension.tooltip}>
                    {subdimension.title}
                </td>
                <List
                    data={sectors}
                    keySelector={SubdimensionRow.keySelector}
                    renderer={Cell}
                    rendererParams={this.rendererParams}
                />
            </tr>
        );
    }
}

