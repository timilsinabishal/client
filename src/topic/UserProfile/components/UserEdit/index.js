/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <navinayer56@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    ImageInput,
    TextInput,
    HiddenInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import { RestBuilder } from '../../../../public/utils/rest';
import Uploader from '../../../../public/utils/Uploader';

import schema from '../../../../common/schema';
import {
    createHeaderForFileUpload,
    createParamsForUserPatch,
    createUrlForUserPatch,
    urlForUpload,
} from '../../../../common/rest';
import {
    tokenSelector,
    setUserInformationAction,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    userId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    handleModalClose: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    userInformation: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: this.props.userInformation,
            pending: false,
            stale: false,
        };

        this.elements = [
            'firstName',
            'lastName',
            'organization',
            'displayPicture',
        ];

        this.validations = {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
            displayPicture: [],
        };
    }

    componentWillMount() {
        console.warn('Mounting UserEdit');
    }

    componentWillUnmount() {
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        if (this.uploader) {
            this.uploader.abort();
        }
    }

    createRequestForUserPatch = (userId, { firstName, lastName, organization, displayPicture }) => {
        const urlForUser = createUrlForUserPatch(userId);
        const userPatchRequest = new RestBuilder()
            .url(urlForUser)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserPatch(
                    { access },
                    { firstName, lastName, organization, displayPicture });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userPatchResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);

                const { errors } = response;
                const formFieldErrors = {};
                const { nonFieldErrors } = errors;

                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formFieldErrors[key] = errors[key].join(' ');
                    }
                });

                this.setState({
                    formFieldErrors,
                    formErrors: nonFieldErrors,
                    pending: false,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userPatchRequest;
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        console.log(values);
        // Stop old patch request
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }

        const userId = this.props.userId;
        // Create new patch request and start it
        this.userPatchRequest = this.createRequestForUserPatch(userId, values);
        this.userPatchRequest.start();
    };

    // BUTTONS
    handleFormClose = (e) => {
        e.preventDefault();
        this.props.handleModalClose();
    }

    // Image Input Change
    handleImageInputChange = (files) => {
        const uploader = new Uploader(
            files[0],
            urlForUpload,
            createHeaderForFileUpload(this.props.token),
        );

        uploader.onLoad = (status, response) => {
            const r = JSON.parse(response);
            this.setState({
                formValues: { ...this.state.formValues, displayPicture: r.id },
                stale: true,
            }, () => console.log(this.state));
        };

        uploader.onProgress = (progress) => {
            // TODO: Add progress component
            console.warn(`Upload Progress: ${progress}`);
        };
        this.uploader = uploader;


        this.uploader.start();
    }

    render() {
        const {
            formValues,
            formErrors = [],
            formFieldErrors,
            pending,
            stale,
        } = this.state;

        return (
            <Form
                styleName="user-profile-edit-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
            >
                {
                    pending &&
                    <div styleName="pending-overlay">
                        <i
                            className="ion-load-c"
                            styleName="loading-icon"
                        />
                    </div>
                }
                <div styleName="non-field-errors">
                    {
                        formErrors.map(err => (
                            <div
                                key={err}
                                styleName="error"
                            >
                                {err}
                            </div>
                        ))
                    }
                    { formErrors.length <= 0 &&
                        <div styleName="error empty">
                            -
                        </div>
                    }
                </div>
                {/*
                    TODO: Pass image src to ImageInput using advanced File Component
                */}
                <ImageInput
                    showPreview
                    styleName="display-picture"
                    onChange={this.handleImageInputChange}
                />
                <TextInput
                    label="First name"
                    formname="firstName"
                    placeholder="Enter a descriptive name"
                    value={formValues.firstName}
                    error={formFieldErrors.firstName}
                />
                <HiddenInput
                    formname="displayPicture"
                    value={formValues.displayPicture}
                    error={formFieldErrors.displayPicture}
                />
                <TextInput
                    label="Last name"
                    formname="lastName"
                    placeholder="Enter a descriptive name"
                    value={formValues.lastName}
                    error={formFieldErrors.lastName}
                />
                <TextInput
                    label="Organization"
                    formname="organization"
                    placeholder="Enter a descriptive name"
                    value={formValues.organization}
                    error={formFieldErrors.organization}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.handleFormClose}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Save changes
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}