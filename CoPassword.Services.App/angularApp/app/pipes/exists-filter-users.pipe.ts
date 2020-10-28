import { Pipe, PipeTransform } from '@angular/core';
import { GroupDto } from '@copassword/copassword.clients.secretmanagement';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

@Pipe({
    name: 'existsFilterUsers',
    pure: true
})

export class ExistsFilterUsersPipe implements PipeTransform {

    transform(users: UserDto[], group: GroupDto): UserDto[] {

        let diff: UserDto[] = Array<UserDto>();

        if (users && group) {

            diff = users.map(user => {

                const find = group.members.find(member => member.userId === user.id);

                if (find) {
                    user['is_added'] = true;
                }

                return user;
            })
        }

        return diff;

    }

}