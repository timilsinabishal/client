import React from 'react';
import PropTypes from 'prop-types';
import Masonry from '#components/Masonry';
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

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    render() {
        const { loading, onEndReached, leads, ...otherProps } = this.props;

        const columnWidth = 280;
        const columnGutter = 40;

        const items = leads.map(lead => (
            {
                lead,
                minHeight: 295,
                width: columnWidth,
                ...otherProps,
            }
        ));

        return (
            <Masonry
                ref={(_ref) => {
                    this.ref = _ref;
                }}
                items={items}
                itemComponent={LeadItem}
                containerClassName={styles.leadGrids}
                alignCenter
                loadingElement={
                    <span style={styles.gridLoading}>Loading...</span>
                }
                scrollAnchor={this.ref.node}
                columnWidth={columnWidth}
                columnGutter={columnGutter}
                hasMore
                getState={{}}
                isLoading={loading}
                onInfiniteLoad={onEndReached}
            />
        );
    }
}
