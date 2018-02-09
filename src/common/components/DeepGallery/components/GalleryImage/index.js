import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { iconNames } from '../../../../constants';
import { commonStringsSelector } from '../../../../redux';

import styles from './styles.scss';

export { galleryImageMimeType as supportedMimeType } from '../../../../config/deepMimeTypes';

const propTypes = {
    className: PropTypes.string,
    imageUrl: PropTypes.string,
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    imageUrl: undefined,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

/*
 * Gallery viewer component for Images [galleryImageMimeType]
 */
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class GalleryImage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            imageUrl,
        } = this.props;

        return (
            <div
                styleName="gallery-image"
                className={`gallery-image ${className}`}
            >
                {
                    imageUrl ? (
                        <img
                            alt={this.props.commonStrings('altUser')}
                            className="image"
                            styleName="image"
                            src={imageUrl}
                        />
                    ) : (
                        <span
                            styleName="image-alt"
                            className={`image-alt ${iconNames.user}`}
                        />
                    )
                }
            </div>
        );
    }
}
