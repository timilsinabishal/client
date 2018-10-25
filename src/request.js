import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import update from '#rsu/immutable-update';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
    createRequestCoordinator,
    createRequestClient,
    RestRequest,
} from '@togglecorp/react-rest-request';
import { tokenSelector } from '#redux';
import { wsEndpoint } from '#config/rest';

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const CustomRequestCoordinator = createRequestCoordinator({
    transformParams: (params, props) => {
        const { access } = props.token;
        if (!access) {
            return params;
        }

        const settings = {
            headers: { $auto: {
                Authorization: { $set: `Bearer ${access}` },
            } },
        };

        return update(params, settings);
    },
    transformProps: (props) => {
        const {
            token, // eslint-disable-line no-unused-vars
            ...otherProps
        } = props;
        return otherProps;
    },

    transformUrl: (url) => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        return `${wsEndpoint}${url}`;
    },
});

export const RequestCoordinator = compose(
    connect(mapStateToProps),
    CustomRequestCoordinator,
);

export const RequestClient = createRequestClient();
RequestClient.prop = PropTypes.shape({
    do: PropTypes.func,
    pending: PropTypes.bool,
    response: PropTypes.object,
    error: PropTypes.object,
});

export const requestMethods = RestRequest.methods;
