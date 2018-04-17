import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import { BgRestBuilder } from '../../vendor/react-store/utils/rest';
import { UploadBuilder } from '../../vendor/react-store/utils/upload';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import HiddenInput from '../../vendor/react-store/components/Input/HiddenInput';
import FileInput from '../../vendor/react-store/components/Input/FileInput';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import Form, {
    greaterThanOrEqualToCondition,
    requiredCondition,
    integerCondition,
} from '../../vendor/react-store/components/Input/Form';

import { InternalGallery } from '../../components/DeepGallery';
import {
    transformResponseErrorToFormError,
    createParamsForAdminLevelsForRegionPOST,
    createParamsForAdminLevelsForRegionPATCH,
    createParamsForFileUpload,
    createUrlForAdminLevel,
    urlForAdminLevels,
    urlForUpload,
} from '../../rest';
import {
    addAdminLevelForRegionAction,
    countriesStringsSelector,
    notificationStringsSelector,
} from '../../redux';
import schema from '../../schema';
import { iconNames } from '../../constants';

import notify from '../../notify';
import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
    adminLevelsOfRegion: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    adminLevelDetail: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        level: PropTypes.number,
        nameProp: PropTypes.string,
        codeProp: PropTypes.string,
        parentNameProp: PropTypes.string,
        parentCodeProp: PropTypes.string,
        region: PropTypes.number,
        parent: PropTypes.number,
        geoShapeFile: PropTypes.number,
    }),
    onClose: PropTypes.func.isRequired,
    addAdminLevelForRegion: PropTypes.func.isRequired,
    countriesStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    adminLevelDetail: {},
};

