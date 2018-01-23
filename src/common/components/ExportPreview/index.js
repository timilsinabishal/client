import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    createParamsForGenericGet,
    createUrlForExport,
} from '../../../common/rest';
import GalleryDocs from '../DeepGallery/components/GalleryDocs';

import {
    LoadingAnimation,
} from '../../../public/components/View';

import {
    exportStrings,
} from '../../../common/constants';

const propTypes = {
    className: PropTypes.string,
    exportId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onLoad: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
};
const defaultProps = {
    className: '',
    exportId: undefined,
    onLoad: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class ExportPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            error: undefined,
            exportObj: undefined,
        };
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.exportId !== nextProps.exportId) {
            this.create(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
    }

    create(props) {
        const { exportId } = props;

        if (!exportId) {
            this.setState({
                pending: false,
                error: undefined,
                exportObj: undefined,
            });
            return;
        }

        if (this.previewRequest) {
            this.previewRequest.stop();
        }
        this.previewRequest = this.createPreviewRequest(exportId);
        this.previewRequest.start();
    }

    createPreviewRequest = exportId => (
        new FgRestBuilder()
            .url(createUrlForExport(exportId))
            .params(createParamsForGenericGet)
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => response.pending)
            .success((response) => {
                this.setState({
                    pending: false,
                    error: undefined,
                    exportObj: response,
                });

                if (this.props.onLoad) {
                    this.props.onLoad(response);
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: exportStrings.erverErrorText,
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: exportStrings.connectionFailureText,
                });
            })
            .build()
    );

    renderContent() {
        const {
            error,
            exportObj,
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    { error }
                </div>
            );
        }

        if (exportObj) {
            return (
                <GalleryDocs
                    docUrl={exportObj.file}
                    mimeType={exportObj.mimeType}
                    isSameOrigin
                />
            );
        }

        return (
            <div styleName="message">
                {exportStrings.previewNotAvailableLabel}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        return (
            <div
                className={className}
                styleName="export-preview"
            >
                { pending && <LoadingAnimation /> }
                { !pending && this.renderContent() }
            </div>
        );
    }
}
