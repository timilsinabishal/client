import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Cloak from '#components/Cloak';
import DetectOutsideClick from '#components/DetectOutsideClick';
import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import LeadPreview from '#components/LeadPreview';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import {
    iconNames,
    pathNames,
} from '#constants';
import { reverseRoute } from '#rsu/common';
import {
    leadTypeIconMap,
    leadPaneTypeMap,
    LEAD_PANE_TYPE,
} from '#entities/lead';
import _ts from '#ts';
import { timeFrom } from '#utils/common';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    onMarkProcessed: PropTypes.func.isRequired,
    onMarkPending: PropTypes.func.isRequired,
    minHeight: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: '',
    minHeight: 295,
};

export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // for masonry
    static getColumnSpanFromProps = () => 1

    static getHeightFromProps = (getState, props) => {
        const {
            lead: {
                thumbnailHeight = 400, thumbnailWidth = 250,
            }, width = 250, minHeight = 295,
        } = props;
        // item is wrapped by masonry
        const imgHeight = Math.max((width * thumbnailHeight) / thumbnailWidth, minHeight);
        return imgHeight;
    }

    state = {
        showPreview: false,
    }

    get links() {
        const { activeProject, lead } = this.props;
        return {
            editLead: {
                pathname: reverseRoute(
                    pathNames.addLeads,
                    {
                        projectId: activeProject,
                    },
                ),
                state: {
                    serverId: lead.id,
                    faramValues: {
                        title: lead.title,
                        sourceType: lead.sourceType,
                        project: lead.project,
                        source: lead.source,
                        confidentiality: lead.confidentiality,
                        assignee: lead.assignee,
                        publishedOn: lead.publishedOn,
                        attachment: lead.attachment,
                        website: lead.website,
                        leadGroup: lead.leadGroup,
                        url: lead.url,
                        text: lead.text,
                    },
                },
            },
            editEntries: reverseRoute(
                pathNames.editEntries,
                {
                    projectId: activeProject,
                    leadId: lead.id,
                },
            ),
        };
    }

    get mimeIcon() {
        const { lead } = this.props;
        let icon = iconNames.documentText;
        if (lead.attachment) {
            icon = leadTypeIconMap[lead.attachment.mimeType];
        } else if (lead.url) {
            icon = iconNames.globe;
        }
        return icon;
    }

    getInlineStyle = () => {
        const { lead } = this.props;

        const leadStyle = {};

        if (lead.thumbnail) {
            leadStyle.backgroundImage = `url(${lead.thumbnail})`;
        } else if (lead.attachment &&
            leadPaneTypeMap[lead.attachment.mimeType] === LEAD_PANE_TYPE.image) {
            leadStyle.backgroundImage = `url(${lead.attachment.file})`;
        }

        const height = GridItem.getHeightFromProps({}, this.props);
        leadStyle.height = height;
        return leadStyle;
    }

    renderMarkAction = () => {
        const { lead, onMarkPending, onMarkProcessed } = this.props;

        if (lead.status === 'pending') {
            return (

                <Button
                    tabIndex="-1"
                    title={_ts('leads', 'searchSimilarLeadButtonTitle')}
                    className={classNames(styles.markProcessed, styles.mark)}
                    onClick={() => onMarkProcessed(lead)}
                    transparent
                    iconName={iconNames.check}
                />
            );
        } else if (lead.status === 'processed') {
            return (
                <Button
                    tabIndex="-1"
                    title={_ts('leads', 'searchSimilarLeadButtonTitle')}
                    className={classNames(styles.markPending, styles.mark)}
                    onClick={() => onMarkPending(lead)}
                    transparent
                    iconName={iconNames.close}
                />
            );
        }

        return null;
    }

    renderActions = () => {
        const { lead, onSearchSimilarLead, onRemoveLead } = this.props;
        const MarkAction = this.renderMarkAction;

        return (
            <React.Fragment>
                <div className={styles.mainActions}>
                    <Cloak
                        // TODO: fix after testing
                        hide={({ hasAnalysisFramework }) => hasAnalysisFramework}
                        render={({ disabled }) => (
                            <Link
                                className={classNames(styles.add, { [styles.disabled]: disabled })}
                                tabIndex="-1"
                                title={_ts('leads', 'addEntryFromLeadButtonTitle')}
                                to={this.links.editEntries}
                                disabled={disabled}
                            >
                                <i className={iconNames.add} />
                            </Link>
                        )}
                    />
                    <MarkAction />
                </div>
                <div className={styles.actions}>

                    <Button
                        tabIndex="-1"
                        title={_ts('leads', 'searchSimilarLeadButtonTitle')}
                        onClick={() => onSearchSimilarLead(lead)}
                        transparent
                        iconName={iconNames.search}
                    />
                    <Link
                        className={styles.actionButton}
                        title={_ts('leads', 'editLeadButtonTitle')}
                        to={this.links.editLead}
                    >
                        <i className={iconNames.edit} />
                    </Link>
                    <DangerConfirmButton
                        tabIndex="-1"
                        title={_ts('leads', 'removeLeadLeadButtonTitle')}
                        onClick={() => onRemoveLead(lead)}
                        transparent
                        iconName={iconNames.trash}
                        confirmationMessage={_ts('leads', 'leadDeleteConfirmText')}
                    />
                    <Button
                        tabIndex="-1"
                        title={_ts('leads', 'searchSimilarLeadButtonTitle')} // TODO
                        onClick={() => this.setState({ showPreview: true })}
                        transparent
                        iconName={iconNames.openLink}
                    />

                </div>
            </React.Fragment>
        );
    }


    render() {
        const { lead, className, onSearchSimilarLead, onRemoveLead, style } = this.props;
        const Actions = this.renderActions;

        const isProcessed = lead.status === 'processed';

        return (
            <div
                className={classNames(className, styles.lead)}
                style={{ ...style, ...this.getInlineStyle() }}
            >
                <div className={classNames({
                    [styles.documentTypePending]: !isProcessed,
                    [styles.documentTypeProcessed]: isProcessed,
                })}
                >
                    <i className={this.mimeIcon} />
                </div>

                <Actions />

                <div className={styles.leadInfo}>
                    <span className={styles.timeFrom}>{timeFrom(lead.createdAt)}</span>
                    <p className={styles.title}>{lead.title}</p>
                    <div className={styles.leadInfoExtra}>

                        <Link
                            className={styles.user}
                            to={reverseRoute(pathNames.userProfile,
                                { userId: lead.assigneeDetails.id })}
                        >
                            Assignee: {lead.assigneeDetails.displayName}
                        </Link>
                        <Link
                            className={styles.user}
                            to={reverseRoute(pathNames.userProfile, { userId: lead.createdBy })}
                        >
                            Publisher: {lead.createdByName}
                        </Link>
                        <div className={styles.leadInfoExtraRow}>
                            {
                                lead.pageCount > 1 ?
                                    <span>{lead.pageCount || 0} pages</span> :
                                    <span>{lead.wordCount || 0} words</span>
                            }
                            <span className={styles.entries}>{lead.noOfEntries} entries</span>
                            <span className={styles.timeFromBottom}>
                                {timeFrom(lead.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {
                    this.state.showPreview &&
                        <Modal className={styles.modal}>
                            <DetectOutsideClick
                                onOutsideClicked={() => this.setState({ showPreview: false })}
                                detectESC
                            >
                                <LeadPreview
                                    lead={lead}
                                    showScreenshot={false}
                                />
                            </DetectOutsideClick>
                        </Modal>

                }
            </div>
        );
    }
}
