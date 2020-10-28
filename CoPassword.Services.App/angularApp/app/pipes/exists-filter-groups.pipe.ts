import { Pipe, PipeTransform } from '@angular/core';
import { GroupDto } from '@copassword/copassword.clients.secretmanagement';

@Pipe({
    name: 'existsFilterGroups',
    pure: true
})

export class ExistsFilterGroupsPipe implements PipeTransform {

    transform(groups: GroupDto[], group: GroupDto): any {

        let diff: GroupDto[] = Array<GroupDto>();

        if (groups && group) {

            diff = groups.filter((eachGroup, index) => {

                const find = group.memberGroups.find(memberGroup => eachGroup.id === memberGroup.memberGroupId);

                if (find) {
                    eachGroup['is_added'] = true;
                }

                if (group.id === eachGroup.id) {
                    return false;
                }

                return true;

            });
        }

        return diff;

    }

}