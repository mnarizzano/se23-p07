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
    authService.isAdmin.and.returnValue(of(isAdmin));
    fixture.detectChanges(); 
    expect(component.isAdmin).toBeTrue();
  });

  it('should set isAdmin to false when user is not an admin', () => {
    const isAdmin = false;
    authService.isAdmin.and.returnValue(of(isAdmin));
    fixture.detectChanges(); 
    expect(component.isAdmin).toBeFalse();
  });
});