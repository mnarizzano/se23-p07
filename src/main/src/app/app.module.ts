import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';
import { HomeComponent } from './home/home.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { SavedPSComponent } from './saved-ps/saved-ps.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MapComponent } from './mappa/map.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import {AuthGuard} from './shared/guard/auth.guard';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { 
    path: 'home', component: HomeComponent, canActivate: [AuthGuard], 
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
  declarations: [
    AppComponent,
    HomeComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    PersonalDataComponent,
    SavedPSComponent,
    StatisticsComponent,
    MapComponent,
    DeleteConfirmationComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    FlexLayoutModule,
    FormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
 
  bootstrap: [AppComponent]
})
export class AppModule { }
