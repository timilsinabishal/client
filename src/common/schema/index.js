import dict from '../../vendor/ravl/schema';
import attachValidator from '../../vendor/ravl/attachValidator';

import leads from './leads';
import projects from './projects';
import regions from './regions';
import token from './token';
import userGroups from './userGroups';
import users from './users';

// ATTACHING BEHAVIORS
attachValidator(dict);

// ATTACHING USER DEFINED SCHEMAS

const userDefinedSchemas = [];

// TODO: add errorResponse and successResponse in RestRequest

{
    const name = 'dbentity';
    const schema = {
        doc: {
            name: 'Database Entity',
            description: 'Defines all the attributes common to db entities',
        },
        fields: {
            createdAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint' },
            createdByName: { type: 'string' },
            id: { type: 'uint', required: true },
            modifiedAt: { type: 'string', required: true }, // date
            modifiedBy: { type: 'uint' },
            modifiedByName: { type: 'string' },
        },
    };
    userDefinedSchemas.push({ name, schema });
}

[
    ...userDefinedSchemas,
    ...leads,
    ...projects,
    ...regions,
    ...token,
    ...userGroups,
    ...users,
].forEach(({ name, schema }) => dict.put(name, schema));

export default dict;