import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, from, forkJoin, switchMap, of, map } from 'rxjs';
import { AirportsResponse } from '../shared/types/mapbox.types';
import { MapboxService } from './mapbox.service';

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
        this.findClosestAirport(origin.lat, origin.lng, false)
      );
      const destinationAirport$ = from(
        this.findClosestAirport(destination.lat, destination.lng)
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

  findClosestAirport(lat: number, lng: number, des = true) {
    const fullAddress$ = from(this.mapboxService.findCountryOfLngLat(lat, lng));

    return fullAddress$.pipe(
      switchMap((fullAddress) => {
        console.log(JSON.stringify(fullAddress));
        const country = this.extractCountry(
          // TODO fullAddress?.results[0].address_components
          'Israel'
        );
        const arrayWithOnlyOneAirport = [
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
        const airport = arrayWithOnlyOneAirport.find(
          (c) => c.countryName === country || c.countryCode === country
        );
        if (airport) {
          return of({
            iataCode: airport.airportIataCode,
            name: airport.airportName,
          });
        } else {
          const url = `${this.BASE_URL}/amadeus-api/airports?lat=${lat}&lng=${lng}`;
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

  // extract country short name (e.g. GB for Great Britain) from google geocode API result
  extractCountry(addrComponents: any) {
    for (let i = 0; i < addrComponents.length; i++) {
      if (addrComponents[i].types[0] == 'country') {
        return addrComponents[i].short_name;
      }
      if (addrComponents[i].types.length == 2) {
        if (addrComponents[i].types[0] == 'political') {
          return addrComponents[i].short_name;
        }
      }
    }
    return false;
  }
}
