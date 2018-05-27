import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '#rs/components/Action/Button';
import AccentButton from '#rs/components/Action/Button/AccentButton';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import FileInput from '#rs/components/Input/FileInput';
import SearchInput from '#rs/components/Input/SearchInput';
import FormattedDate from '#rs/components/View/FormattedDate';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import Table from '#rs/components/View/Table';
import {
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '#rs/utils/common';
import { FgRestBuilder } from '#rs/utils/rest';
import { UploadBuilder } from '#rs/utils/upload';

import { iconNames } from '#constants';
import { leadTypeIconMap } from '#entities/lead';
import {
    userGalleryFilesSelector,
    setUserGalleryFilesAction,
} from '#redux';
import {
    createUrlForGalleryFiles,
    createParamsForGet,

    urlForUpload,
    createParamsForFileUpload,
    transformAndCombineResponseErrors,
} from '#rest';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    projects: PropTypes.arrayOf(PropTypes.number),
    onClose: PropTypes.func.isRequired,

    setUserGalleryFiles: PropTypes.func.isRequired,
    galleryFiles: PropTypes.arrayOf(
        PropTypes.shape({}),
    ),
};

const defaultProps = {
    projects: undefined,
    galleryFiles: [],
};

const mapStateToProps = state => ({
    galleryFiles: userGalleryFilesSelector(state),
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
                label: _ts('components.deepGallerySelect', 'tableHeaderSelect'),
                order: 1,
                modifier: row => this.renderCheckbox(row),
            },
            {
                key: 'mimeType',
                label: _ts('components.deepGallerySelect', 'tableHeaderType'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.mimeType, b.mimeType),
                modifier: row => this.renderGalleryFileType(row),
            },
            {
                key: 'title',
                label: _ts('components.deepGallerySelect', 'tableHeaderName'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('components.deepGallerySelect', 'tableHeaderDateCreated'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.createdAt, b.createdAt),
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
    }

    componentWillMount() {
        if (this.userGalleryFilesRequest) {
            this.userGalleryFilesRequest.stop();
        }

        this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles({
            projects: this.props.projects,
        });
        this.userGalleryFilesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.projects !== this.props.projects) {
            if (this.userGalleryFilesRequest) {
                this.userGalleryFilesRequest.stop();
            }

            this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles({
                projects: nextProps.projects,
            });
            this.userGalleryFilesRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.userGalleryFilesRequest) {
            this.userGalleryFilesRequest.stop();
        }
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    onClose = () => {
        this.props.onClose([]);
    }

    onAdd = () => {
        const { selected } = this.state;
        const { galleryFiles } = this.props;

        const selectedGalleryFiles = selected.map(id => (
            galleryFiles.find(file => file.id === +id) || { id }
        ));

        this.props.onClose(selectedGalleryFiles);
    }

    getTableData = ({ galleryFiles, selected, searchInputValue }) => {
        const filterdGalleryFiles = galleryFiles.filter(
            file => caseInsensitiveSubmatch(file.title, searchInputValue),
        );

        return filterdGalleryFiles.map(file => (
            { ...file, selected: selected.includes(file.id) }
        ));
    }

    createRequestForUserGalleryFiles = (params) => {
        const userGalleryFilesRequest = new FgRestBuilder()
            .url(createUrlForGalleryFiles(params))
            .params(createParamsForGet)
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

    handleUploadButton = (files) => {
        const file = files[0];

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload({
                projects: this.props.projects,
            }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                this.setState({
                    selected: [...this.state.selected, response.id],
                });

                if (this.userGalleryFilesRequest) {
                    this.userGalleryFilesRequest.stop();
                }

                this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles({
                    projects: this.props.projects,
                });
                this.userGalleryFilesRequest.start();
            })
            .failure((response) => {
                const message = transformAndCombineResponseErrors(response.errors);
                console.error(message);
            })
            .fatal(() => {
                console.error('Couldn\t upload file');
            })
            .build();

        this.uploader.start();
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
            title={row.selected ? _ts('components.deepGallerySelect', 'unselect') : _ts('components.deepGallerySelect', 'select')}
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
                className={styles.modalHeader}
                title="Select Gallery Files"
                rightComponent={
                    <SearchInput
                        onChange={this.handleSearchInputChange}
                        placeholder={_ts('components.deepGallerySelect', 'searchGalleryPlaceholder')}
                        className={styles.searchInput}
                        label={_ts('components.deepGallerySelect', 'searchGalleryLabel')}
                        value={searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                        disabled={pending}
                    />
                }
            />,
            <ModalBody
                className={styles.modalBody}
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
                <FileInput
                    className={styles.fileInput}
                    onChange={this.handleUploadButton}
                    value=""
                    showStatus={false}
                >
                    {_ts('components.deepGallerySelect', 'uploadFileButtonLabel')}
                </FileInput>
                <Button onClick={this.onClose}>
                    {_ts('components.deepGallerySelect', 'cancelButtonLabel')}
                </Button>
                <PrimaryButton
                    onClick={this.onAdd}
                    disabled={pending}
                >
                    {_ts('components.deepGallerySelect', 'addButtonLabel')}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
