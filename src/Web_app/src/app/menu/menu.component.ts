import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service'; 

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

  // Class that manages the menù of the web application
export class MenuComponent implements OnInit {
  isAdmin = false;
  constructor(private router: Router, private authService: AuthService) {}
ngOnInit(): void {
  this.authService.isAdmin().subscribe((isAdmin) => {
    this.isAdmin = isAdmin;
  });
}

  // redirects to the page on which the user has clicked
  redirectToPage(page: string) {
    if (page === 'sign-in') {
      this.authService.SignOut();
    } else {
      this.router.navigate(['/' + page]);
    }
  }
}
