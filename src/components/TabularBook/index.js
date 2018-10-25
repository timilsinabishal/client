import PropTypes from 'prop-types';
import React from 'react';

import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import { iconNames } from '#constants';
import TabularSheet from '#components/TabularSheet';
import { RequestClient, requestMethods } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types

    setDefaultRequestParams: PropTypes.func.isRequired,
    extractRequest: RequestClient.prop.isRequired,
    bookRequest: RequestClient.prop.isRequired,
    deleteRequest: RequestClient.prop.isRequired,

    showDelete: PropTypes.bool,
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: '',
    showDelete: false,
};

const requests = {
    initialRequest: {
        onMount: true,
        onPropsChanged: ['bookId'],

        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ response, defaultParams: {
            triggerExtraction,
            startPolling,
            setBook,
            setInvalid,
        } }) => {
            if (response.status === 'initial') {
                triggerExtraction();
            } else if (response.status === 'pending') {
                startPolling();
            } else if (response.status === 'success') {
                setBook(response);
            } else {
                setInvalid();
            }
        },
        onFailure: ({ defaultParams: { setInvalid } }) => setInvalid(),
        onFatal: ({ defaultParams: { setInvalid } }) => setInvalid(),
    },

    extractRequest: {
        method: requestMethods.POST,
        url: ({ props }) => `/tabular-extraction-trigger/${props.bookId}/`,
        onSuccess: ({ defaultParams: { startPolling } }) => startPolling(),
    },

    bookRequest: {
        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        options: {
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: r => r.status === 'pending',
        },
        onSuccess: ({ response, defaultParams: { setBook, setInvalid } }) => {
            if (response.status === 'success') {
                setBook(response);
            } else {
                setInvalid();
            }
        },
    },

    deleteRequest: {
        method: requestMethods.DELETE,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ props }) => props.onDelete(),
    },
};

@RequestClient(requests)
export default class TabularBook extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            tabs: {},
            views: {},
            activeSheet: undefined,
            completed: false,
            invalid: false,
        };

        props.setDefaultRequestParams({
            triggerExtraction: this.triggerExtraction,
            startPolling: this.startPolling,
            setBook: this.setBook,
            setInvalid: this.setInvalid,
        });
    }

    getRendererParams = sheetId => ({
        sheet: this.state.sheets[sheetId],
        onSheetChange: this.handleSheetChange,
    })

    setBook = (book) => {
        const tabs = {};
        const views = {};
        const sheets = {};

        book.sheets.forEach((sheet) => {
            tabs[sheet.id] = sheet.title;
            sheets[sheet.id] = sheet;
            views[sheet.id] = {
                component: TabularSheet,
                rendererParams: () => this.getRendererParams(sheet.id),
            };
        });

        this.setState({
            tabs,
            views,
            sheets,
            activeSheet: Object.keys(tabs)[0],
            invalid: false,
            completed: true,
        });
    }

    setInvalid = () => {
        this.setState({ invalid: true });
    }

    triggerExtraction = () => {
        this.props.extractRequest.do();
    }

    startPolling = () => {
        this.props.bookRequest.do();
    }

    handleSheetChange = (newSheet) => {
        const sheets = { ...this.state.sheets };
        sheets[newSheet.id] = newSheet;
        this.setState({ sheets });
    }

    handleActiveSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    handleDelete = () => {
        this.props.deleteRequest.do();
    }

    render() {
        const {
            className,
            showDelete,
        } = this.props;

        const {
            tabs,
            views,
            activeSheet,
            invalid,
            completed,
        } = this.state;

        if (invalid) {
            return (
                <div className={_cs(className, styles.tabularBook, 'tabular-book')}>
                    Invalid tabular book
                </div>
            );
        }

        if (!completed) {
            return (
                <div className={_cs(className, styles.tabularBook, 'tabular-book')}>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <div className={_cs(className, styles.tabularBook, 'tabular-book')}>
                <header>
                    <h4>
                        Quantitiave Analysis
                    </h4>
                    {showDelete && (
                        <DangerConfirmButton
                            iconName={iconNames.delete}
                            onClick={this.handleDelete}
                            confirmationMessage={_ts('tabular', 'deleteMessage')}
                            transparent
                        />
                    )}
                </header>
                <MultiViewContainer
                    views={views}
                    active={activeSheet}
                />
                <FixedTabs
                    className={styles.tabs}
                    tabs={tabs}
                    active={activeSheet}
                    onClick={this.handleActiveSheetChange}
                />
            </div>
        );
    }
}
