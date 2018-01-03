import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    ListView,
} from '../../../../public/components/View';

import {
    categoryEditorNgramsSelector,
} from '../../../../common/redux';

import styles from '../styles.scss';

const propTypes = {
    ngrams: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    ngrams: categoryEditorNgramsSelector(state, props),
});


const mapDispatchToProps = dispatch => ({
    dispatch,
});


@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class DocumentNGram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { selectedNGramIndex: 0 };
    }

    getNGramSelectStyleName = (i) => {
        const { selectedNGramIndex } = this.state;

        const styleNames = [];
        styleNames.push(styles['ngram-select']);
        if (selectedNGramIndex === i) {
            styleNames.push(styles.active);
        }
        return styleNames.join(' ');
    }

    handleNGramSelectButtonClick = (i) => {
        this.setState({ selectedNGramIndex: i });
    }

    handleOnDragStart = keyword => (e) => {
        const data = JSON.stringify({
            n: keyword.split(' ').length,
            keyword,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    keyExtractorKeywordTuple = keywordTuple => keywordTuple[0];

    renderNGramSelect = (key, data, i) => (
        <button
            key={key}
            className={this.getNGramSelectStyleName(i)}
            onClick={() => this.handleNGramSelectButtonClick(i)}
        >
            {i + 1}
        </button>
    )

    renderNGram = (key, keywordTuple) => (
        <div
            className={styles.ngram}
            key={key}
            draggable
            onDragStart={this.handleOnDragStart(keywordTuple[0])}
        >
            <span className={styles.title}>
                { keywordTuple[0] }
            </span>
            <span className={styles.strength}>
                { keywordTuple[1] }
            </span>
        </div>
    )

    render() {
        const {
            ngrams,
        } = this.props;

        const { selectedNGramIndex } = this.state;

        // TODO: use selector or move to componentWillReceiveProps
        const ngramKeys = Object.keys(ngrams);
        ngramKeys.sort();

        const selectedNGram = ngrams[ngramKeys[selectedNGramIndex]];

        return (
            <div styleName="ngrams-tab" >
                <ListView
                    styleName="ngram-list"
                    data={selectedNGram}
                    modifier={this.renderNGram}
                    keyExtractor={this.keyExtractorKeywordTuple}
                />
                <div styleName="ngram-selects">
                    <h4 styleName="heading">
                        Number of words:
                    </h4>
                    <ListView
                        styleName="ngram-select-list"
                        data={ngramKeys}
                        modifier={this.renderNGramSelect}
                        keyExtractor={this.keyExtractorKeywordTuple}
                    />
                </div>
            </div>
        );
    }
}
