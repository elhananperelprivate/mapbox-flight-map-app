import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(value: string): string {
    const durationRegex = /PT(\d+)H(\d+)M/;
    const match = durationRegex.exec(value);
    if (!match) {
      return 'Invalid duration';
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return `${hours}h ${minutes}m`;
  }
}
