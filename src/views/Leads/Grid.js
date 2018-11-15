import React from 'react';
import PropTypes from 'prop-types';
import Masonry from '#components/Masonry';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { isArrayEqual } from '#rsu/common';
import LeadItem from './GridItem';
import styles from './styles.scss';

const propTypes = {
    loading: PropTypes.bool,
    onEndReached: PropTypes.func.isRequired,
    leads: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    loading: false,
    leads: [],
};

export default class LeadGrid extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // simple comparision using id and their position to
    // check if we should recompute the layout
    // we can add thumbnail url check too if the leads data
    // is updated in realtime using websockets
    static compareLeads = (a, b) => {
        const aKeys = a.map(r => r.id);
        const bKeys = b.map(r => r.id);

        return isArrayEqual(aKeys, bKeys);
    };

    constructor(props) {
        super(props);

        this.columnWidth = 300;
        this.columnGutter = 40;

        this.itemState = {
            width: this.columnWidth,
            minHeight: 295,
        };

        this.masonryRef = {};
    }

    onReference = (ref) => {
        this.masonryRef = ref;
    }

    render() {
        const { loading, onEndReached, leads, ...otherProps } = this.props;

        return (
            <Masonry
                ref={this.onReference}
                items={leads}
                itemComponent={LeadItem}
                containerClassName={styles.leadGrids}
                alignCenter
                loadingElement={
                    <LoadingAnimation large />
                }
                scrollAnchor={this.masonryRef.node}
                columnWidth={this.columnWidth}
                columnGutter={this.columnGutter}
                compareItems={LeadGrid.compareLeads}
                hasMore
                isLoading={loading}
                onInfiniteLoad={onEndReached}
                state={this.itemState}
                otherItemProps={otherProps}
            />
        );
    }
}
