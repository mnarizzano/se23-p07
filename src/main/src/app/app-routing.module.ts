import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { HomeComponent } from './home/home.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { SavedPSComponent } from './saved-ps/saved-ps.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MapComponent } from './mappa/map.component';
import { AuthGuard } from './shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { 
    path: 'home', component: HomeComponent, canActivate: [AuthGuard] ,
    children: [
      { path: 'personalData', component: PersonalDataComponent },
      { path: 'saved-ps', component: SavedPSComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'map', component: MapComponent }
    ]
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
  { path: 'map', component: MapComponent },
  { path: 'personalData', component: PersonalDataComponent },
  { path: 'saved-ps', component: SavedPSComponent },
  { path: 'statistics', component: StatisticsComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
