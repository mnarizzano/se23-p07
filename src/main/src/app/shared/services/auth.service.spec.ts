/*
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AppModule } from '../../app.module';



describe('AuthService', () => {
  let authService: AuthService;
  let afAuth: jasmine.SpyObj<AngularFireAuth>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const afAuthSpy = jasmine.createSpyObj('AngularFireAuth', ['signInWithEmailAndPassword', 'authState']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: afAuthSpy },
        { provide: Router, useValue: routerSpy },
      ],
      imports: [AppModule]
    });

    authService = TestBed.inject(AuthService);
    afAuth = TestBed.inject(AngularFireAuth) as jasmine.SpyObj<AngularFireAuth>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  /*
  it('should sign in with email and password', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const user: UserCredential = {
        additionalUserInfo: null,
        credential: null,
        operationType: 'signIn',
        user: {
      uid: 'testUserId',
      email: email,}
    };

    // Simula il comportamento di signInWithEmailAndPassword restituendo una promessa risolta
    afAuth.signInWithEmailAndPassword.and.returnValue(Promise.resolve(user));

    await authService.SignIn(email, password);

    // Verifica che signInWithEmailAndPassword sia stato chiamato con email e password
    expect(afAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);

    // Verifica che il router.navigate sia stato chiamato con ['home']
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should handle sign-in error', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const errorMessage = 'Errore durante l\'accesso';

    // Simula il comportamento di signInWithEmailAndPassword restituendo una promessa respinta con un errore
    afAuth.signInWithEmailAndPassword.and.returnValue(Promise.reject(new Error(errorMessage)));

    // Spia la finestra di avviso
    spyOn(window, 'alert');

    await authService.SignIn(email, password);

    // Verifica che il metodo alert della finestra sia stato chiamato con il messaggio di errore
    expect(window.alert).toHaveBeenCalledWith(errorMessage);
  });
  
});
*/