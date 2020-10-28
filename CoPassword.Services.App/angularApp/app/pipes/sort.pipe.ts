import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sort',
    pure: false
})

export class SortPipe implements PipeTransform {
    transform(arr: any[], field: string): any[] {

      arr.sort((a, b) => {
        if (a[field] < b[field] ) {
          return -1;
        }
        if (a[field] > b[field]) {
          return 1;
        }

        return 0;
      });

      return arr;
    }
}