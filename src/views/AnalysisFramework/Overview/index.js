import PropTypes from 'prop-types';
import React from 'react';

import Faram from '#rscg/Faram';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';

import {
    widgetListingVisibility,
    widgetList,
    VIEW,
} from '#widgets';
import _ts from '#ts';

import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const overviewWidgets = widgetList.filter(
    w => widgetListingVisibility(w.widgetId, VIEW.overview),
);

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
    faramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    faramErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    faramSchema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    faramValues: {},
    faramErrors: {},
    faramSchema: {},
};

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static layoutSelector = (widget) => {
        const { properties: { overviewGridLayout } = {} } = widget;
        return overviewGridLayout;
    }

    static keySelector = widget => widget.key;

    render() {
        const {
            analysisFramework: {
                id: analysisFrameworkId,
                widgets,
            } = {},
            pending,
            faramValues,
            faramErrors,
            faramSchema,
            onChange,
        } = this.props;

        return (
            <div className={styles.overview}>
                <WidgetList
                    className={styles.widgetList}
                    widgets={overviewWidgets}
                    widgetType={VIEW.overview}
                    analysisFrameworkId={analysisFrameworkId}
                />
                <div className={styles.gridLayoutContainer}>
                    <Faram
                        className={styles.header}
                        onChange={onChange}
                        schema={faramSchema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={pending}
                    >
                        <TextInput
                            className={styles.nameInput}
                            label={_ts('project', 'addAfTitleLabel')}
                            faramElementName="title"
                            placeholder={_ts('project', 'addAfTitlePlaceholder')}
                        />
                        <TextArea
                            className={styles.descriptionInput}
                            label={_ts('project', 'projectDescriptionLabel')}
                            faramElementName="description"
                            placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                            rows={1}
                        />
                    </Faram>
                    <div className={styles.scrollWrapper}>
                        <WidgetEditor
                            widgets={widgets}
                            widgetType={VIEW.overview}
                            analysisFrameworkId={analysisFrameworkId}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
