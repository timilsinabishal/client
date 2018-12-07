import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import Message from '#rscv/Message';
import urlRegex from '#rsu/regexForWeburl';

import { galleryMapping, galleryType } from '#config/deepMimeTypes';
import { iconNames } from '#constants';
import notify from '#notify';
import _ts from '#ts';

import Screenshot from '../../../Screenshot';
import GalleryImage from '../GalleryImage';
import GalleryDocs from '../GalleryDocs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    mimeType: PropTypes.string,
    canShowIframe: PropTypes.bool,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,

    showTabular: PropTypes.bool,
    onTabularClick: PropTypes.func,

    invalidUrlMessage: PropTypes.string,
    cannotPreviewUrlMessage: PropTypes.string,
};

const defaultProps = {
    className: '',
    url: '',
    mimeType: '',
    canShowIframe: false,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,
    showTabular: false,
    onTabularClick: undefined,

    invalidUrlMessage: undefined,
    cannotPreviewUrlMessage: undefined,
};


const isUrlValid = url => (url && urlRegex.test(url));

const Preview = ({
    className,
    url,
    mimeType,
    canShowIframe,
    previewError,
    isHttps,
    cannotPreviewUrlMessage,
    invalidUrlMessage,
}) => {
    if (isHttps && galleryMapping[mimeType] === galleryType.IMAGE) {
        return (
            <GalleryImage
                className={className}
                imageUrl={url}
                canShowIframe={canShowIframe}
            />
        );
    } else if (galleryMapping[mimeType] === galleryType.DOC) {
        return (
            <GalleryDocs
                className={className}
                docUrl={url}
                mimeType={mimeType}
                canShowIframe={canShowIframe}
                notHttps={!isHttps}
            />
        );
    } else if (!previewError && (
        galleryMapping[mimeType] === galleryType.HTML || url.endsWith('txt')
    )) {
        // NOTE: Error can occur if
        // 1. We cannot show iframe
        // 2. If there is no alternative https url and current url is http
        return (
            <iframe
                className={className}
                sandbox="allow-scripts allow-same-origin"
                title={url}
                src={url}
            />
        );
    }

    return (
        <Message className={styles.errorUrl}>
            {
                isUrlValid(url) ? (
                    cannotPreviewUrlMessage || _ts('components.galleryViewer', 'cannotPreviewUrl')
                ) : (
                    invalidUrlMessage || _ts('components.galleryViewer', 'invalidUrl')
                )
            }
        </Message>
    );
};

const Bar = ({ url = '', children }) => {
    const urlbarClassNames = [
        styles.urlbar,
        'urlbar',
    ];

    return (
        <div className={urlbarClassNames.join(' ')}>
            <TextInput
                className={styles.url}
                value={url}
                readOnly
                showLabel={false}
                showHintAndError={false}
                selectOnFocus
            />
            {
                <div className={styles.actionButtons}>
                    <a
                        className={styles.openLink}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={_ts('components.galleryViewer', 'viewLinkTooltip')} // open link in new tab
                    >
                        <span className={iconNames.openLink} />
                    </a>
                    {children}
                </div>
            }
        </div>
    );
};

/*
 * Document [pdf, image, docx, html] viewer handler
 * Use required document viewer according to the mime-type
*/
export default class GalleryViewer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            screenshotMode: false,
            currentScreenshot: undefined,
        };
    }

    // FIXME: remove this
    handleTabularClick = () => {
        const {
            onTabularClick,
            mimeType,
        } = this.props;
        onTabularClick(mimeType);
    }

    handleScreenshot = (image) => {
        this.setState({ currentScreenshot: image });
    }

    handleScreenshotStart = () => {
        this.setState({ screenshotMode: true });
    }

    handleScreenshotClose = () => {
        this.setState({ screenshotMode: false });
    }

    handleScreenshotDone = () => {
        this.setState(
            { screenshotMode: false },
            () => {
                if (this.props.onScreenshotCapture) {
                    this.props.onScreenshotCapture(this.state.currentScreenshot);
                }
            },
        );
    }

    handleScreenshotError = (message) => {
        notify.send({
            title: _ts('components.galleryViewer', 'errorTitle'), // screenshot
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });

        this.handleScreenshotClose();
    }

    renderScreenshotButton = () => {
        const {
            screenshotMode,
            currentScreenshot,
        } = this.state;

        if (!screenshotMode) {
            return (
                <AccentButton
                    iconName={iconNames.camera}
                    onClick={this.handleScreenshotStart}
                    transparent
                    title={_ts('components.galleryViewer', 'screenshotButtonTitle')} // take screenshot
                />
            );
        }

        return (
            <Fragment>
                { currentScreenshot &&
                    <SuccessButton
                        iconName={iconNames.check}
                        onClick={this.handleScreenshotDone}
                        title={_ts('components.galleryViewer', 'saveButtonTitle')} // save screenshot
                        transparent
                    />
                }
                <DangerButton
                    iconName={iconNames.close}
                    onClick={this.handleScreenshotClose}
                    title={_ts('components.galleryViewer', 'discardButtonTitle')} // discard screenshot
                    transparent
                />
            </Fragment>
        );
    }

    render() {
        const {
            className,
            url,
            mimeType,
            canShowIframe,
            showUrl,
            showScreenshot,
            showTabular,
            invalidUrlMessage,
            cannotPreviewUrlMessage,
        } = this.props;

        const { screenshotMode } = this.state;

        const isHttps = !!(url || '').match(/^https:\/\//) || window.location.protocol === 'http:';
        const previewError = !canShowIframe || !isHttps;

        const showBar = showUrl || showScreenshot;

        const containerStyles = [styles.galleryViewer];
        if (showBar) {
            containerStyles.push(styles.urlbarShown);
        }

        const docContainerClassNames = [
            styles.docContainer,
            'doc-container',
        ];

        return (
            <div className={`${containerStyles.join(' ')} ${className}`}>
                { showBar &&
                    <Bar
                        url={url}
                        showScreenshot={showScreenshot}
                        showTabular={showTabular}
                    >
                        { showScreenshot && this.renderScreenshotButton() }
                        { showTabular &&
                            <AccentButton
                                iconName={iconNames.tabular}
                                onClick={this.handleTabularClick}
                                title={_ts('components.galleryViewer', 'convertTabular')}
                                transparent
                            />
                        }
                    </Bar>
                }
                <div className={docContainerClassNames.join(' ')}>
                    { screenshotMode &&
                        <Screenshot
                            onCapture={this.handleScreenshot}
                            onCaptureError={this.handleScreenshotError}
                            onCancel={this.handleScreenshotClose}
                        />
                    }
                    <Preview
                        className={styles.doc}
                        url={url}
                        mimeType={mimeType}
                        canShowIframe={canShowIframe}
                        previewError={previewError}
                        isHttps={isHttps}
                        invalidUrlMessage={invalidUrlMessage}
                        cannotPreviewUrlMessage={cannotPreviewUrlMessage}
                    />
                </div>
            </div>
        );
    }
}
