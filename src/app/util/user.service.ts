import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {User} from './user';
import {Observable} from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) { }

  getAll(): Observable<object> {
    return this.http.get<User[]>(`/users`);
  }

  getById(id: number): Observable<object> {
    return this.http.get(`/users/` + id);
  }

  register(user: User): Observable<object> {
    return this.http.post(`/users/register`, user);
  }

  update(user: User): Observable<object> {
    return this.http.put(`/users/` + user.id, user);
  }

  delete(id: number): Observable<object> {
    return this.http.delete(`/users/` + id);
  }
}
