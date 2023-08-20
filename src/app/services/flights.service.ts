import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, from, forkJoin, switchMap, of, map } from 'rxjs';
import { AirportsResponse } from '../shared/types/mapbox.types';
import { MapboxService } from './mapbox.service';
import * as mapboxgl from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class FlightsService {

  private readonly BASE_URL = 'http://localhost:3000';

  constructor(private http: HttpClient, private mapboxService: MapboxService) {}

  searchMapFlightPath(
    origin: any,
    destination: any,
    departureDate: Date,
    passengers: number
  ): Observable<any> {
    try {
      // Find closest airports to origin and destination
      const originAirport$ = from(
        this.findClosestAirport(origin, false)
      );
      const destinationAirport$ = from(
        this.findClosestAirport(destination, true)
      );

      return forkJoin([originAirport$, destinationAirport$]).pipe(
        switchMap(([originAirport, destinationAirport]) => {
          // Find flights between origin and destination airports
          return this.findFlights(
            originAirport.iataCode,
            destinationAirport.iataCode,
            departureDate,
            passengers
          );
        })
      );
    } catch (e) {
      console.log(e);
      return of([]);
    }
  }

  findClosestAirport(lngLat: mapboxgl.LngLat, des = true) {
    return this.mapboxService.getCountryOfLngLat(lngLat).pipe(
      switchMap((country) => {
        console.log(JSON.stringify(country));
        // const countryShortName = this.extractCountry(
        //   country.features[0].address_components,
        // );
        const countryShortName = country.features[0].place_name;
        const countriesWithOnlyOneMainAirport = [
          {
            countryName: 'Israel',
            countryCode: 'IL',
            airportName: 'Ben Gurion Airport',
            airportIataCode: 'TLV',
          },
          {
            countryName: 'Jordan',
            countryCode: 'JO',
            airportName: 'Queen Alia International Airport',
            airportIataCode: 'AMM',
          },
          {
            countryName: 'Malta',
            countryCode: 'MT',
            airportName: 'Malta International Airport',
            airportIataCode: 'MLA',
          },
          // Add more countries and their airports as needed
        ];
        const airport = countriesWithOnlyOneMainAirport.find(
          (c) => c.countryName === countryShortName || c.countryCode === countryShortName
        );
        if (airport) {
          return of({
            iataCode: airport.airportIataCode,
            name: airport.airportName,
          });
        } else {
          const url = `${this.BASE_URL}/amadeus-api/airports?lat=${lngLat.lat}&lng=${lngLat.lng}`;
          return this.http.get<AirportsResponse>(url).pipe(
            map((airportsData) => {
              const airports = airportsData.data.filter(
                (airport: any) => airport.type === 'location'
              );

              const closestAirport = airports[0];
              return {
                iataCode: closestAirport.iataCode,
                name: closestAirport.name,
              };
            })
          );
        }
      })
    );
  }

  findFlights(
    originAirportCode: string,
    destinationAirportCode: string,
    departureDate: Date,
    passengers: number
  ) {
    const url = `${
      this.BASE_URL
    }/amadeus-api/flights?originCode=${originAirportCode}&destinationCode=${destinationAirportCode}&dateOfDeparture=${moment(
      departureDate
    ).format('YYYY-MM-DD')}`;
    return this.http.get(url);
  }
}
