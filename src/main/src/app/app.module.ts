import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { SavedPSComponent } from './saved-ps/saved-ps.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MapComponent } from './mappa/map.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { AppRoutingModule } from './app-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent,
   children: [
	{ path: 'personalData', component: PersonalDataComponent},
	{path: 'saved-ps', component: SavedPSComponent},
	{path: 'Statistics', component: StatisticsComponent},
	{path: 'Map', component: MapComponent}
                  ]
},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    FormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    PersonalDataComponent,
    SavedPSComponent,
    StatisticsComponent,
    MapComponent,
    DeleteConfirmationComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
