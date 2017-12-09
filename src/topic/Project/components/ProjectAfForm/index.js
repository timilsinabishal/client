import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Form,
    NonFieldErrors,
    TextInput,
    TextArea,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired, //eslint-disable-line
    formFieldErrors: PropTypes.object.isRequired, //eslint-disable-line
    formValues: PropTypes.object.isRequired, //eslint-disable-line
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    stale: PropTypes.bool,
};

const defaultProps = {
    pending: false,
    stale: false,
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ProjectAfForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.elements = [
            'title',
            'description',
        ];

        this.validations = {
            title: [requiredCondition],
        };
    }

    render() {
        const {
            changeCallback,
            failureCallback,
            formErrors,
            formFieldErrors,
            formValues,
            handleFormCancel,
            pending,
            stale,
            successCallback,
        } = this.props;

        return (
            <Form
                changeCallback={changeCallback}
                elements={this.elements}
                failureCallback={failureCallback}
                styleName="af-detail-form"
                successCallback={successCallback}
                validation={this.validation}
                validations={this.validations}
            >
                { pending && <LoadingAnimation /> }
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={handleFormCancel}
                        type="button"
                        disabled={pending || !stale}
                    >
                        Revert
                    </DangerButton>
                    <SuccessButton
                        disabled={pending || !stale}
                    >
                        Save
                    </SuccessButton>
                </div>
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="Enter Analysis Framework Name"
                    styleName="name"
                    value={formValues.title}
                    error={formFieldErrors.title}
                    disabled={pending}
                />
                <TextArea
                    label="Description"
                    formname="description"
                    placeholder="Enter Project Description"
                    styleName="description"
                    rows={4}
                    value={formValues.description}
                    error={formFieldErrors.description}
                    disabled={pending}
                />
            </Form>
        );
    }
}
