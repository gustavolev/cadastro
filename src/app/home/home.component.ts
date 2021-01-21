import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../util/user';
import {Subscription} from 'rxjs';
import {JwtService} from '../jwt.service';
import {UserService} from '../util/user.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;
  users: object | User = [];

  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) {
    this.currentUserSubscription = this.jwtService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  deleteUser(id: number): void {
    this.userService.delete(id).pipe(first()).subscribe(() => {
      this.loadAllUsers();
    });
  }

  private loadAllUsers(): void {
    this.userService.getAll().pipe(first()).subscribe(users => {
      this.users = users;
    });
  }
}
