import * as mapboxgl from "mapbox-gl";

export interface PlacesResponse {
  results: {
    name: string;
  }[];
}

export interface DirectionsResponse {
  routes: any[];
}

export type FormOutputType = {
  origin: mapboxgl.LngLat;
  destination: mapboxgl.LngLat;
  isRoundTrip: boolean;
  departureDate: Date;
  returnDate?: Date;
  numOfPassengers: number;
};

export interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
    terminal: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal: string;
  };
  numberOfStops: number;
}

export class Route {
  constructor(
    public routeType: 'drive',
    public routeOrigin: mapboxgl.LngLat | string,
    public routDestination: mapboxgl.LngLat | string,
    public routeStartDate: Date | null,
    public routeEndDate: Date | null
  ) {}
}

export interface FlightType {
  price: {
    total: number;
    currency: string;
  };
  numberOfBookableSeats: number;
  lastTicketingDate: string;
  itineraries: [
    {
      duration: string;
      segments: FlightSegment[];
    }
  ];
}

export interface AirportsResponse {
  data: any[];
  meta: any;
}

export interface CustomMapMarker {
  markerLocation: mapboxgl.LngLat;
  markerOption: mapboxgl.LngLat;
}

export enum DateType {
  DEPARTURE_DATE,
  RETURN_DATE,
}

export type ChooseToType = 'destination' | 'origin';
