import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rscg/Faram';
import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { findDuplicates, randomString } from '#rsu/common';

import TabTitle from '#components/TabTitle';
import { iconNames } from '#constants';
import _ts from '#ts';

import LinkWidgetModal from '#widgetComponents/LinkWidgetModal';
import GeoLink from '#widgetComponents/GeoLink';

import SectorTitle from './SectorTitle';
import SectorContent from './SectorContent';
import DimensionTitle from './DimensionTitle';
import DimensionContent from './DimensionContent';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    data: {},
};

const emptyArray = [];

export default class Matrix2dEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.id;

    static schema = {
        fields: {
            title: [requiredCondition],
            dimensions: {
                validation: (dimensions) => {
                    const errors = [];
                    if (!dimensions || dimensions.length <= 0) {
                        errors.push(_ts('widgets.editor.matrix2d', 'atLeastOneError'));
                    }

                    const duplicates = findDuplicates(dimensions, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.matrix2d',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: Matrix2dEditWidget.keySelector,
                member: {
                    fields: {
                        id: [requiredCondition],
                        color: [],
                        title: [requiredCondition],
                        tooltip: [],
                        subdimensions: {
                            validation: (subdimensions) => {
                                const errors = [];
                                if (!subdimensions || subdimensions.length <= 0) {
                                    errors.push(_ts('widgets.editor.matrix2d', 'atLeastOneError'));
                                }

                                const duplicates = findDuplicates(subdimensions, o => o.title);
                                if (duplicates.length > 0) {
                                    errors.push(_ts(
                                        'widgets.editor.matrix2d',
                                        'duplicationError',
                                        { duplicates: duplicates.join(', ') },
                                    ));
                                }
                                return errors;
                            },
                            keySelector: Matrix2dEditWidget.keySelector,
                            member: {
                                fields: {
                                    id: [requiredCondition],
                                    tooltip: [],
                                    title: [requiredCondition],
                                },
                            },
                        },
                    },
                },
            },
            sectors: {
                validation: (sectors) => {
                    const errors = [];
                    if (!sectors || sectors.length <= 0) {
                        errors.push(_ts('widgets.editor.matrix2d', 'atLeastOneError'));
                    }

                    const duplicates = findDuplicates(sectors, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.matrix2d',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: Matrix2dEditWidget.keySelector,
                member: {
                    fields: {
                        id: [requiredCondition],
                        title: [requiredCondition],
                        tooltip: [],
                        subsectors: {
                            validation: (subsectors) => {
                                const errors = [];
                                if (subsectors && subsectors.length > 0) {
                                    const duplicates = findDuplicates(subsectors, o => o.title);
                                    if (duplicates.length > 0) {
                                        errors.push(_ts(
                                            'widgets.editor.matrix2d',
                                            'duplicationError',
                                            { duplicates: duplicates.join(', ') },
                                        ));
                                    }
                                }
                                return errors;
                            },
                            keySelector: Matrix2dEditWidget.keySelector,
                            member: {
                                fields: {
                                    id: [requiredCondition],
                                    tooltip: [],
                                    title: [requiredCondition],
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                dimensions = emptyArray,
                sectors = emptyArray,
            },
        } = props;

        this.state = {
            faramValues: {
                title,
                dimensions,
                sectors,
            },
            faramErrors: {},
            pristine: false,
            showLinkModal: false,
            showNestedLinkModal: false,

            selectedDimensionKey: dimensions[0]
                ? Matrix2dEditWidget.keySelector(dimensions[0])
                : undefined,

            selectedSectorKey: sectors[0]
                ? Matrix2dEditWidget.keySelector(sectors[0])
                : undefined,

            selectedTab: 'dimensions',
        };

        this.tabs = {
            dimensions: _ts('widgets.editor.matrix2d', 'dimensionsHeaderTitle'),
            sectors: _ts('widgets.editor.matrix2d', 'sectorsHeaderTitle'),
        };

        this.views = {
            dimensions: {
                component: () => {
                    const {
                        faramValues,
                        selectedDimensionKey,
                    } = this.state;

                    const {
                        dimensions: dimensionsFromState = [],
                    } = faramValues || {};

                    const selectedDimensionIndex = dimensionsFromState.findIndex(
                        dimension => (
                            Matrix2dEditWidget.keySelector(dimension) === selectedDimensionKey
                        ),
                    );

                    return (
                        <FaramList
                            faramElementName="dimensions"
                            keySelector={Matrix2dEditWidget.keySelector}
                        >
                            <div className={styles.panels}>
                                <SortableListView
                                    className={styles.leftPanel}
                                    dragHandleModifier={this.renderDragHandle}
                                    faramElement
                                    rendererParams={this.rendererParams}
                                    itemClassName={styles.item}
                                    renderer={DimensionTitle}
                                />
                                { dimensionsFromState.length > 0 && selectedDimensionIndex !== -1 &&
                                    <DimensionContent
                                        index={selectedDimensionIndex}
                                        className={styles.rightPanel}
                                        widgetKey={this.props.widgetKey}
                                        onNestedModalChange={this.handleNestedModalChange}
                                    />
                                }
                            </div>
                        </FaramList>
                    );
                },
                wrapContainer: true,
            },
            sectors: {
                component: () => {
                    const {
                        faramValues,
                        selectedSectorKey,
                    } = this.state;

                    const {
                        sectors: sectorsFromState = [],
                    } = faramValues || {};

                    const selectedSectorIndex = sectorsFromState.findIndex(
                        sector => (
                            Matrix2dEditWidget.keySelector(sector) === selectedSectorKey
                        ),
                    );

                    return (
                        <FaramList
                            faramElementName="sectors"
                            keySelector={Matrix2dEditWidget.keySelector}
                        >
                            <div className={styles.panels}>
                                <SortableListView
                                    className={styles.leftPanel}
                                    dragHandleModifier={this.renderDragHandleSector}
                                    faramElement
                                    rendererParams={this.rendererParamsSector}
                                    itemClassName={styles.item}
                                    renderer={SectorTitle}
                                />
                                { sectorsFromState.length > 0 && selectedSectorIndex !== -1 &&
                                    <SectorContent
                                        index={selectedSectorIndex}
                                        className={styles.rightPanel}
                                        widgetKey={this.props.widgetKey}
                                        onNestedModalChange={this.handleNestedModalChange}
                                    />
                                }
                            </div>
                        </FaramList>
                    );
                },
                wrapContainer: true,
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            title,
            dimensions,
            sectors,
        } = faramValues;
        this.props.onSave(
            { dimensions, sectors },
            title,
        );
    };

    addDimensionClick = (options) => {
        const newDimension = {
            id: randomString(16).toLowerCase(),
            color: undefined,
            title: '',
            tooltip: '',
            subdimensions: [],
        };

        this.setState({
            selectedDimensionKey: Matrix2dEditWidget.keySelector(newDimension),
        });

        return [
            ...options,
            newDimension,
        ];
    }

    addDimensionFromWidgetClick = (rows, _, listOfNewRows) => {
        const newListOfRows = listOfNewRows.map(r => ({
            id: randomString(16).toLowerCase(),
            title: r.label,
            originalWidget: r.originalWidget,
            originalKey: r.originalKey,
            color: undefined,
            tooltip: '',
            subdimensions: [],
        }));
        this.setState({
            showLinkModal: false,
            selectedDimensionKey: Matrix2dEditWidget.keySelector(newListOfRows[0]),
        });
        return [
            ...rows,
            ...newListOfRows,
        ];
    };

    handleLinkModalClose = () => {
        this.setState({ showLinkModal: false });
    }

    handleAddFromWidgetClick = () => {
        this.setState({ showLinkModal: true });
    }

    handleNestedModalChange = (showNestedLinkModal) => {
        this.setState({ showNestedLinkModal });
    }

    addSectorClick = (options) => {
        const newSector = {
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
            sectors: [],
        };

        this.setState({
            selectedSectorKey: Matrix2dEditWidget.keySelector(newSector),
        });

        return [
            ...options,
            newSector,
        ];
    }

    addSectorFromWidgetClick = (rows, _, listOfNewRows) => {
        const newListOfRows = listOfNewRows.map(r => ({
            id: randomString(16).toLowerCase(),
            title: r.label,
            originalWidget: r.originalWidget,
            originalKey: r.originalKey,
            tooltip: '',
            subsectors: [],
        }));
        this.setState({
            showLinkModal: false,
            selectedSectorKey: Matrix2dEditWidget.keySelector(newListOfRows[0]),
        });
        return [
            ...rows,
            ...newListOfRows,
        ];
    };


    handleTabSelect = (selectedTab) => {
        this.setState({ selectedTab });
    }

    renderTabsWithButton = () => {
        const {
            selectedTab,
            showLinkModal,
        } = this.state;

        const addFromWidgetFaramAction = selectedTab === 'dimensions'
            ? this.addDimensionFromWidgetClick
            : this.addSectorFromWidgetClick;

        return (
            <div className={styles.tabsContainer}>
                <FaramList faramElementName={selectedTab}>
                    <NonFieldErrors
                        faramElement
                        className={styles.error}
                    />
                </FaramList>
                <FixedTabs
                    className={styles.tabs}
                    tabs={this.tabs}
                    active={selectedTab}
                    onClick={this.handleTabSelect}
                    modifier={this.renderTab}
                >
                    <div className={styles.buttonContainer}>
                        <FaramList faramElementName={selectedTab}>
                            <GeoLink
                                faramElementName="add-from-geo-btn"
                                faramAction={addFromWidgetFaramAction}
                            />
                            <PrimaryButton
                                transparent
                                iconName={iconNames.add}
                                onClick={this.handleAddFromWidgetClick}
                            >
                                {_ts('widgets.editor.matrix2d', 'addFromWidgets')}
                            </PrimaryButton>
                            {showLinkModal &&
                                <LinkWidgetModal
                                    onClose={this.handleLinkModalClose}
                                    widgetKey={this.props.widgetKey}
                                    faramElementName="add-from-widget-btn"
                                    faramAction={addFromWidgetFaramAction}
                                />
                            }
                            {
                                selectedTab === 'dimensions' ? (
                                    <PrimaryButton
                                        faramElementName="add-dimension-btn"
                                        faramAction={this.addDimensionClick}
                                        iconName={iconNames.add}
                                        transparent
                                    >
                                        {_ts('widgets.editor.matrix2d', 'addDimensionButtonTitle')}
                                    </PrimaryButton>
                                ) : (
                                    <PrimaryButton
                                        faramElementName="add-sector-btn"
                                        faramAction={this.addSectorClick}
                                        iconName={iconNames.add}
                                        transparent
                                    >
                                        {_ts('widgets.editor.matrix2d', 'addSectorButtonTitle')}
                                    </PrimaryButton>
                                )
                            }
                        </FaramList>
                    </div>
                </FixedTabs>
            </div>
        );
    }

    renderTab = (tabKey) => {
        const title = this.tabs[tabKey];

        return (
            <TabTitle
                title={title}
                faramElementName={tabKey}
            />
        );
    }
    rendererParams = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedDimension: (k) => {
            this.setState({ selectedDimensionKey: k });
        },
        isSelected: this.state.selectedDimensionKey === key,
        keySelector: Matrix2dEditWidget.keySelector,
    })

    rendererParamsSector = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedSector: (k) => {
            this.setState({ selectedSectorKey: k });
        },
        isSelected: this.state.selectedSectorKey === key,
        keySelector: Matrix2dEditWidget.keySelector,
    })

    renderDragHandle = (key) => {
        const dragHandleClassNames = [styles.dragHandle];
        const { selectedDimensionKey } = this.state;
        if (selectedDimensionKey === key) {
            dragHandleClassNames.push(styles.active);
        }

        return (
            <span className={`${iconNames.hamburger} ${dragHandleClassNames.join(' ')}`} />
        );
    };

    renderDragHandleSector = (key) => {
        const dragHandleClassNames = [styles.dragHandle];
        const { selectedSectorKey } = this.state;
        if (selectedSectorKey === key) {
            dragHandleClassNames.push(styles.active);
        }

        return (
            <span className={`${iconNames.hamburger} ${dragHandleClassNames.join(' ')}`} />
        );
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            selectedTab,
            showLinkModal,
            showNestedLinkModal,
        } = this.state;

        const {
            onClose,
            title,
        } = this.props;


        const TabsWithButton = this.renderTabsWithButton;
        const modalClassnames = [styles.editModal];
        if (showLinkModal || showNestedLinkModal) {
            modalClassnames.push(styles.disabled);
        }

        return (
            <Modal className={modalClassnames.join(' ')}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Matrix2dEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors
                            faramElement
                            className={styles.error}
                        />
                        <TextInput
                            className={styles.titleInput}
                            faramElementName="title"
                            autoFocus
                            label={_ts('widgets.editor.matrix2d', 'titleLabel')}
                            placeholder={_ts('widgets.editor.matrix2d', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                        <TabsWithButton />
                        <MultiViewContainer
                            views={this.views}
                            containerClassName={styles.modalUnitContainer}
                            active={selectedTab}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {_ts('widgets.editor.matrix2d', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {_ts('widgets.editor.matrix2d', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
