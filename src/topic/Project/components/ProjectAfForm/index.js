import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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

import { projectStringsSelector } from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    formFieldErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    pristine: PropTypes.bool,
    readOnly: PropTypes.bool,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    pending: false,
    pristine: false,
    className: '',
    readOnly: false,
};

const mapStateToProps = state => ({
    projectStrings: projectStringsSelector(state),
});

@connect(mapStateToProps)
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
            pristine,
            successCallback,
            readOnly,
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
                { !readOnly &&
                    <div styleName="action-buttons">
                        <DangerButton
                            onClick={handleFormCancel}
                            type="button"
                            disabled={pending || !pristine}
                        >
                            {this.props.projectStrings('modalRevert')}
                        </DangerButton>
                        <SuccessButton
                            disabled={pending || !pristine}
                        >
                            {this.props.projectStrings('modalSave')}
                        </SuccessButton>
                    </div>
                }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={this.props.projectStrings('addAfTitleLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('addAfTitlePlaceholder')}
                    styleName="name"
                    value={formValues.title}
                    error={formFieldErrors.title}
                    disabled={pending}
                    readOnly={readOnly}
                />
                <TextArea
                    label={this.props.projectStrings('projectDescriptionLabel')}
                    formname="description"
                    placeholder={this.props.projectStrings('projectDescriptionPlaceholder')}
                    styleName="description"
                    rows={3}
                    value={formValues.description}
                    error={formFieldErrors.description}
                    disabled={pending}
                    readOnly={readOnly}
                />
            </Form>
        );
    }
}
