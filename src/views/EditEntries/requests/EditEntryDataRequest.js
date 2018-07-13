import {
    createUrlEditEntryGet,
    createParamsForGet,
} from '#rest';
import {
    createDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '#entities/editEntries';
import notify from '#notify';
import Request from '#utils/Request';
import _ts from '#ts';

export default class EditEntryDataRequest extends Request {
    schemaName = 'entriesForEditEntriesGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ pendingEditEntryData: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingEditEntryData: false });
    }

    handleSuccess = (response) => {
        const {
            lead,
            geoOptions,
            analysisFramework,
            entries,
            regions,
        } = response;
        const { leadId } = this;

        this.parent.setLead({ lead });

        const oldAf = this.parent.getAf();
        if (oldAf.versionId < analysisFramework.versionId) {
            notify.send({
                type: notify.type.WARNING,
                title: _ts('editEntry', 'entryClearedTitle'),
                message: _ts('editEntry', 'entryClearedDetail'),
                duration: notify.duration.SLOW,
            });

            this.parent.clearEntries({ leadId });
        }
        this.parent.setAnalysisFramework({ analysisFramework });

        this.parent.setGeoOptions({
            projectId: lead.project,
            locations: geoOptions,
        });

        this.parent.setRegions({
            projectId: lead.project,
            regions,
        });

        const diffs = createDiff(this.parent.getEntries(), entries);

        if (getApplicableDiffCount(diffs) <= 0) {
            return;
        }

        this.parent.setEntries({ leadId, entryActions: diffs });

        if (getApplicableAndModifyingDiffCount(diffs) <= 0) {
            return;
        }

        notify.send({
            type: notify.type.WARNING,
            title: _ts('editEntry', 'entryUpdate'),
            message: _ts('editEntry', 'entryUpdateOverridden'),
            duration: notify.duration.SLOW,
        });
    }

    init = ({ leadId }) => {
        const url = createUrlEditEntryGet(leadId);
        this.leadId = leadId;

        this.createDefault({
            url,
            params: createParamsForGet,
        });
    }
}