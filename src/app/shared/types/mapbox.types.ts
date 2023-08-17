export interface PlacesResponse {
  results: {
    name: string;
  }[];
}

export interface DirectionsResponse {
  routes: any[];
}

// export type FormOutputType = {
//   origin: google.maps.LatLngLiteral;
//   destination: google.maps.LatLngLiteral;
//   isRoundTrip: boolean;
//   departureDate: Date;
//   returnDate?: Date;
//   numOfPassengers: number;
// };

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

// export class Route {
//   constructor(
//     public routeType: google.maps.TravelMode,
//     public routeOrigin: google.maps.LatLngLiteral | string,
//     public routDestination: google.maps.LatLngLiteral | string,
//     public routeStartDate: Date | null,
//     public routeEndDate: Date | null
//   ) {}
// }

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

// export interface CustomMapMarker {
//   markerLocation: google.maps.LatLngLiteral | google.maps.LatLng;
//   markerOption: google.maps.MarkerOptions;
// }

export enum DateType {
  DEPARTURE_DATE,
  RETURN_DATE,
}

export type ChooseToType = 'destination' | 'origin';

export interface MapBoxAddress {
  type: string;
  query: [number, number];
  features: MapBoxFeature[];
  attribution: string;
}

export interface MapBoxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy: string;
  };
  text: string;
  place_name: string;
  center: [number, number];
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  context: MapBoxContext[];
}

export interface MapBoxContext {
  id: string;
  text: string;
  wikidata?: string;
  short_code?: string;
}

export type CustomMarkerOptions = {
  url: string;
  height: number;
  width: number;
};
