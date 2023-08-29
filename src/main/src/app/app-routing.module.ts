import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { SavedPSComponent } from './saved-ps/saved-ps.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MapComponent } from './mappa/map.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home', component: HomeComponent,
    children: [
      { path: 'personalData', component: PersonalDataComponent },
      { path: 'saved-ps', component: SavedPSComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'map', component: MapComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'map', component: MapComponent },
  { path: 'personalData', component: PersonalDataComponent },
  { path: 'saved-ps', component: SavedPSComponent },
  { path: 'statistics', component: StatisticsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }