import {
    createUrlForUserGroup,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';

/*
 * parent: setState, setUsergroupView, unSetUserGroup
*/
export default class UserGroupGetRequest extends Request {
    schemaName = 'userGroupGetResponse'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        const { memberships, ...information } = response;
        this.parent.setUsergroupView({
            usergroupId: information.id,
            information,
            memberships,
        });
    }

    // TODO: notify on failure and fatal
    handleFailure = (_, response) => {
        if (response.errorCode === 404) {
            const { usergroupId } = this.extraParent;
            this.parent.unSetUserGroup({ userGroupId: usergroupId });
        }
    }

    init = (usergroupId) => {
        this.extraParent = { usergroupId };
        this.createDefault({
            url: createUrlForUserGroup(usergroupId),
            params: createParamsForGet,
        });
        return this;
    }
}
