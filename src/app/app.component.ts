import { Component } from '@angular/core';
import {Router} from '@angular/router';

import {JwtService} from './jwt.service';
import {User} from './util/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  currentUser: User;

  constructor(private router: Router, private jwtService: JwtService) {
    this.jwtService.currentUser.subscribe(x => this.currentUser = x);
  }

  logout(): void {
    this.jwtService.logout();
    this.router.navigate(['/login']);
  }
}
