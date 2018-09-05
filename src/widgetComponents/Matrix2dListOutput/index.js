import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import { FaramOutputElement } from '#rscg/FaramElements';
import { listToMap } from '#rsu/common';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    dimensions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    dimensions: [],
    sectors: [],
    value: undefined,
};

const getSelectedSectors = (dimensions = [], sectors = [], value) => {
    const selectedSectors = [];

    if (!value) {
        return selectedSectors;
    }

    dimensions.forEach((dimension) => {
        const dimensionAttribute = value[dimension.id];
        if (!dimensionAttribute) {
            return;
        }

        dimension.subdimensions.forEach((subdimension) => {
            const subdimensionAttribute = dimensionAttribute[subdimension.id];
            if (!subdimensionAttribute) {
                return;
            }

            sectors.forEach((sector) => {
                const sectorAttribute = subdimensionAttribute[sector.id];
                if (!sectorAttribute) {
                    return;
                }

                const subsectorsMap = listToMap(
                    sector.subsectors,
                    subsector => subsector.id,
                    subsector => subsector,
                );

                selectedSectors.push({
                    key: `${sector.id}-${dimension.id}-${subdimension.id}`,
                    dimension,
                    subdimension,
                    sector,
                    subsectors: sectorAttribute.map(key => subsectorsMap[key]),
                });
            });
        });
    });
    return selectedSectors;
};

@FaramOutputElement
export default class Matrix2dListOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    rendererParams = (key, row) => ({
        dimension: row.dimension,
        subdimension: row.subdimension,
        sector: row.sector,
        subsectors: row.subsectors,
    })

    render() {
        const {
            dimensions,
            sectors,
            value,
            className: classNameFromProps,
        } = this.props;

        const data = getSelectedSectors(dimensions, sectors, value);

        const className = `
            ${classNameFromProps}
            ${styles.list}
        `;

        return (
            <ListView
                className={className}
                data={data}
                renderer={Row}
                rendererParams={this.rendererParams}
                keyExtractor={Matrix2dListOutput.rowKeyExtractor}
            />
        );
    }
}
