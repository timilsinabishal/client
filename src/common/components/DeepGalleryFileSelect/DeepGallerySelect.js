import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';

import {
    Table,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormattedDate,
    LoadingAnimation,
} from '../../../public/components/View';
import { TextInput } from '../../../public/components/Input';
import {
    PrimaryButton,
    AccentButton,
    Button,
} from '../../../public/components/Action';

import {
    caseInsensitiveSubmatch,
} from '../../../public/utils/common';

import {
    urlForUsersGalleryFiles,
    createHeaderForGalleryFile,
} from '../../../common/rest';

import {
    userGalleryFilesSelector,
    setUserGalleryFilesAction,
    commonStringsSelector,
} from '../../../common/redux';

import {
    iconNames,
} from '../../../common/constants';

import { FgRestBuilder } from '../../../public/utils/rest';

import { leadTypeIconMap } from '../../../common/entities/lead';

const propTypes = {
    onClose: PropTypes.func.isRequired,

    setUserGalleryFiles: PropTypes.func.isRequired,
    galleryFiles: PropTypes.arrayOf(
        PropTypes.shape({}),
    ),
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    galleryFiles: [],
};

const mapStateToProps = state => ({
    galleryFiles: userGalleryFilesSelector(state),
    commonStrings: commonStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGalleryFiles: params => dispatch(setUserGalleryFilesAction(params)),
});

/*
 * Deep Gallery Files Selector Component
 *
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class DgSelect extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.galleryFilesHeader = [
            {
                key: 'actions',
                label: this.props.commonStrings('tableHeaderSelect'),
                order: 1,
                modifier: row => this.renderCheckbox(row),
            },
            {
                key: 'mimeType',
                label: this.props.commonStrings('tableHeaderType'),
                order: 2,
                sortable: true,
                comparator: (a, b) => (a.mimeType || '').localeCompare(b.mimeType || ''),
                modifier: row => this.renderGalleryFileType(row),
            },
            {
                key: 'title',
                label: this.props.commonStrings('tableHeaderName'),
                order: 3,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'createdAt',
                label: this.props.commonStrings('tableHeaderDateCreated'),
                order: 4,
                sortable: true,
                comparator: (a, b) => a.createdAt.localeCompare(b.createdAt),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            pending: true,
            selected: [],
            searchInputValue: undefined,
        };

        this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles();
    }

    componentWillMount() {
        if (this.userGalleryFilesRequest) {
            this.userGalleryFilesRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.userGalleryFilesRequest) {
            this.userGalleryFilesRequest.stop();
        }
    }

    onClose = () => {
        this.setState({ selected: [] });
        this.props.onClose([]);
    }

    onAdd = () => {
        const { selected } = this.state;
        const { galleryFiles } = this.props;

        const selectedGalleryFiles = selected.map(id => (
            galleryFiles.find(file => file.id === +id) || { id }
        ));

        this.props.onClose(selectedGalleryFiles);
        this.setState({ selected: [] });
    }

    getTableData = ({ galleryFiles, selected, searchInputValue }) => {
        const filterdGalleryFiles = galleryFiles.filter(file =>
            caseInsensitiveSubmatch(file.title, searchInputValue),
        );

        return filterdGalleryFiles.map(file => (
            { ...file, selected: selected.includes(file.id) }
        ));
    }

    createRequestForUserGalleryFiles = () => {
        const userGalleryFilesRequest = new FgRestBuilder()
            .url(urlForUsersGalleryFiles)
            .params(createHeaderForGalleryFile())
            .preLoad(() => {
                this.setState({
                    pending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    pending: false,
                });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.props.setUserGalleryFiles({
                        galleryFiles: response.results,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error('Failed to get user gallery files', response);
                this.setState({
                    pending: false,
                });
            })
            .fatal((response) => {
                console.error('Fatal error occured while getting users gallery files', response);
                this.setState({
                    pending: false,
                });
            })
            .build();
        return userGalleryFilesRequest;
    }

    handleFileSelection = (file) => {
        const { selected } = this.state;
        const index = selected.indexOf(file.id);
        if (index === -1) {
            // add to array
            this.setState({
                selected: selected.concat(file.id),
            });
        } else {
            // remove from array
            const newSelected = [...selected];
            newSelected.splice(index, 1);
            this.setState({
                selected: newSelected,
            });
        }
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({
            searchInputValue,
        });
    };

    keyExtractor = file => file.id

    renderGalleryFileType = (row) => {
        const icon = leadTypeIconMap[row.mimeType] || iconNames.documentText;
        const url = row.file;
        if (!url) {
            return (
                <i className={icon} />
            );
        }
        return (
            <a href={url} target="_blank">
                <i className={icon} />
            </a>
        );
    }

    renderCheckbox = row => (
        <AccentButton
            // FIXME: use strings
            title={row.selected ? 'Unselect' : 'Select'}
            onClick={() => this.handleFileSelection(row)}
            smallVerticalPadding
            transparent
            iconName={row.selected ? iconNames.checkbox : iconNames.checkboxOutlineBlank}
        />
    )

    render() {
        const {
            pending,
            selected,
            searchInputValue,
        } = this.state;

        const { galleryFiles } = this.props;

        // FIXME: performance problem
        const tableData = this.getTableData({
            galleryFiles,
            selected,
            searchInputValue,
        });

        return ([
            <ModalHeader
                key="header"
                className={styles['modal-header']}
                title="Select Gallery Files"
                rightComponent={
                    <TextInput
                        onChange={this.handleSearchInputChange}
                        placeholder={this.props.commonStrings('searchGalleryPlaceholder')}
                        className={styles['search-input']}
                        type="search"
                        label={this.props.commonStrings('searchGalleryLabel')}
                        value={searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                        disabled={pending}
                    />
                }
            />,
            <ModalBody
                className={styles['modal-body']}
                key="body"
            >
                { pending && <LoadingAnimation /> }
                <Table
                    data={tableData}
                    headers={this.galleryFilesHeader}
                    keyExtractor={this.keyExtractor}
                    defaultSort={this.defaultSort}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button
                    onClick={this.onClose}
                >
                    {this.props.commonStrings('cancelButtonLabel')}
                </Button>
                <PrimaryButton
                    onClick={this.onAdd}
                    disabled={pending}
                >
                    {this.props.commonStrings('addButtonLabel')}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
