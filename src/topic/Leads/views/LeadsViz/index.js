import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { FgRestBuilder } from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';
import {
    SunBurstView,
    ChordDiagramView,
    TreeMapView,
    CorrelationMatrixView,
    ForceDirectedGraphView,
    CollapsibleTreeView,
    RadialDendrogramView,
} from '../../../../public/components/Visualization';
import { FormattedDate } from '../../../../public/components/View';

import {
    urlForLeadTopicModeling,
    createParamsForLeadTopicModeling,
    createUrlForLeadsOfProject,
    createParamsForUser,
    transformResponseErrorToFormError,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    leadPageFilterSelector,

    setLeadVisualizationAction,
    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
} from '../../../../common/redux';

import schema from '../../../../common/schema';

import {
    pathNames,
} from '../../../../common/constants/';

import notify from '../../../../common/notify';

import FilterLeadsForm from '../Leads/components/FilterLeadsForm';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    hierarchicalData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    correlationData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    chordData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    forceDirectedData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setLeadVisualization: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    filters: leadPageFilterSelector(state),
    hierarchicalData: hierarchialDataSelector(state),
    chordData: chordDataSelector(state),
    correlationData: correlationDataSelector(state),
    forceDirectedData: forceDirectedDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadVisualization: parms => dispatch(setLeadVisualizationAction(parms)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadsViz extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // REST UTILS
    // TODO: move this somewhere
    static getFiltersForRequest = (filters) => {
        const requestFilters = {};
        Object.keys(filters).forEach((key) => {
            const filter = filters[key];
            switch (key) {
                case 'created_at':
                    if (filter) {
                        requestFilters.created_at__gt = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.created_at__lt = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                case 'published_on':
                    if (filter) {
                        requestFilters.published_on__gt = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.published_on__lt = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                default:
                    requestFilters[key] = filter;
                    break;
            }
        });
        return requestFilters;
    }

    static sizeValueAccessor = d => d.size;
    static labelValueAccessor = d => d.name;
    static groupValueAccessor = d => d.group;
    static valueAccessor = d => d.value;

    constructor(props) {
        super(props);

        this.state = {
            loadingLeads: true,
            hierarchicalDataPending: true,
            chordDataPending: true,
            correlationDataPending: true,
            forceDirectedDataPending: true,
        };
    }

    componentWillMount() {
        this.leadCDIdRequest = this.createRequestForProjectLeadsCDId({
            activeProject: this.props.activeProject,
            filters: this.props.filters,
        });
        this.leadCDIdRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.filters !== this.props.filters ||
            nextProps.activeProject !== this.props.activeProject
        ) {
            if (this.leadCDIdRequest) {
                this.leadCDIdRequest.stop();
            }
            if (this.requestForLeadTopicmodeling) {
                this.requestForLeadTopicmodeling.stop();
            }

            this.leadCDIdRequest = this.createRequestForProjectLeadsCDId({
                activeProject: nextProps.activeProject,
                filters: nextProps.filters,
            });
            this.leadCDIdRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        if (this.requestForLeadTopicmodeling) {
            this.requestForLeadTopicmodeling.stop();
        }
    }

    createRequestForProjectLeadsCDId = ({ activeProject, filters }) => {
        const sanitizedFilters = LeadsViz.getFiltersForRequest(filters);

        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            fields: 'classified_doc_id',
            ...sanitizedFilters,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({
                    loadingLeads: true,
                    hierarchicalDataPending: true,
                    chordDataPending: true,
                    correlationDataPending: true,
                    forceDirectedDataPending: true,
                });
            })
            .postLoad(() => {
            })
            .success((response) => {
                try {
                    schema.validate(response, 'leadsCDIdGetResponse');
                    const docIds = response.results.reduce((acc, lead) => {
                        if (lead.classifiedDocId) {
                            acc.push(lead.classifiedDocId);
                        }
                        return acc;
                    }, []);

                    this.requestForLeadTopicmodeling =
                        this.createRequestForLeadTopicModeling(docIds);
                    this.requestForLeadTopicmodeling.start();

                    this.setState({ loadingLeads: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    loadingLeads: false,
                    hierarchicalDataPending: false,
                    chordDataPending: false,
                    correlationDataPending: false,
                    forceDirectedDataPending: false,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load leads', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    loadingLeads: false,
                    hierarchicalDataPending: false,
                    chordDataPending: false,
                    correlationDataPending: false,
                    forceDirectedDataPending: false,
                });
            })
            .build();
        return leadRequest;
    }

    createRequestForLeadTopicModeling = (docIds) => {
        const request = new FgRestBuilder()
            .url(urlForLeadTopicModeling)
            .params(createParamsForLeadTopicModeling({
                doc_ids: docIds,
                number_of_topics: 5,
                depth: 2,
                keywords_per_topic: 3,
            }))
            .preLoad(() => {
                this.setState({ hierarchicalDataPending: true });
            })
            .postLoad(() => {
                this.setState({ hierarchicalDataPending: false });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.props.setLeadVisualization({ data: response });
                } catch (err) {
                    console.error(err);
                }
            })
            .build();
        return request;
    }

    render() {
        const {
            activeProject,
            chordData,
            hierarchicalData,
            correlationData,
            forceDirectedData,
        } = this.props;

        const {
            loadingLeads,
            hierarchicalDataPending,
            chordDataPending,
            correlationDataPending,
            forceDirectedDataPending,
        } = this.state;

        return (
            <div styleName="leads">
                <header styleName="header">
                    <FilterLeadsForm styleName="filters" />
                </header>
                <div styleName="viz-container">
                    <TreeMapView
                        styleName="tree-map viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        valueAccessor={LeadsViz.sizeValueAccessor}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <SunBurstView
                        styleName="sun-burst viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        valueAccessor={LeadsViz.sizeValueAccessor}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <ChordDiagramView
                        styleName="chord-diagram viz"
                        data={chordData.values}
                        loading={loadingLeads || chordDataPending}
                        labelsData={chordData.labels}
                        valueAccessor={LeadsViz.sizeValueAccessor}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <CorrelationMatrixView
                        styleName="correlation-matrix viz"
                        data={correlationData}
                        loading={loadingLeads || correlationDataPending}
                    />
                    <ForceDirectedGraphView
                        styleName="force-directed-graph viz"
                        data={forceDirectedData}
                        loading={loadingLeads || forceDirectedDataPending}
                        idAccessor={d => d.id}
                        groupAccessor={LeadsViz.groupValueAccessor}
                        valueAccessor={LeadsViz.valueAccessor}
                        useVoronoi={false}
                    />
                    <CollapsibleTreeView
                        styleName="collapsible-tree viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <RadialDendrogramView
                        styleName="radial-dendrogram viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                </div>
                <footer styleName="footer">
                    <div styleName="link-container">
                        <Link
                            styleName="link"
                            to={reverseRoute(pathNames.leads, { projectId: activeProject })}
                            replace
                        >
                            Show Table
                        </Link>
                    </div>
                </footer>
            </div>
        );
    }
}