const mapStateToProps = state => ({
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addAdminLevelForRegion: params => dispatch(addAdminLevelForRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues: this.props.adminLevelDetail,
            pending: false,
            pristine: false,
            adminLevelsOfRegion: this.calculateOtherAdminLevels(props.adminLevelsOfRegion),
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                level: [requiredCondition, integerCondition, greaterThanOrEqualToCondition(0)],
                nameProp: [],
                codeProp: [],
                parentNameProp: [],
                parentCodeProp: [],
                parent: [],
                geoShapeFile: [],
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({
                adminLevelsOfRegion: this.calculateOtherAdminLevels(nextProps.adminLevelsOfRegion),
            });
        }
    }

    componentWillUnmount() {
        if (this.requestForAlForRegion) {
            this.requestForAlForRegion.stop();
        }
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    keySelector = row => row.id
    labelSelector = row => row.title

    calculateOtherAdminLevels = adminLevels => adminLevels.filter(adminLevel => (
        adminLevel.id !== this.props.adminLevelDetail.id &&
        adminLevel.parent !== this.props.adminLevelDetail.id
    ))

    createAlForRegionUpdateRequest = (data, adminLevelId) => {
        const urlForAdminLevel = createUrlForAdminLevel(adminLevelId);
        const requestForAdminLevelsUpdateForRegion = new BgRestBuilder()
            .url(urlForAdminLevel)
            .params(() => createParamsForAdminLevelsForRegionPATCH(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelPatchResponse');
                    this.props.addAdminLevelForRegion({
                        adminLevel: response,
                        regionId: data.region,
                    });
                    notify.send({
                        title: this.props.notificationStrings('adminLevelEdit'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('adminLevelEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelEditFailure'),
                    duration: notify.duration.SLOW,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelEditFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: { errors: ['Error while trying to save admin level.'] },
                });
            })
            .build();
        return requestForAdminLevelsUpdateForRegion;
    }

    createAlForRegionCreateRequest = (data) => {
        const requestForAdminLevelsCreateForRegion = new BgRestBuilder()
            .url(urlForAdminLevels)
            .params(() => createParamsForAdminLevelsForRegionPOST(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelPostResponse');
                    this.props.addAdminLevelForRegion({
                        adminLevel: response,
                        regionId: data.region,
                    });
                    notify.send({
                        title: this.props.notificationStrings('adminLevelCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('adminLevelCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: { errors: ['Error while trying to create admin level.'] },
                });
            })
            .build();
        return requestForAdminLevelsCreateForRegion;
    }

    // FORM RELATED
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

    successCallback = (values) => {
        if (this.requestForAlForRegion) {
            this.requestForAlForRegion.stop();
        }

        const countryId = this.props.countryId || this.props.adminLevelDetail.region;
        const adminLevelId = this.props.adminLevelDetail.id;

        if (adminLevelId) {
            // UPDATE
            this.requestForAlForRegion = this.createAlForRegionUpdateRequest(
                { ...values, region: countryId }, adminLevelId);
        } else {
            // CREATE
            this.requestForAlForRegion = this.createAlForRegionCreateRequest(
                { ...values, region: countryId });
        }
        this.requestForAlForRegion.start();
    };

    handleGeoFileInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: this.props.notificationStrings('fileSelection'),
                type: notify.type.WARNING,
                message: this.props.notificationStrings('invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(files[0])
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                this.setState({
                    formValues: { ...this.state.formValues, geoShapeFile: response.id },
                    pristine: true,
                });
            })
            .progress((progress) => {
                console.warn(progress);
            })
            .build();
        // TODO: notify on fatal and failure
        this.uploader.start();
    }

    render() {
        const { onClose } = this.props;
        const {
            formFieldErrors,
            formErrors,
            formValues,
            pending,
            pristine,
            adminLevelsOfRegion,
        } = this.state;

        return (
            <div className={styles.formContainer}>
                <Form
                    className={styles.editAdminLevelForm}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    successCallback={this.successCallback}
                    schema={this.schema}
                    value={formValues}
                    fieldErrors={formFieldErrors}
                    formErrors={formErrors}
                    disabled={pending}
                >
                    {
                        pending && <LoadingAnimation />
                    }
                    <NonFieldErrors formerror="" />
                    <div className={styles.adminLevelDetails} >
                        <TextInput
                            formname="level"
                            label={this.props.countriesStrings('adminLevelLabel')}
                            placeholder={this.props.countriesStrings('adminLevelPlaceholder')}
                            className={styles.textInput}
                            type="number"
                            min={0}
                            autoFocus
                        />
                        <TextInput
                            formname="title"
                            label={this.props.countriesStrings('adminLevelNameLabel')}
                            placeholder={this.props.countriesStrings('adminLevelNamePlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            formname="nameProp"
                            label={this.props.countriesStrings('namePropertyLabel')}
                            placeholder={this.props.countriesStrings('namePropertyPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            formname="codeProp"
                            label={this.props.countriesStrings('pcodePropertyLabel')}
                            placeholder={this.props.countriesStrings('pcodePropertyPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            formname="parentNameProp"
                            label={this.props.countriesStrings('parentNamePropLabel')}
                            placeholder={this.props.countriesStrings('parentNamePropPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            formname="parentCodeProp"
                            label={this.props.countriesStrings('parentCodePropLabel')}
                            placeholder={this.props.countriesStrings('parentCodePropPlaceholder')}
                            className={styles.textInput}
                        />
                        <SelectInput
                            keySelector={this.keySelector}
                            labelSelector={this.labelSelector}
                            options={adminLevelsOfRegion}
                            optionsIdentifier="select-input-inside-modal"
                            showHintAndError={false}
                            formname="parent"
                            label={this.props.countriesStrings('parentAdminLevelLabel')}
                            placeholder={this.props.countriesStrings('parentAdminLevelPlaceholder')}
                            className={styles.selectInput}
                        />
                        <FileInput
                            className={styles.geoFile}
                            onChange={this.handleGeoFileInputChange}
                            error={formFieldErrors.geoShapeFile}
                            accept=".zip, .json, .geojson"
                        >
                            {
                                formValues.geoShapeFile ? (
                                    <div>
                                        <Fragment>
                                            <span
                                                className={styles.show}
                                                title={this.props.countriesStrings('updateGeoFile')}
                                            >
                                                <i className={iconNames.uploadFa} />
                                                {this.props.countriesStrings('geoShapeFile')}
                                            </span>
                                        </Fragment>
                                        <InternalGallery
                                            onlyFileName
                                            galleryId={formValues.geoShapeFile}
                                        />
                                        <i className={iconNames.download} />
                                        <span
                                            className={iconNames.help}
                                            title={this.props.countriesStrings('geoshapeTooltip')}
                                        />
                                    </div>

                                ) : (
                                    <div>
                                        <span className={styles.load}>
                                            <i className={iconNames.uploadFa} />
                                            {this.props.countriesStrings('loadGeoShapeFile')}
                                        </span>
                                        <span
                                            className={iconNames.help}
                                            title={this.props.countriesStrings('geoshapeTooltip')}
                                        />
                                    </div>
                                )
                            }
                        </FileInput>
                        <HiddenInput formname="geoShapeFile" />
                    </div>
                    <div className={styles.actionButtons}>
                        <DangerButton onClick={onClose}>
                            {this.props.countriesStrings('cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            className={styles.saveBtn}
                            type="submit"
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('saveChangesButtonLabel')}
                        </PrimaryButton>
                    </div>
                </Form>
            </div>
        );
    }
}
