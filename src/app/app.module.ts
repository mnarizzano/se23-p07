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
import { MapComponent } from './map/map.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home',
   children: [
	{ path: 'personalData', component: PersonalDataComponent},
	{path: 'saved-ps', component: 'SavedPSComponent},
	{path: 'Statistics', component: 'StatisticsComponent},
	{path: 'Map', component: 'MapComponent'}
                  ]
}
  // Aggiungi altre route per le tue pagine
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    PersonalDataComponent,
    SavedPSComponent,
    StatisticsComponent,
    MapComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
