import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MapboxService {
  private readonly geocodingBaseUrl =
    'https://api.mapbox.com/geocoding/v5/mapbox.places/';
  private directionsBaseUrl =
    'https://api.mapbox.com/directions/v5/mapbox/driving';

  constructor(private http: HttpClient) {}

  getFullAddress(lngLat: mapboxgl.LngLat): Observable<any> {
    const url = `${this.geocodingBaseUrl}${lngLat.lng},${lngLat.lat}.json?types=address&access_token=${environment.mapbox.accessToken}`;
    return this.http.get(url);
  }

  getRoute(origin: string, destination: string): Observable<any> {
    const url = `${this.directionsBaseUrl}/${origin};${destination}?access_token=${environment.mapbox.accessToken}`;
    return this.http.get(url);
  }

  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance;
  }

  getCountryOfLngLat(lngLat: mapboxgl.LngLat): Observable<any> {
    const url = `${this.geocodingBaseUrl}${lngLat.lng},${lngLat.lat}.json?types=country&access_token=${environment.mapbox.accessToken}`;
    return this.http.get(url);
  }


  getAirportCoordinates(iataCode: string): Observable<any> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${iataCode}.json?types=poi&access_token=${environment.mapbox.accessToken}`;
    return this.http.get(url);
  }
}
