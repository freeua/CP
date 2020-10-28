import { Pipe, PipeTransform } from '@angular/core';
import { UserDto } from '@copassword/copassword.clients.usermanagement';

@Pipe({
    name: 'filterUsers',
    pure: false
})

export class FilterUsersPipe implements PipeTransform {

    transform(users: UserDto[], queryString, type: string): any {

        let sortUsers = Array<UserDto>();

            /** If sting is empty return object without changes */
            if (queryString === '') {
                sortUsers = users;
            } else {
                users.map(group => {
                    /** Search by members object */
                    if (type === 'member') {
                        let getLastName = group['user']['lastName'].toLowerCase().indexOf(queryString.toLowerCase()) > -1;
                        let getFirstName = group['user']['firstName'].toLowerCase().indexOf(queryString.toLowerCase()) > -1;
                        if (getLastName || getFirstName) {
                            sortUsers.push(group);
                        }
                    }

                    /** Search by exists object */
                    if (type === 'exist') {
                        let getLastName = group['lastName'].toLowerCase().indexOf(queryString.toLowerCase()) > -1;
                        let getFirstName = group['firstName'].toLowerCase().indexOf(queryString.toLowerCase()) > -1;
                        if (getLastName || getFirstName) {
                            sortUsers.push(group);
                        }
                    }
                });
            }

        return sortUsers;
    }

}