import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    aryStringsSelector,
    aryViewMetadataSelector,
    aryTemplateMetadataSelector,
    // setAryAction,
} from '../../../../redux';
import Form, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import NumberInput from '../../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../../vendor/react-store/components/Action/Button';

import styles from './styles.scss';

const propTypes = {
    aryStrings: PropTypes.func.isRequired,
    metaData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    // setAry: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    metaData: {},
    aryTemplateMetadata: {},
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
    metaData: aryViewMetadataSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

/*
const mapDispatchToProps = dispatch => ({
    // setAry: params => dispatch(setAryAction(params)),
});
*/

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static renderWidget = ({ id: key, fieldType, title, options, placeholder }) => {
        const id = String(key);
        const commonProps = {
            key: id,
            formname: id,
            label: title,
            placeholder,
            options,
        };
        const typeSpecificProps = {
            number: {
                separator: ' ',
            },
        };
        const components = {
            string: TextInput,
            number: NumberInput,
            date: DateInput,
            multiselect: MultiSelectInput,
            select: SelectInput,
        };

        const Component = components[fieldType];
        if (!Component) {
            console.error('Unidentified fieldType', fieldType);
            return null;
        }
        return (
            <Component
                {...commonProps}
                {...typeSpecificProps[fieldType]}
            />
        );
    }

    static getSchema = (metadataGroups) => {
        const schema = {
            fields: {},
        };

        Object.keys(metadataGroups).forEach((key) => {
            const metadataGroup = metadataGroups[key];

            metadataGroup.fields.forEach((field) => {
                schema.fields[field.id] = [requiredCondition];
            });
        });

        return schema;
    }

    constructor(props) {
        super(props);

        const { aryTemplateMetadata: metadataGroups } = this.props;
        const schema = Metadata.getSchema(metadataGroups);

        this.state = {
            formValues: this.props.metaData || {},
            formErrors: {},
            formFieldErrors: {},
            schema,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.aryTemplateMetadata !== nextProps.aryTemplateMetadata) {
            const { aryTemplateMetadata: metadataGroups } = nextProps;
            const schema = Metadata.getSchema(metadataGroups);
            this.setState({
                schema,
                formErrors: {},
                formFieldErrors: {},
            });
        }
    }

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (value) => {
        console.warn('Submit', value);
    };

    render() {
        const { aryTemplateMetadata: metadataGroups } = this.props;
        const {
            schema,
            formValues,
            formErrors,
            formFieldErrors,
        } = this.state;

        const pending = false;
        return (
            <Form
                className={styles.metaData}
                schema={schema}
                changeCallback={this.changeCallback}
                successCallback={this.successCallback}
                failureCallback={this.failureCallback}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                <div className={styles.overview}>
                    <NonFieldErrors formerror="" />
                    {
                        Object.keys(metadataGroups).map((key) => {
                            const metadataGroup = metadataGroups[key];
                            return (
                                <div
                                    key={metadataGroup.id}
                                    className={styles.background}
                                >
                                    <h3 className={styles.heading}>
                                        {metadataGroup.title}
                                    </h3>
                                    { metadataGroup.fields.map(Metadata.renderWidget) }
                                </div>
                            );
                        })
                    }
                </div>
                <Button> Submit </Button>
                {/*
                <div
                    className={styles.structure}
                    formskip
                >
                    <h3 className={styles.heading}>
                        {this.props.aryStrings('structureSectionLabel')}
                    </h3>
                    <div className={styles.kobo}>
                        {this.props.aryStrings('dragKoboLabel')}
                    </div>
                    <div className={styles.questionnaire}>
                        {this.props.aryStrings('dragQuestionLabel')}
                    </div>
                    <div className={styles.documents}>
                        {this.props.aryStrings('dragDocumentLabel')}
                    </div>
                </div>
                */}
            </Form>
        );
    }
}