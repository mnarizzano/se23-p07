import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service'; 

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  isAdmin = false;
  constructor(private router: Router, private authService: AuthService) {}
ngOnInit(): void {
  // Controlla che l'utente sia un amministratore
  this.authService.isAdmin().subscribe((isAdmin) => {
    this.isAdmin = isAdmin;
  });
  this.redirectToPage;
}

  redirectToPage(page: string) {
    if (page === 'sign-in') {
      // Esegue il logout dell'utente quando si fa clic su "Logout"
      this.authService.SignOut();
    } else {
      // Naviga verso la pagina desiderata
      this.router.navigate(['/' + page]);
    }
  }
}
