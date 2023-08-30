import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { DateType, MapBoxFeature } from 'src/app/shared/types/mapbox.types';
import { FormOutputType } from 'src/app/shared/types/types';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapboxSearchComponent } from '../../mapbox/mapbox-search/mapbox-search.component';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent {
  DateType = DateType;

  fromSearch = '';
  @Input() fromCoordinates!: MapboxGeocoder.Result | MapBoxFeature;
  destinationSearch = '';
  @Input() destinationCoordinates!: MapboxGeocoder.Result | MapBoxFeature;
  departureDate!: Date;
  returnDate!: Date;
  numOfPassengers = 1;
  isRoundTrip: boolean = false;

  disableSearch = true;

  @Output() routeRequested = new EventEmitter<FormOutputType>();

  hide_icon = 'keyboard_double_arrow_up';
  hidden: boolean = false;

  originGeocoder = 'originGeocoder';
  destinationGeocoder = 'destinationGeocoder';

  removeSecondSearchBox = false;

  constructor(private ngZone: NgZone, private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {}

  ngOnInit() {}

  clearAllAndReset() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['fromCoordinates'] &&
      changes['fromCoordinates'].currentValue != null
    ) {
      this.changeFormSearch(changes['fromCoordinates'].currentValue);
    }
    if (
      changes['destinationCoordinates'] &&
      changes['destinationCoordinates'].currentValue != null
    ) {
      this.changeDestinationSearch(
        changes['destinationCoordinates'].currentValue
      );
    }
  }

  route() {
    const isRoundTrip = this.isRoundTrip || false;
    this.routeRequested.emit({
      origin: new mapboxgl.LngLat(
        this.fromCoordinates?.center[0],
        this.fromCoordinates?.center[1]
      ),
      destination: new mapboxgl.LngLat(
        this.destinationCoordinates?.center[0],
        this.destinationCoordinates?.center[1]
      ),
      isRoundTrip,
      departureDate: this.departureDate,
      ...(this.returnDate && { returnDate: this.returnDate }),
      numOfPassengers: this.numOfPassengers,
    });
  }

  onHide() {
    this.hide_icon = this.hidden
      ? 'keyboard_double_arrow_up'
      : 'keyboard_double_arrow_down';
    this.hidden = !this.hidden;
  }

  getMinDate(dateType: DateType): string {
    if (dateType === DateType.DEPARTURE_DATE) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    } else {
      const departureDate = this.departureDate
        ? new Date(this.departureDate)
        : new Date();
      return departureDate.toISOString().split('T')[0];
    }
  }

  isPastDate(date: string): boolean {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate < today;
  }

  updateDisableSearch() {
    this.disableSearch = !(
      this.fromSearch &&
      this.fromSearch.length > 0 &&
      this.destinationSearch &&
      this.destinationSearch.length > 0 &&
      this.departureDate &&
      (!this.isRoundTrip ||
        (this.isRoundTrip && this.returnDate))
    );
  }

  changeFormSearch(result: MapboxGeocoder.Result | MapBoxFeature) {
    this.fromSearch = result.place_name;
    this.fromCoordinates = result;
    this.updateDisableSearch();
    this.cdRef.detectChanges();
  }

  changeDestinationSearch(result: MapboxGeocoder.Result | MapBoxFeature) {
    this.destinationSearch = result.place_name;
    this.destinationCoordinates = result;
    this.updateDisableSearch();
  }

  updateDate(
    newDate:
      | {
          startDate: Date;
          endDate: Date;
        }
       | { startDate: Date }
  ) {
    if ('endDate' in newDate) {
      this.departureDate = newDate.startDate;
      this.returnDate = newDate.endDate;
    } else {
      this.departureDate = newDate.startDate;
    }
    this.updateDisableSearch();
  }

  setSecondSearchBoxWhenItcolumn(set: boolean) {
    if (set) {
      // Show the second geocoder when needed
      this.removeSecondSearchBox = false;
    } else {
      // Hide the second geocoder when needed
      this.removeSecondSearchBox = true;
    }
  }
}
