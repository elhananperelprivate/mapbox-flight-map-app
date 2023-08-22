import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment.development';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

@Component({
  selector: 'app-mapbox-search',
  templateUrl: './mapbox-search.component.html',
  styleUrls: ['./mapbox-search.component.css'],
})
export class MapboxSearchComponent implements OnInit {
  results: any;
  geocoder!: MapboxGeocoder;

  @Input() geocoderName = 'geocoder';
  @Input() placeHolder!: string;

  @Output() result = new EventEmitter<MapboxGeocoder.Result>();
  @Output() clearSecondBox = new EventEmitter<boolean>();

  @ViewChild('geocoder') targetDiv!: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['placeHolder'] && changes['placeHolder'].currentValue != null) {
      if (this.geocoder) {
        this.geocoder.setPlaceholder(changes['placeHolder'].currentValue);
      }
    }
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.targetDiv.nativeElement.id = this.geocoderName;
    const geocoder = new MapboxGeocoder({
      accessToken: environment.mapbox.accessToken,
      types: 'country,region,place,postcode,locality,neighborhood',
      placeholder: this.placeHolder || 'Search..',
    });

    this.geocoder = geocoder;

    try {
      geocoder.addTo(`#${this.geocoderName}`);
    } catch (e) {
      console.log(e);
    }

    geocoder.on('results', (res) => {
      this.clearSecondBox.emit(false);
    });

    geocoder.on('result', (res) => {
      this.clearSecondBox.emit(true);
      this.result.emit(res?.result || { result: {} });
    });

    geocoder.on('clear', () => {
      this.clearSecondBox.emit(true);
    });
  }
}
