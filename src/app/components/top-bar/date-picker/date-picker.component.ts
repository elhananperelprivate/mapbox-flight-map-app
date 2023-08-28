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
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent {
  @Input() placeHolder: string = 'Select Dates';
  @Input() showRangePicker: boolean = true;

  @Output() dateRangeSelected: EventEmitter<
    | {
        startDate: Date;
        endDate: Date;
      }
    | Date
  > = new EventEmitter();

  get today(): Date {
    return new Date();
  }

  onDateRangeChange(event: any): void {
    if (event.value) {
      const startDate = event.value.start;
      const endDate = event.value.end;
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
      this.dateRangeSelected.emit({ startDate, endDate });
    }
  }

  onDateChange(event: any): void {
    if (event.value) {
      const selectedDate = event.value;
      console.log('Selected Date:', selectedDate);
      this.dateRangeSelected.emit(selectedDate);
    }
  }
}
