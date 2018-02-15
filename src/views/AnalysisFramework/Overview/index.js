import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';

import GridLayout from '../../../vendor/react-store/components/View/GridLayout';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import Button from '../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import {
    randomString,
    reverseRoute,
} from '../../../vendor/react-store/utils/common';

import {
    iconNames,
    pathNames,
} from '../../../constants';
import {
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,

    activeProjectSelector,
    afStringsSelector,
} from '../../../redux';

import widgetStore from '../../../widgets';
import styles from '../styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addWidget: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

const mapStateToProps = (state, props) => ({
    projectId: activeProjectSelector(state, props),
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = [];

        this.updateAnalysisFramework(props.analysisFramework);

        this.widgetEditActions = {};

        this.state = {
            showDeleteModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
        }
    }

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
    }

    getGridItems = () => this.items.map(item => ({
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.overviewGridLayout,
        minSize: this.widgets.find(w => w.id === item.widgetId).overviewMinSize,
        data: item.properties.data,
        headerRightComponent: (
            <div className="action-buttons">
                <Button
                    onClick={() => this.handleWidgetEditButtonClick(item.key)}
                    transparent
                >
                    <span className={iconNames.edit} />
                </Button>
                <DangerButton
                    onClick={() => this.handleWidgetRemoveButtonClick(item.key)}
                    transparent
                >
                    <span className={iconNames.close} />
                </DangerButton>
            </div>
        ),
    }))

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;

        return (
            <Component
                title={item.title}
                widgetKey={item.key}
                data={item.data}
                editAction={(handler) => { this.widgetEditActions[item.key] = handler; }}
                onChange={(data, filters, exportable, title) => {
                    this.handleItemChange(item.key, data, filters, exportable, title);
                }}
                className={styles.component}
            />
        );
    };

    handleWidgetClose = (y) => {
        if (y) {
            const {
                analysisFramework,
                removeWidget,
            } = this.props;
            const {
                deleteKey: id,
            } = this.state;

            const widgetData = {
                analysisFrameworkId: analysisFramework.id,
                widgetId: id,
            };

            removeWidget(widgetData);
        }

        this.setState({
            showDeleteModal: false,
            deleteKey: undefined,
        });
    }

    handleWidgetEditButtonClick = (id) => {
        if (this.widgetEditActions[id]) {
            (this.widgetEditActions[id])();
        }
    }

    handleWidgetRemoveButtonClick = (key) => {
        this.setState({
            showDeleteModal: true,
            deleteKey: key,
        });
    }

    handleAddWidgetButtonClick = (id) => {
        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            key: `overview-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: widget.title,
            // TODO: calculate new position appropriately
            properties: {
                overviewGridLayout: widget.overviewComponent && {
                    left: 0,
                    top: 0,
                    ...widget.overviewMinSize || { width: 200, height: 50 },
                },
                listGridLayout: widget.listComponent && {
                    left: 0,
                    top: 0,
                    ...widget.listMinSize || { width: 200, height: 50 },
                },
            },
        };

        this.props.addWidget({
            analysisFrameworkId,
            widget: item,
            filters: [],
            exportable: {},
        });
    }

    handleLayoutChange = (items) => {
        items.forEach((item) => {
            const originalItem = this.items.find(i => i.key === item.key);
            const settings = {
                properties: {
                    overviewGridLayout: { $set: item.layout },
                },
            };

            const analysisFrameworkId = this.props.analysisFramework.id;
            const widget = update(originalItem, settings);
            this.props.updateWidget({ analysisFrameworkId, widget });
        });
    }

    handleItemChange = (key, data, filters, exportable, title) => {
        const originalItem = this.items.find(i => i.key === key);
        const settings = {
            title: { $set: title || originalItem.title },
            properties: {
                data: { $set: data },
            },
        };

        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = update(originalItem, settings);

        this.props.updateWidget({ analysisFrameworkId, widget, filters, exportable });
    }

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.overviewComponent)
            .map(widget => ({
                id: widget.id,
                title: this.props.afStrings(widget.title),
                overviewComponent: widget.analysisFramework.overviewComponent,
                listComponent: widget.analysisFramework.listComponent,
                overviewMinSize: widget.analysisFramework.overviewMinSize,
                listMinSize: widget.analysisFramework.listMinSize,
            }));

        this.items = analysisFramework.widgets.filter(
            w => this.widgets.find(w1 => w1.id === w.widgetId),
        );

        this.gridItems = this.getGridItems();
    }

    handleExitButtonClick = () => {
        const {
            projectId,
            mainHistory,
        } = this.props;
        const url = `${reverseRoute(pathNames.projects, { projectId })}#/analysis-framework`;
        mainHistory.push(url);
    }

    render() {
        return (
            <div styleName="overview">
                <header styleName="header">
                    <h2>
                        {this.props.afStrings('analysisFramework')}
                        /
                        <small>
                            {this.props.afStrings('headerOverview')}
                        </small>
                    </h2>
                    <div styleName="actions">
                        <Link
                            styleName="link-to-list"
                            to="/list"
                            replace
                        >
                            {this.props.afStrings('gotoListButtonLabel')}
                        </Link>
                        <SuccessButton onClick={this.props.onSave} >
                            {this.props.afStrings('saveButtonLabel')}
                        </SuccessButton>
                        <PrimaryButton onClick={() => this.handleExitButtonClick()}>
                            {this.props.afStrings('exitButtonLabel')}
                        </PrimaryButton>
                    </div>
                </header>
                <div styleName="content">
                    <div styleName="widget-list">
                        {
                            this.widgets.map(widget => (
                                <div
                                    styleName="widget-list-item"
                                    key={widget.id}
                                >
                                    <div styleName="title">
                                        {widget.title}
                                    </div>
                                    <div styleName="actions">
                                        <Button
                                            transparent
                                            onClick={
                                                () => this.handleAddWidgetButtonClick(widget.id)
                                            }
                                        >
                                            <span className={iconNames.add} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div styleName="grid-layout-wrapper">
                        <GridLayout
                            styleName="grid-layout"
                            modifier={this.getItemView}
                            items={this.gridItems}
                            onLayoutChange={this.handleLayoutChange}
                        />
                        <Confirm
                            title="Remove widget" // FIXME: strings
                            onClose={this.handleWidgetClose}
                            show={this.state.showDeleteModal}
                        >
                            <p>
                                Do you want to remove this widget?
                            </p>
                        </Confirm>
                        {/* FIXME: strings */}
                    </div>
                </div>
            </div>
        );
    }
}