import {
    urlForAfCreate,
    createParamsForAfCreate,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

// TODO: use project.framework namespace for strings
export default class FrameworkCreateRequest extends Request {
    schemaName = 'analysisFramework'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.addNewFramework({
            afDetail: response,
        });
        notify.send({
            title: _ts('project', 'afCreate'),
            type: notify.type.SUCCESS,
            message: _ts('project', 'afCreateSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.setActiveFramework(response.id);
        this.parent.onModalClose();
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('project', 'afCreate'),
            type: notify.type.ERROR,
            message: _ts('project', 'afCreateFatal'),
            duration: notify.duration.SLOW,
        });
        this.parent.setState({
            faramErrors: { $internal: [_ts('project', 'frameworkCreateFailure')] },
        });
    }

    init = (values) => {
        this.createDefault({
            url: urlForAfCreate,
            params: createParamsForAfCreate({
                ...values,
                project: undefined,
            }),
        });
        return this;
    }
}
