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
import { firebaseConfig } from '../environments/environment';
import { HomeComponent } from './home/home.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MapComponent } from './mappa/map.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import {AuthGuard} from './shared/guard/auth.guard';
import { MenuComponent } from './menu/menu.component';
import { SaveConfirmationComponent } from './save-confirmation/save-confirmation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddBoxConfirmationComponent } from './add-box-confirmation/add-box-confirmation.component';
import { DeleteAllConfirmationComponent } from './delete-all-confirmation/delete-all-confirmation.component';
import { MapUserComponent } from './map-user/map-user.component';
import { BookingComponent } from './booking/booking.component';
import { NgChartsModule} from 'ng2-charts';







const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { 
    path: 'home', component: HomeComponent, canActivate: [AuthGuard], 
    children: [
      { path: 'personalData', component: PersonalDataComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'map', component: MapComponent }
    ]
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
  { path: 'map', component: MapComponent },
  { path: 'personalData', component: PersonalDataComponent },
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
    StatisticsComponent,
    MapComponent,
    DeleteConfirmationComponent,
    MenuComponent,
    SaveConfirmationComponent,
    AddBoxConfirmationComponent,
    DeleteAllConfirmationComponent,
    MapUserComponent,
    BookingComponent
    ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig), 
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    FlexLayoutModule,
    MatButtonToggleModule,
    FormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatSlideToggleModule,
    NgChartsModule
  ],
 
  bootstrap: [AppComponent]
})
export class AppModule { }
