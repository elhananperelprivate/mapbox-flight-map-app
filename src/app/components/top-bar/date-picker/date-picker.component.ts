import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
})
export class DatePickerComponent {
  @Input() placeHolder: string = 'Select Dates';
  @Input() showRangePicker: boolean = true;

  @Output() dateRangeSelected: EventEmitter<
    | {
        startDate: Date;
        endDate: Date;
      }
    | { startDate: Date }
  > = new EventEmitter();

  get today(): Date {
    return new Date();
  }

  onDateRangeChange(
    dateRangeStart: HTMLInputElement,
    dateRangeEnd: HTMLInputElement
  ): void {
    console.log('Start Date:', dateRangeStart.value);
    console.log('End Date:', dateRangeEnd.value);
    this.dateRangeSelected.emit({
      startDate: new Date(dateRangeStart.value),
      endDate: new Date(dateRangeEnd.value),
    });
  }

  onDateChange(event: any): void {
    if (event.value) {
      const selectedDate = event.value;
      console.log('Selected Date:', selectedDate);
      this.dateRangeSelected.emit({ startDate: selectedDate });
    }
  }
}
