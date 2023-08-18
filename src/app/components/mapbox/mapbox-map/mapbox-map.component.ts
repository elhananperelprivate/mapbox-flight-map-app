import {
  Component,
  OnInit,
  NgZone,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment.development';
import * as mapboxglpolyline from '@mapbox/polyline';
import * as turf from '@turf/turf';
import {
  destinationMarkerConfig,
  originMarkerConfig,
} from 'src/app/shared/config/markers.config';
import {
  MapBoxAddress,
  ChooseToType,
  CustomMarkerOptions,
} from 'src/app/shared/types/mapbox.types';
import { MapboxService } from 'src/app/services/mapbox.service';
import { switchMap, of, catchError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

declare global {
  interface Window {
    angularComponentRef: { component: any; zone: any };
  }
}

@Component({
  selector: 'app-mapbox-map',
  templateUrl: './mapbox-map.component.html',
  styleUrls: ['./mapbox-map.component.css'],
})
export class MapboxMapComponent implements OnInit, OnChanges {
  map!: mapboxgl.Map;
  openInfoWindow!: mapboxgl.Popup;

  @Input() airportCodes = new Set<string>();

  @Input() originPoint!: mapboxgl.LngLat | null;
  @Input() destinationPoint!: mapboxgl.LngLat | null;

  @Output() originSelected = new EventEmitter<MapBoxAddress>();
  @Output() destinationSelected = new EventEmitter<MapBoxAddress>();

  constructor(
    public _ngZone: NgZone,
    private mapBoxService: MapboxService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    window['angularComponentRef'] = { component: this, zone: this._ngZone };
    const map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 1,
    });

    this.map = map;

    this.styleMap();

    this.handleClickEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(JSON.stringify(changes));

    if (changes['originPoint'] && changes['originPoint'].currentValue != null) {
      this.addMarkerTolatLng(
        changes['originPoint'].currentValue,
        originMarkerConfig
      );
    }
    if (
      changes['destinationPoint'] &&
      changes['destinationPoint'].currentValue != null
    ) {
      this.addMarkerTolatLng(
        changes['destinationPoint'].currentValue,
        destinationMarkerConfig
      );
    }
    if (
      changes['airportCodes'] &&
      changes['airportCodes'].currentValue?.size > 0
    ) {
      this.addAirportMarkers();
    }
    if (
      changes['routsToDraw'] &&
      changes['routsToDraw'].currentValue?.length > 0
    ) {
      //this.searchRoutes();
    }
  }

  styleMap() {
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          this.getCurrentPositionAndFocuse();
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            () => {
              this.getCurrentPositionAndFocuse();
            },
            () => {
              // Handle denied permission or error
            }
          );
        } else {
          // Handle other permission states
        }
      });
    } else {
      // Handle geolocation unavailable
    }

    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
  }

  getCurrentPositionAndFocuse(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.map.setCenter({
        lng: position.coords.longitude,
        lat: position.coords.latitude,
      });
      this.map.setZoom(12);
    });
  }

  handleClickEvent() {
    this.map.on('click', (e) => {
      const choosePlace = (chooseTo: ChooseToType) => {
        if (this.openInfoWindow.isOpen()) {
          this.openInfoWindow.remove();
        }
        this.mapBoxService
          .getFullAddress(e.lngLat)
          .pipe(
            switchMap((response: MapBoxAddress) => {
              if (response.features && response.features.length > 0) {
                console.log(response.features[0].place_name);
                this.addMarkerTolatLng(
                  e.lngLat,
                  chooseTo === 'destination'
                    ? destinationMarkerConfig
                    : originMarkerConfig
                );
                return of(response);
              } else {
                console.log('Address not found');
                return of(null);
              }
            }),
            catchError((error: any) => {
              console.error('Error fetching address:', error);
              console.log('Error fetching address');
              return of(null);
            })
          )
          .subscribe();

        console.log(chooseTo, e.lngLat);
      };
      const description = `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 8px;">
      <div>Choose this point as:</div>
      <div style="display: flex; margin-top: 5px; justify-content: space-between; align-items: center; width: 100%;">
        <button style="background-color: #6a1b9a; padding: 8px; border-radius: 4px; color: white; font-weight: bold;" onclick="window.angularComponentRef.zone.run(() =>{window.angularComponentRef.component.choosePlace('origin')})">Origin</button>
        <button style="background-color: #9c27b0; margin-inline-start: 6px; padding: 8px; border-radius: 4px; color: white; font-weight: bold;" onclick="window.angularComponentRef.zone.run(() =>{window.angularComponentRef.component.choosePlace('destination')})">Destination</button>
      </div>
    </div>
    `;

      const mm = new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description);

      this.openInfoWindow = mm;
      this.openInfoWindow.addTo(this.map);
      window.angularComponentRef.component.choosePlace = choosePlace;
    });
  }

  addMarkerTolatLng(latLng: mapboxgl.LngLat, options?: CustomMarkerOptions) {
    if (options) {
      const el = document.createElement('div');
      const width = options.width || 30;
      const height = options.height || 30;
      el.className = 'marker';
      el.style.backgroundImage = `url(${options?.url})`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.backgroundSize = '100%';
      console.log(el.style.backgroundImage.toString());
      const marker = new mapboxgl.Marker(el).setLngLat(latLng);
      marker.addTo(this.map);
    } else {
      const marker = new mapboxgl.Marker().setLngLat(latLng);
      marker.addTo(this.map);
    }
  }

  serachAndDrawRout() {
    const originAirport = new mapboxgl.LngLat(-73.7781, 40.6413);
    const destinationAirport = new mapboxgl.LngLat(-0.4543, 51.47);



    const origin = new mapboxgl.LngLat(-0.10980685159159975, 51.54960410570894);
    const destination = new mapboxgl.LngLat(-73.7781, 40.6413);

    this.map.on('load', () => {
      this.drawFlightLine(originAirport, destinationAirport);
      this.mapBoxService
        .getRoute(
          `${origin.lng},${origin.lat}`,
          `${destination.lng},${destination.lat}`
        )
        .subscribe({
          next: (response) => {
            console.log(response);

            if (response?.code !== 'NoRoute') {
              const encodedPolyline = response.routes[0].geometry; // Get the encoded polyline

              // Decode the encoded polyline to an array of coordinates
              const decodedCoordinates =
                mapboxglpolyline.decode(encodedPolyline);

              // Draw the route line on the map
              this.map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      // coordinates: decodedCoordinates
                      coordinates: decodedCoordinates.map(([num1, num2]) => [
                        num2,
                        num1,
                      ]),
                    },
                  },
                },
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': '#888',
                  'line-width': 2,
                },
              });
            }
          },
          error: (e) => console.error(e),
          complete: () => console.info('complete'),
        });
    });
  }

  drawFlightLine(
    originAirport: mapboxgl.LngLat,
    destinationAirport: mapboxgl.LngLat
  ) {
    const flightRoute = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              originAirport.toArray(),
              destinationAirport.toArray(),
            ],
          },
        },
      ],
    };

    // Calculate the distance in kilometers between route start/end point.
    const lineDistance = turf.length(flightRoute.features[0] as any);

    const arc = [];

    // Number of steps to use in the arc and animation, more steps means
    // a smoother arc and animation, but too many steps will result in a
    // low frame rate
    const steps = 500;

    // Draw an arc between the `origin` & `destination` of the two points
    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      const segment = turf.along(flightRoute.features[0] as any, i);
      arc.push(segment.geometry.coordinates);
    }

    // Update the route with calculated arc coordinates
    flightRoute.features[0].geometry.coordinates = arc;
    this.map.addSource('flightRoute', {
      type: 'geojson',
      data: flightRoute as any,
    });

    this.map.addLayer({
      id: 'flightRoute',
      source: 'flightRoute',
      type: 'line',
      paint: {
        'line-width': 2,
        'line-color': '#007cbf',
      },
    });
  }

  async addAirportMarkers() {
    // Get the coordinates for all the airports in the order specified in airportCodes
    for (const code of this.airportCodes) {
      try {
        this.mapBoxService.getAirportCoordinates(code).subscribe({
          next: (response) => {
            console.log(response);
            // Add the marker positions for each airport
            response.map((airportCoordinate: any) => {
              this.addMarkerTolatLng(airportCoordinate, originMarkerConfig);
            });
          },
          error: (e) => console.error('addAirportMarkers error - ', e),
          complete: () => console.info('complete'),
        });
      } catch (error) {
        console.error(`Error adding coordinates for airport ${code}: ${error}`);
        this.toastr.error(
          `Error finding coordinates for airport ${code}`,
          'Error'
        );
        return;
      }
    }
  }
}
