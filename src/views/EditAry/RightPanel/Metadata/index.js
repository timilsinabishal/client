import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '#rscg/FaramGroup';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';

import { aryTemplateMetadataSelector } from '#redux';
import _ts from '#ts';
import Baksa from '#components/Baksa';

import { renderWidget } from '../widgetUtils';
import Header from '../Header';

import styles from './styles.scss';

const propTypes = {
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    aryTemplateMetadata: [],
};

const mapStateToProps = state => ({
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

@connect(mapStateToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderMetadata = (k, data) => {
        const {
            fields,
            id,
            title,
        } = data;

        const fieldValues = Object.values(fields);
        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                </h4>
                <ListView
                    className={styles.content}
                    data={fieldValues}
                    modifier={renderWidget}
                />
            </div>
        );
    }

    render() {
        const {
            aryTemplateMetadata: metadataGroups,
            pending,
        } = this.props;

        const basicInformationTitle = _ts('editAssessment.metadata', 'basicInformationTitle');
        const additionalDocumentsTitle = _ts('editAssessment.metadata', 'additionalDocumentsTitle');

        const metadataGroupValues = Object.values(metadataGroups);

        return (
            <div className={styles.metadata}>
                <FaramGroup faramElementName="metadata">
                    {pending && <LoadingAnimation large />}
                    <FaramGroup faramElementName="basicInformation">
                        <div className={styles.basicInformation}>
                            <Header
                                title={basicInformationTitle}
                                className={styles.header}
                            />
                            <ListView
                                className={styles.content}
                                data={metadataGroupValues}
                                modifier={this.renderMetadata}
                            />
                        </div>
                    </FaramGroup>
                    <FaramGroup faramElementName="additionalDocuments">
                        <div className={styles.additionalDocuments}>
                            <Header
                                title={additionalDocumentsTitle}
                                className={styles.header}
                            />
                            <div className={styles.content}>
                                <Baksa
                                    label={_ts('editAssessment.metadata', 'executiveSummaryTitle')}
                                    className={styles.baksa}
                                    faramElementName="executiveSummary"
                                    showPageRange
                                />
                                <Baksa
                                    label={_ts('editAssessment.metadata', 'assessmentDatabaseTitle')}
                                    className={styles.baksa}
                                    faramElementName="assessmentData"
                                    acceptUrl
                                />
                                <Baksa
                                    label={_ts('editAssessment.metadata', 'questionnaireTitle')}
                                    className={styles.baksa}
                                    faramElementName="questionnaire"
                                    showPageRange
                                />
                            </div>
                        </div>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
