import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

  // Manages the home page 
export class HomeComponent implements OnInit {
  isAdmin = false;
constructor(public authService: AuthService) {}
  ngOnInit(): void {
      this.authService.isAdmin().subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      });
  }
}
