import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-flight-booking',
  templateUrl: './flight-booking.component.html',
  styleUrls: ['./flight-booking.component.css']
})
export class FlightBookingComponent {
  @Input() flights: any[] = [];
  @Input() show: boolean = false;
  @Input() hidden: boolean = false;
  @Output() flightSelected = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @Output() hide = new EventEmitter<void>();
  hide_icon = 'arrow_right';

  onFlightSelected(flight: any) {
    this.flightSelected.emit(flight);
  }

  onClose() {
    this.close.emit();
  }

  onHide() {
    this.hide_icon = this.hidden ? 'arrow_right' : 'arrow_left';
    this.hidden = !this.hidden;
    this.hide.emit();
  }
}
