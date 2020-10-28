import { Pipe, PipeTransform } from '@angular/core';
import { VaultPermissionDto } from '@copassword/copassword.clients.secretmanagement';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

@Pipe({
    name: 'existsUserPermission',
    pure: false
})

export class ExistsUserPermissionPipe implements PipeTransform {

    transform(users: UserDto[], permissions: VaultPermissionDto[]): any {

        let diff;

        console.log();

        if (users && permissions) {

            diff = users.map(user => {

                user['is_added'] = false;

                const find = permissions.find(permission => {
                    return user.id === permission.userId;
                });

                if (find) {
                    user['is_added'] = true;
                }

                return user;
            });

        }

        return diff;

    }

}