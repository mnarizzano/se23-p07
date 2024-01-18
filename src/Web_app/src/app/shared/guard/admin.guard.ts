

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})

  // Manages the roles depending on the type of user
export class AdminGuard {
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | UrlTree | boolean {
    return this.authService.isAdmin().pipe(
      map((isAdmin) => {
        if (isAdmin) {
          return true; // The admin can access to all the pages
        } else {
          if (next.url[0].path === 'statistics') {
            // The normal user cannot access to the page "statistics"
            this.router.navigate(['home']);
            console.log('redirect to Home because it is not an administrator');
            return false;
          } else {
            return true;
          }
        }
      })
    );
  }
}
