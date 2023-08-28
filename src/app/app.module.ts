import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FlightBookingComponent } from './components/flight/flight-booking/flight-booking.component';
import { FlightCardComponent } from './components/flight/flight-card/flight-card.component';
import { MapboxMapComponent } from './components/mapbox/mapbox-map/mapbox-map.component';
import { MapboxSearchComponent } from './components/mapbox/mapbox-search/mapbox-search.component';
import { FlightsService } from './services/flights.service';
import { MapboxService } from './services/mapbox.service';
import { UtilsService } from './services/utils.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopBarComponent } from './components/top-bar/top-bar/top-bar.component';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModule } from './modules/angular-mterial/angular-material.module';
import { ToastrModule } from 'ngx-toastr';
import { ResizableModule } from 'angular-resizable-element';
import { ProgressSpinnerComponent } from './components/top-bar/progress-spinner/progress-spinner.component';
import { DurationPipe } from './shared/pipes/duration.pipe';
import { DynamicDateInputDirective } from './shared/directives/dynamic-date-input.directive';
import { DatePickerComponent } from './components/top-bar/date-picker/date-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    FlightBookingComponent,
    FlightCardComponent,
    MapboxMapComponent,
    MapboxSearchComponent,
    TopBarComponent,
    ProgressSpinnerComponent,
    DurationPipe,
    DynamicDateInputDirective,
    DatePickerComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    ResizableModule,
  ],
  providers: [FlightsService, MapboxService, UtilsService],
  bootstrap: [AppComponent],
})
export class AppModule {}
