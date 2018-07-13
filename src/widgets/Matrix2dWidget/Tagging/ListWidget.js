import React from 'react';
import PropTypes from 'prop-types';

import update from '#rs/utils/immutable-update';
import ListView from '#rs/components/View/List/ListView';
import MultiSelectInput from '#rs/components/Input/MultiSelectInput';
import BoundError from '#rs/components/General/BoundError';

import _ts from '#ts';
import WidgetError from '#components/WidgetError';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];

@BoundError(WidgetError)
export default class Matrix2dList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static subsectorKeySelector = d => d.id;
    static subsectorLabelSelector = d => d.title;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getSelectedSectors = (data, attribute) => {
        const selectedSectors = [];

        data.dimensions.forEach((dimension) => {
            const dimensionAttribute = attribute[dimension.id];

            if (dimensionAttribute) {
                dimension.subdimensions.forEach((subdimension) => {
                    const subdimensionAttribute = dimensionAttribute[subdimension.id];

                    if (subdimensionAttribute) {
                        data.sectors.forEach((sector) => {
                            const sectorAttribute = subdimensionAttribute[sector.id];

                            if (sectorAttribute) {
                                const sectorAttributeWithTitle = sectorAttribute.map(
                                    (d) => {
                                        const index = sector.subsectors.findIndex(s => s.id === d);

                                        return ({
                                            key: d,
                                            title: (sector.subsectors[index] || {}).title,
                                        });
                                    },
                                );

                                selectedSectors.push({
                                    sector,
                                    dimension,
                                    subdimension,
                                    subsectors: sectorAttribute,
                                    subsectorsWithTitle: sectorAttributeWithTitle,
                                    key: `${sector.id}-${dimension.id}-${subdimension.id}`,
                                });
                            }
                        });
                    }
                });
            }
        });
        return selectedSectors;
    }

    handleSelectSubsectorChange = (dimensionId, subdimensionId, sectorId, subsectors) => {
        const {
            attribute,
            api,
            id,
            entryId,
        } = this.props;

        const settings = { $auto: {
            [dimensionId]: { $auto: {
                [subdimensionId]: { $auto: {
                    [sectorId]: { $auto: {
                        $set: subsectors,
                    } },
                } },
            } },
        } };

        const newAttribute = update(attribute, settings);

        api.getEntryModifier(entryId)
            .setAttribute(id, newAttribute)
            .apply();
    }

    renderTagUnit = (key, data) => (
        <div
            key={key}
            className={styles.tagUnit}
        >
            <div className={styles.tagDimension} >
                <div className={styles.dimensionTitle}>
                    {data.dimension.title}
                </div>
                <div className={styles.subdimensionTitle}>
                    {data.subdimension.title}
                </div>
            </div>
            <div className={styles.tagSector}>
                <div className={styles.title}>
                    {data.sector.title}
                </div>
                <MultiSelectInput
                    value={data.subsectors}
                    options={data.sector.subsectors}
                    keySelector={Matrix2dList.subsectorKeySelector}
                    labelSelector={Matrix2dList.subsectorLabelSelector}
                    placeholder={_ts('framework.matrix2dWidget', 'subsectorsLabel')}
                    label={_ts('framework.matrix2dWidget', 'subsectorsLabel')}
                    showHintAndError={false}
                    onChange={(subsectors) => {
                        this.handleSelectSubsectorChange(
                            data.dimension.id,
                            data.subdimension.id,
                            data.sector.id,
                            subsectors,
                        );
                    }}
                />
            </div>
        </div>
    )

    render() {
        const {
            data,
            attribute,
        } = this.props;
        const selectedSectors = this.getSelectedSectors(data, attribute) || emptyList;

        return (
            <ListView
                keyExtractor={Matrix2dList.rowKeyExtractor}
                data={selectedSectors}
                modifier={this.renderTagUnit}
                className={styles.list}
            />
        );
    }
}
