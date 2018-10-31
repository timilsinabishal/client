import React from 'react';
import PropTypes from 'prop-types';

const ESCAPE_KEY = 27;

export default class DetectOutsideClick extends React.Component {
    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPressed);
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPressed);
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    onReference = (ref) => {
        this.wrapperRef = ref;
    }

    handleClickOutside = (event) => {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.props.onOutsideClicked();
        }
    }

    handleKeyPressed = (event) => {
        const { detectESC } = this.props;
        if (detectESC && event.keyCode === ESCAPE_KEY) {
            this.props.onOutsideClicked();
        }
    }

    render() {
        return (
            <div
                ref={this.onReference}
                style={{ width: '100%', height: '100%' }}
            >
                {this.props.children}
            </div>
        );
    }
}

DetectOutsideClick.propTypes = {
    detectESC: PropTypes.bool,
    onOutsideClicked: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
};

DetectOutsideClick.defaultProps = {
    detectESC: false,
};
