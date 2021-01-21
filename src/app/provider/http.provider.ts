import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

let users = JSON.parse(localStorage.getItem('users')) || [];

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute(): Observable<any> {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users/register') && method === 'POST':
          return register();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.match(/\/users\/\d+$/) && method === 'GET':
          return getUserById();
        case url.match(/\/users\/\d+$/) && method === 'PUT':
          return updateUser();
        case url.match(/\/users\/\d+$/) && method === 'DELETE':
          return deleteUser();
        default:
          return next.handle(request);
      }
    }

    function authenticate(): Observable<any> {
      const { username, password } = body;
      const user = users.find(x => x.username === username && x.password === password);

      if (!user) {
        return error('usuario ou senha incorreta');
      }

      return ok({id: user.id, username: user.username, token: 'test-provider-token'});
    }

    function register(): Observable<any> {
      const user = body;

      if (users.find(x => x.username === user.username)) {
        return error('usuario ja registrado');
      }

      user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));
      return ok();
    }

    function getUsers(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      return ok(users);
    }

    function getUserById(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }
      const user = users.find(x => x.id === idFromUrl());
      return ok(user);
    }

    function updateUser(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      const params = body;
      const user = users.find(x => x.id === idFromUrl());

      if (!params.password) {
        delete params.password;
      }

      Object.assign(user, params);
      localStorage.setItem('users', JSON.stringify(users));

      return ok();
    }

    function deleteUser(): Observable<any> {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      users = users.filter(x => x.id !== idFromUrl());
      localStorage.setItem('users', JSON.stringify(users));
      return ok();
    }

    // tslint:disable-next-line:no-shadowed-variable
    function ok(body?): Observable<any> {
      return of(new HttpResponse({ status: 200, body }));
    }

    function error(message): Observable<any> {
      return throwError({ error: { message } });
    }

    function unauthorized(): Observable<any> {
      return throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    function isLoggedIn(): boolean {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }

    function idFromUrl(): number {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1], 10);
    }
  }
}

export const httpProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: MyHttpInterceptor,
  multi: true
};
