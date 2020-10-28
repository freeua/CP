import { Pipe, PipeTransform } from '@angular/core';
import { GroupDto } from '@copassword/copassword.clients.secretmanagement';

@Pipe({
    name: 'filterGroup',
    pure: false
})

export class FilterGroupPipe implements PipeTransform {

    transform(groups: GroupDto[], queryString, type: string): any {

        let sortGroups = Array<GroupDto>();

            /** If sting is empty return object without changes */
            if (queryString === '') {
                sortGroups = groups;
            } else {
                groups.map(group => {
                    /** Search by members object */
                    if (type === 'member') {
                        if (group['memberGroup']['name'].toLowerCase().indexOf(queryString.toLowerCase()) > -1) {
                            sortGroups.push(group);
                        }
                    }

                    /** Search by exists object */
                    if (type === 'exist') {
                        if (group['name'].toLowerCase().indexOf(queryString.toLowerCase()) > -1) {
                            sortGroups.push(group);
                        }
                    }
                });
            }

        return sortGroups;
    }

}