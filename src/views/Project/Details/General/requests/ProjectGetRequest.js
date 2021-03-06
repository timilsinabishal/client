import Request from '#utils/Request';
import { checkVersion } from '#rsu/common';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForProject,
    createParamsForGet,
} from '#rest';

export default class ProjectGetRequest extends Request {
    schemaName = 'projectGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ pendingProjectGet: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectGet: false });
    }

    handleSuccess = (response) => {
        const { setProjectDetails } = this.parent;

        const {
            shouldSetValue,
            isValueOverriden,
        } = checkVersion(this.projectServerData.versionId, response.versionId);

        if (shouldSetValue || this.isBeingCancelled) {
            const project = {
                faramValues: response,
            };
            setProjectDetails({ project, projectId: this.projectId });
        }
        if (isValueOverriden && !this.isBeingCancelled) {
            notify.send({
                type: notify.type.WARNING,
                title: _ts('project', 'project'),
                message: _ts('project', 'projectUpdateOverriden'),
                duration: notify.duration.SLOW,
            });
        }
    }

    handleFailure = (faramErrors) => {
        this.parent.setErrorProjectDetails({
            faramErrors,
            projectId: this.projectId,
        });
    }

    handleFatal = () => {
        this.parent.setErrorProjectDetails({
            faramErrors: { $internal: [_ts('project', 'projectGetFailure')] },
            projectId: this.projectId,
        });
    }

    init = (projectId, projectServerData, isBeingCancelled = false) => {
        this.projectId = projectId;
        this.projectServerData = projectServerData;
        this.isBeingCancelled = isBeingCancelled;

        this.createDefault({
            url: createUrlForProject(projectId),
            params: createParamsForGet(),
        });

        return this;
    }
}
