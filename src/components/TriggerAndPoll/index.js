import PropTypes from 'prop-types';
import React from 'react';

import { RequestClient, requestMethods } from '#request';

const propTypes = {
    children: PropTypes.func.isRequired,
    setDefaultRequestParams: PropTypes.func.isRequired,
    onDataReceived: PropTypes.func,

    initialRequest: RequestClient.prop.isRequired,
    triggerRequest: RequestClient.prop.isRequired,
    pollRequest: RequestClient.prop.isRequired,
    dataRequest: RequestClient.prop.isRequired,
};

const defaultProps = {
    onDataReceived: undefined,
};


const defaultShouldTrigger = r => r.status === 'initial';
const defaultShouldPoll = r => r.status === 'pending';
const defaultIsValid = r => r.status === 'success';

const requests = {
    initialRequest: {
        onMount: ({ props }) => !props.pollOnly,
        onPropsChanged: {
            initialUrl: ({ props }) => !props.pollOnly,
            url: ({ props }) => !props.pollOnly && !props.initialUrl,
            initialQuery: ({ props }) => !props.pollOnly,
            query: ({ props }) => !props.pollOnly && !props.initialQuery,
        },

        method: requestMethods.GET,
        url: ({ props }) => props.initialUrl || props.url,
        query: ({ props }) => props.initialQuery || props.query || {},
        onSuccess: ({ response, props, params: {
            setData,
            setInvalid,
            poll,
            trigger,
        } }) => {
            const isValid = (
                props.isInitialValid || props.isValid || defaultIsValid
            );
            const shouldTrigger = (
                props.shouldInitialTrigger || props.shouldTrigger || defaultShouldTrigger
            );
            const shouldPoll = (
                props.shouldInitialPoll || props.shouldPoll || defaultShouldPoll
            );

            if (shouldTrigger(response)) {
                trigger();
            } else if (shouldPoll(response)) {
                poll();
            } else if (isValid(response)) {
                setData(response);
            } else {
                setInvalid();
            }
        },

        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
    },

    pollRequest: {
        onMount: ({ props }) => props.pollOnly,
        onPropsChanged: {
            pollUrl: ({ props }) => props.pollOnly,
            url: ({ props }) => props.pollOnly && !props.pollUrl,
            pollQuery: ({ props }) => props.pollOnly,
            query: ({ props }) => props.pollOnly && !props.pollQuery,
        },

        method: requestMethods.GET,
        url: ({ props }) => props.pollUrl || props.url,
        query: ({ props }) => props.pollQuery || props.query || {},
        options: ({ props }) => ({
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: props.shouldPoll || defaultShouldPoll,
        }),
        onSuccess: ({ response, props, params: {
            fetchData,
            setData,
            setInvalid,
        } }) => {
            const isValid = props.isPollValid || props.isValid || defaultIsValid;
            if (isValid(response)) {
                if (props.separateDataRequest) {
                    fetchData();
                } else {
                    setData(response);
                }
            } else {
                setInvalid();
            }
        },

        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
    },

    triggerRequest: {
        method: requestMethods.POST,
        url: ({ props }) => props.triggerUrl,
        body: ({ props }) => props.triggerBody || props.body || {},
        onSuccess: ({ params: { poll } }) => poll(),

        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
    },

    dataRequest: {
        method: requestMethods.GET,
        url: ({ props }) => props.url,
        query: ({ props }) => props.query,
        onSuccess: ({ response, props, params: {
            setData,
            setInvalid,
        } }) => {
            const isValid = props.isValid || defaultIsValid;
            if (isValid(response)) {
                setData(response);
            } else {
                setInvalid();
            }
        },

        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
    },
};

@RequestClient(requests)
export default class TriggerAndPoll extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            data: undefined,
            completed: false,
            invalid: false,
        };

        props.setDefaultRequestParams({
            trigger: this.trigger,
            fetchData: this.fetchData,
            poll: this.poll,
            setData: this.setData,
            setInvalid: this.setInvalid,
        });
    }

    setData = (data) => {
        if (this.props.onDataReceived) {
            this.props.onDataReceived(data);
        }
        this.setState({ data, completed: true, invalid: false });
    }

    // TODO Detailed errors
    setInvalid = () => {
        this.setState({ invalid: true });
    }

    trigger = () => {
        this.props.triggerRequest.do();
    }

    poll = () => {
        this.props.pollRequest.do();
    }

    fetchData = () => {
        this.props.dataRequest.do();
    }

    render() {
        const { data, completed, invalid } = this.state;
        const { pollRequest, triggerRequest, dataRequest, initialRequest } = this.props;

        return this.props.children({
            completed,
            data,
            invalid,
            pollPending: pollRequest.pending,
            triggerRequest: triggerRequest.pending,
            dataRequest: dataRequest.pending,
            initialRequest: initialRequest.pending,
        });
    }
}
