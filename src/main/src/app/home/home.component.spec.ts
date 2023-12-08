import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService } from '../shared/services/auth.service';
import { of } from 'rxjs';
import { AppModule } from '../app.module';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Crea un oggetto spy per il servizio AuthService
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
      imports: [AppModule],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set isAdmin to true when user is an admin', () => {
    const isAdmin = true;
    // Configura il servizio AuthService per restituire true quando `isAdmin` viene chiamato
    authService.isAdmin.and.returnValue(of(isAdmin));

    fixture.detectChanges(); // Avvia il ciclo di rilevamento dei cambiamenti

    // Verifica che isAdmin sia stato impostato su true dopo l'osservazione del servizio
    expect(component.isAdmin).toBeTrue();
  });

  it('should set isAdmin to false when user is not an admin', () => {
    const isAdmin = false;
    // Configura il servizio AuthService per restituire false quando `isAdmin` viene chiamato
    authService.isAdmin.and.returnValue(of(isAdmin));

    fixture.detectChanges(); // Avvia il ciclo di rilevamento dei cambiamenti

    // Verifica che isAdmin sia stato impostato su false dopo l'osservazione del servizio
    expect(component.isAdmin).toBeFalse();
  });
});




/* 
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService } from '../shared/services/auth.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: AuthService;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['someAuthServiceMethod']);

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject the AuthService', () => {
    expect(component.authService).toBe(authService);
  });

  it('should call ngOnInit without errors', () => {
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

});
*/
