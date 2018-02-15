import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import schema from '../../../schema';

import {
    urlForGoogleDriveFileUpload,
    createHeaderForGoogleDriveFileUpload,
} from '../../../rest';

export default class GoogleDriveUploadModule {
    constructor(parent) {
        this.parent = parent;
    }

    createRequest = ({ leadId, title, accessToken, fileId, mimeType }) => {
        const googleDriveUploadRequest = new FgRestBuilder()
            .url(urlForGoogleDriveFileUpload)
            .params(createHeaderForGoogleDriveFileUpload({
                title, accessToken, fileId, mimeType,
            }))
            .delay(0)
            .success(this.handleLeadGoogleDriveUploadSuccess(leadId))
            .build();
        return googleDriveUploadRequest;
    }

    handleLeadGoogleDriveUploadSuccess = leadId => (response) => {
        // FOR DATA CHANGE
        try {
            schema.validate(response, 'galleryFile');

            const { addLeadViewLeadChange } = this.parent.props;
            addLeadViewLeadChange({
                leadId,
                values: { attachment: { id: response.id } },
                upload: {
                    title: response.title,
                    url: response.file,
                },
                uiState: { pristine: false },
            });

            // FOR UPLAOD
            this.parent.setState((state) => {
                const uploadSettings = {
                    [leadId]: { $auto: {
                        pending: { $set: undefined },
                    } },
                };
                const leadDriveRests = update(state.leadDriveRests, uploadSettings);
                return { leadDriveRests };
            });

            this.parent.driveUploadCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.error(err);
        }
    }
}