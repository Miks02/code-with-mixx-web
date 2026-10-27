import { Pipe, PipeTransform } from '@angular/core';
import { dateConverter, DateFormatOptions } from '../../core/utilities/date-helpers';

@Pipe({
  name: 'srDate',
})
export class SrDatePipe implements PipeTransform {
  transform(value: string | null | undefined, options?: DateFormatOptions): string {
    return value ? dateConverter(value, options) : '';
  }
}
