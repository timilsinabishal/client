/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { tokenSelector } from '#redux';
import { sendToken } from '#utils/browserExtension';
import _ts from '#ts';
import notify from '#notify';

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const propTypes = {
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
};

@connect(mapStateToProps, undefined)
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
        };

        this.sendToken(props.token);
        console.log('sending token', props.token);
    }

    componentWillReceiveProps(nextProps) {
        const { token: newToken } = nextProps;
        const { token: oldToken } = this.props;

        if (newToken.refresh !== oldToken.refresh) {
            console.log('sending new token', newToken);
            this.sendToken(newToken);
        }
    }

    sendToken = (token) => {
        sendToken(token).then(
            () => {
                notify.send({
                    type: notify.type.SUCCESS,
                    title: _ts('browserExtension', 'browserExtensionSuccessTitle'),
                    message: _ts('browserExtension', 'browserExtensionSuccessMessage'),
                    duration: notify.duration.SLOW,
                });
                this.setState({ pending: false });
            },
            () => {
                notify.send({
                    type: notify.type.ERROR,
                    title: _ts('browserExtension', 'browserExtensionFailureTitle'),
                    message: _ts('browserExtension', 'browserExtensionFailureMessage'),
                    duration: notify.duration.SLOW,
                });
                this.setState({ pending: false });
            },
        );
    }

    render() {
        const {
            pending,
        } = this.state;

        if (pending) {
            return (
                <div>
                    <h2>
                        {/* FIXME: strings */}
                        Just a moment, setting up you extension
                    </h2>
                </div>
            );
        }

        return (
            <div>
                <h2>
                    {/* FIXME: strings */}
                    You may close this page now
                </h2>
            </div>
        );
    }
}
