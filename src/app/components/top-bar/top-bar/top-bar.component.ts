import {
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
import { DateType } from 'src/app/shared/types/mapbox.types';
import { FormOutputType } from 'src/app/shared/types/types';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapboxSearchComponent } from '../../mapbox/mapbox-search/mapbox-search.component';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent {
  @ViewChild('fromElement') public fromSearchElementRef!: ElementRef;
  @ViewChild('destinationElement')
  public destinationSearchElementRef!: ElementRef;

  DateType = DateType;

  fromSearch = '';
  @Input() fromCoordinates!: MapboxGeocoder.Result;
  destinationSearch = '';
  @Input() destinationCoordinates!: MapboxGeocoder.Result;
  departureDate: any;
  returnDate: any;
  numOfPassengers = 1;
  isRoundTrip: boolean = false;

  disableSearch = true;

  @Output() routeRequested = new EventEmitter<FormOutputType>();

  hide_icon = 'keyboard_double_arrow_up';
  hidden: boolean = false;

  originGeocoder = 'originGeocoder';
  destinationGeocoder = 'destinationGeocoder';

  removeSecondSearchBox = false;


  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // const autocompleteDestination = new google.maps.places.Autocomplete(
    //   this.destinationSearchElementRef.nativeElement
    // );
    // google.maps.event.addListener(
    //   autocompleteDestination,
    //   'place_changed',
    //   () => {
    //     this.destinationCoordinates = autocompleteDestination.getPlace();
    //     this.destinationSearch =
    //       this.destinationCoordinates?.formatted_address || '';
    //   }
    // );
    // const autocompleteFrom = new google.maps.places.Autocomplete(
    //   this.fromSearchElementRef.nativeElement
    // );
    // google.maps.event.addListener(autocompleteFrom, 'place_changed', () => {
    //   this.fromCoordinates = autocompleteFrom.getPlace();
    //   this.fromSearch = this.fromCoordinates?.formatted_address || '';
    // });
  }

  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // const geocoder = new google.maps.Geocoder();
      // geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      //   if (status === 'OK') {
      //     if (results && results[0]) {
      //       this.fromCoordinates = results[0];
      //       this.fromSearch = this.fromCoordinates?.formatted_address || '';
      //     } else {
      //       console.error('No results found');
      //     }
      //   } else {
      //     console.error('Geocoder failed due to: ' + status);
      //   }
      // });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['fromCoordinates'] &&
      changes['fromCoordinates'].currentValue != null
    ) {
      this.fromCoordinates = changes['fromCoordinates'].currentValue;
      this.fromSearch = this.fromCoordinates?.place_name || '';
    }
    if (
      changes['destinationCoordinates'] &&
      changes['destinationCoordinates'].currentValue != null
    ) {
      this.destinationCoordinates =
        changes['destinationCoordinates'].currentValue;
      this.destinationSearch = this.destinationCoordinates?.place_name || '';
    }
  }

  route() {
    const isRoundTrip = this.isRoundTrip || false;
    this.routeRequested.emit({
      origin: {
        lat: this.fromCoordinates?.center[1] || 0,
        lng: this.fromCoordinates?.center[0] || 0,
      },
      destination: {
        lat: this.destinationCoordinates?.center[1] || 0,
        lng: this.destinationCoordinates?.center[0] || 0,
      },
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
      this.departureDate.length > 0 &&
      (!this.isRoundTrip ||
        (this.isRoundTrip && this.returnDate && this.returnDate.length > 0))
    );
  }

  changeFormSearch(result: MapboxGeocoder.Result) {
    this.fromSearch = result.place_name;
  }

  changeDestinationSearch(result: MapboxGeocoder.Result) {
    this.destinationSearch = result.place_name;
  }

  setSecondSearchBoxWhenItcolumn(set: boolean) {
    console.log("set: ", set);

    if (set) {
      // Show the second geocoder when needed
      this.removeSecondSearchBox = false;
    } else {
      // Hide the second geocoder when needed
      this.removeSecondSearchBox = true;
    }
  }
}
