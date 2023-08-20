import { ChangeDetectorRef, Component } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import * as moment from 'moment';
import { ResizeEvent } from 'angular-resizable-element';
import * as mapboxgl from 'mapbox-gl';
import { FlightsService } from './services/flights.service';
import { ProgressSpinnerComponent } from './components/top-bar/progress-spinner/progress-spinner.component';
import { FlightType, FlightSegment } from './shared/types/mapbox.types';
import { FormOutputType, Route } from './shared/types/types';
import { airplaneSpinnerImages } from './shared/config/config';
import { forkJoin, from, of, switchMap } from 'rxjs';
import { destination } from '@turf/turf';
import { MapboxService } from './services/mapbox.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  flights: FlightType[] = [];
  showFlights = false;
  flightsHidden = false;

  isLoading = false;

  airportCodes = new Set<string>();
  origin!: mapboxgl.LngLat | null;
  destination!: mapboxgl.LngLat | null;
  routsToDraw!: Route[];

  fromCoordinatesSelected!: MapboxGeocoder.Result;
  destinationCoordinatesSelected!: MapboxGeocoder.Result;

  constructor(
    private flightService: FlightsService,
    private mapboxService: MapboxService,
    private overlay: Overlay,
    private cdRef: ChangeDetectorRef
  ) {}

  async searchRoute(searchForm: FormOutputType) {
    this.isLoading = true;
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const spinnerPortal = new ComponentPortal(ProgressSpinnerComponent);
    const spinnerRef = overlayRef.attach(spinnerPortal);
    spinnerRef.instance.images = airplaneSpinnerImages;
    spinnerRef.instance.text = 'Finding flights to yor destination...';

    this.origin = searchForm.origin;
    this.destination = searchForm.destination;
    const departureDate = new Date(searchForm.departureDate);
    const returnDate = searchForm?.returnDate
      ? new Date(searchForm.returnDate)
      : undefined;
    const passengers = searchForm.numOfPassengers;
    this.flightService
      .searchMapFlightPath(
        this.origin,
        this.destination,
        departureDate,
        passengers
      )
      .subscribe((flights: { data: FlightType[] }) => {
        this.flights = flights.data;
        this.isLoading = false;
        overlayRef.detach();
        this.showFlights = true;
        this.cdRef.detectChanges();
      });
  }

  chooseOriginByMap(event: MapboxGeocoder.Result) {
    this.fromCoordinatesSelected = event;
    console.log(JSON.stringify(event));
  }

  chooseDestinationByMap(event: MapboxGeocoder.Result) {
    this.destinationCoordinatesSelected = event;
    console.log(JSON.stringify(event));
  }

  closeFlights() {
    this.clearAllMapMarkers();
    this.showFlights = false;
  }

  hideFlights() {
    this.flightsHidden = !this.flightsHidden;
  }

  clearAllMapMarkers() {
    this.airportCodes = new Set<string>();
    this.origin = null;
    this.destination = null;
  }

  clearFlightMapMarkers() {
    this.airportCodes = new Set<string>();
  }

  drawFlightRoute(flight: FlightType) {
    this.clearFlightMapMarkers();
    const tempAirportCodesSet = new Set<string>();
    let firstSegment: FlightSegment | null = null;
    let lastSegment: FlightSegment | null = null;

    flight.itineraries.forEach((itinerary) => {
      itinerary.segments.forEach((segment: FlightSegment, index) => {
        tempAirportCodesSet.add(segment?.departure?.iataCode);
        tempAirportCodesSet.add(segment?.arrival?.iataCode);

        if (index === 0 && !firstSegment) {
          firstSegment = segment;
        }

        if (index === itinerary.segments.length - 1 && !lastSegment) {
          lastSegment = segment;
        }
      });
    });
    this.airportCodes = tempAirportCodesSet;
    this.flightsHidden = true;

    if (firstSegment && lastSegment && this.origin && this.destination) {
      try {
        // Find closest airports to origin and destination
        const originAirport$ = from(
          this.mapboxService.getAirportCoordinates(
            (firstSegment as FlightSegment).departure.iataCode
          )
        );
        const destinationAirport$ = from(
          this.mapboxService.getAirportCoordinates(
            (lastSegment as FlightSegment).arrival.iataCode
          )
        );

        return forkJoin([originAirport$, destinationAirport$]).pipe(
          switchMap(([originAirport, destinationAirport]) => {
            if (this.origin && this.destination) {
              const originToAirportRout = new Route(
                'drive',
                this.origin,
                originAirport,
                null,
                moment((firstSegment as FlightSegment)?.arrival?.at)
                  .subtract(3, 'hours')
                  .toDate()
              );

              const airportToDestinationtRout = new Route(
                'drive',
                destinationAirport,
                this.destination,
                moment((lastSegment as FlightSegment)?.departure?.at)
                  .add(1, 'hours')
                  .toDate(),
                null
              );
              const tempRouts = [
                originToAirportRout,
                airportToDestinationtRout,
              ];
              this.routsToDraw = tempRouts;
              return of([]);
            }else{
              return of([]);
            }

          })
        );
      } catch (e) {
        console.log(e);
        return of([]);
      }
    }
    return of([]);
  }
}
