import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Masonry from '#components/Masonry';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { isArrayEqual } from '#rsu/common';
import Modal from '#rscv/Modal';
import LeadPreview from '#components/LeadPreview';
import { iconNames } from '#constants';
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

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

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

        this.state = {
            showPreview: false,
            activeLeadIndex: 0,
        };

        this.columnWidth = 300;
        this.columnGutter = 40;

        this.itemState = {
            width: this.columnWidth,
            minHeight: 295,
        };

        this.masonryRef = {};
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPressed);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPressed);
    }

    onReference = (ref) => {
        this.masonryRef = ref;
    }

    handleKeyPressed = (event) => {
        if (event.keyCode === LEFT_KEY) {
            this.handleLeftClick();
        } else if (event.keyCode === RIGHT_KEY) {
            this.handleRightClick();
        }
    }

    handleLeadClick = (leadIndex) => {
        this.setState({
            showPreview: true,
            activeLeadIndex: leadIndex,
        });
    }

    handleLeftClick = () => {
        const { activeLeadIndex } = this.state;
        const nextIndex = activeLeadIndex > 0 ? activeLeadIndex - 1 : 0;
        this.setState({
            activeLeadIndex: nextIndex,
        });
    }

    handleRightClick = () => {
        const { activeLeadIndex } = this.state;
        const nextIndex = activeLeadIndex < this.props.leads.length - 1 ?
            activeLeadIndex + 1 : activeLeadIndex;
        this.setState({
            activeLeadIndex: nextIndex,
        });
    }

    hideLeadDetailPreview = () => {
        this.setState({
            showPreview: false,
        });
    }

    renderItem = ({ key, style, item, itemIndex }) => (
        <LeadItem
            key={key}
            activeProject={this.props.activeProject}
            style={style}
            lead={item}
            itemIndex={itemIndex}
            onRemoveLead={this.props.onRemoveLead}
            onSearchSimilarLead={this.props.onSearchSimilarLead}
            onMarkPending={this.props.onMarkPending}
            onMarkProcessed={this.props.onMarkProcessed}
            onLeadClick={this.handleLeadClick}
        />
    );

    render() {
        const { loading, onEndReached, leads, ...otherProps } = this.props;

        return (
            <React.Fragment>
                <Masonry
                    ref={this.onReference}
                    items={leads}
                    renderItem={this.renderItem}
                    getItemHeight={LeadItem.getItemHeight}
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
                />
                {
                    this.state.showPreview &&
                        <Modal
                            className={styles.modal}
                            onClose={this.hideLeadDetailPreview}
                            closeOnOutsideClick
                            closeOnEscape
                        >
                            <LeadPreview
                                lead={leads[this.state.activeLeadIndex]}
                                showScreenshot={false}
                            />
                            <Button
                                className={styles.buttonClose}
                                onClick={this.hideLeadDetailPreview}
                                tabIndex="-1"
                                transparent
                                iconName={iconNames.close}
                            />
                            <Button
                                className={
                                    classNames(styles.buttonCarousel, styles.buttonCarouselLeft)
                                }
                                onClick={this.handleLeftClick}
                                tabIndex="-1"
                                transparent
                                iconName={iconNames.chevronLeft}
                            />
                            <Button
                                className={
                                    classNames(styles.buttonCarousel, styles.buttonCarouselRight)
                                }
                                onClick={this.handleRightClick}
                                tabIndex="-1"
                                transparent
                                iconName={iconNames.chevronRight}
                            />
                        </Modal>
                }
            </React.Fragment>
        );
    }
}
