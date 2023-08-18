import { Component, Input } from '@angular/core';
import { FlightType } from 'src/app/shared/types/types';

@Component({
  selector: 'app-flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.css']
})
export class FlightCardComponent {

  @Input()
  flight!: FlightType;

  ngOnInit(): void {
    console.log('app-flight');
  }

}
