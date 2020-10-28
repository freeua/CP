import { ElementRef, Injectable } from '@angular/core';

declare let jQuery: any;
declare let swal: any;

@Injectable()
export class ClipBoardService {

  constructor (

  ) { }

  /**
   * Copy to ClipBoard
   */
  public copyClipBoard(text: string, removed: boolean, elem: ElementRef, select: boolean): void {

    let input = (<HTMLInputElement>document.getElementById('clip-data-move'));
    input.value = text;
    input.select();

    try {
      const test = document.execCommand('copy');

      input.value = '';
      input.blur();

      /** select text in field dbclick */
      if (select) {
        elem.nativeElement.focus();
        elem.nativeElement.value += ' ';
        elem.nativeElement.value = elem.nativeElement.value.slice(0, -1);

        /** Remove selected text */
        if (removed) {
          elem.nativeElement.blur();
        } else {
          elem.nativeElement.select();
        }

        elem.nativeElement.onblur = () => {
          elem.nativeElement.value += ' ';
          elem.nativeElement.value = elem.nativeElement.value.slice(0, -1);
        }
      }

      // this.toastr.success('Copy to ClipBoard!', 'Success!');
    } catch (err) {
      // this.toastr.error('Please press Ctrl/Cmd+C to copy!', 'Error copying to ClipBoard!');
    }
  }

}
