import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinList'
})
export class JoinListPipe implements PipeTransform {
  transform(value: string[] | null | undefined, separator = ', '): string {
    return value && value.length > 0 ? value.join(separator) : 'Not available';
  }
}
