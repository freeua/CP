import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'find',
    pure: false
})

export class FindPipe implements PipeTransform {
    transform(arr: any[], string: string, field: string): any[] {
        const filteredArr = [];
        if (string !== '') {
          arr.forEach(item => {
            if (item[field].toLowerCase().indexOf(string.toLowerCase()) > -1) {
              filteredArr.push(item);
            }
          });
        } else {
          filteredArr.push(...arr);
        }
        return filteredArr;
    }
}