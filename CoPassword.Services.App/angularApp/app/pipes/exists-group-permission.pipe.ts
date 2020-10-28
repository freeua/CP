import { Pipe, PipeTransform } from '@angular/core';
import { GroupDto, VaultPermissionDto } from '@copassword/copassword.clients.secretmanagement';

@Pipe({
    name: 'existsGroupPermission',
    pure: false
})

export class ExistsGroupPermissionPipe implements PipeTransform {

    transform(groups: GroupDto[], permissions: VaultPermissionDto[]): any {

        let diff;

        if (groups && permissions) {
            diff = groups.map(group => {

                group['is_added'] = false;

                const find = permissions.find(permission => {
                    return group.id === permission.groupId;
                });

                if (find) {
                    group['is_added'] = true;
                }

                return group;
            });
        }

        // console.log(diff);

        return diff;

    }

}