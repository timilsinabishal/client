import PropTypes from 'prop-types';
import React from 'react';

import GridViewLayout from '#rscv/GridViewLayout';
import Faram from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';


import {
    fetchWidget,
    VIEW,
} from '#widgets';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    entry: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired,
};

const defaultProps = {
    className: '',
};

const widgetLayoutSelector = (widget) => {
    const {
        properties: {
            listGridLayout,
        } = {},
    } = widget;
    return listGridLayout;
};

const widgetKeySelector = widget => widget.key;

const emptySchema = { fields: {} };

export default class Entry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;


    renderWidgetHeader = (widget) => {
        const { title } = widget;

        const className = `
            ${styles.header}
        `;

        return (
            <div className={className}>
                <h5
                    title={title}
                    className={styles.heading}
                >
                    { title }
                </h5>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetId,
            id,
        } = widget;

        const {
            entry: {
                entryType,
                excerpt,
                image,
                dataSeries,
            },
        } = this.props;

        const { viewComponent: Widget } = fetchWidget(VIEW.list, widgetId);

        let child;
        if (widgetId === 'excerptWidget') {
            child = (
                <Widget
                    className={styles.content}
                    widget={widget}
                    widgetName={widgetId}
                    widgetType={VIEW.list}

                    entryType={entryType}
                    excerpt={excerpt}
                    image={image}
                    dataSeries={dataSeries}
                />
            );
        } else {
            child = (
                <Widget
                    className={styles.content}
                    widget={widget}
                    widgetName={widgetId}
                    widgetType={VIEW.list}
                />
            );
        }

        return (
            <FaramGroup faramElementName={String(id)}>
                <FaramGroup faramElementName="data">
                    { child }
                </FaramGroup>
            </FaramGroup>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            widgets,
            entry: {
                attributes,
            },
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.entry}
        `;

        return (
            <Faram
                className={className}
                value={attributes}
                schema={emptySchema}
            >
                <GridViewLayout
                    className={className}
                    data={widgets}
                    itemClassName={styles.widget}
                    itemContentModifier={this.renderWidgetContent}
                    itemHeaderModifier={this.renderWidgetHeader}
                    keySelector={widgetKeySelector}
                    layoutSelector={widgetLayoutSelector}
                />
            </Faram>
        );
    }
}
