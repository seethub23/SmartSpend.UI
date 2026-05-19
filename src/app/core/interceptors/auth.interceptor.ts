import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({
    url: `${environment.apiUrl}/${req.url}`
  });

  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  if (token) {
    const authReq = apiReq.clone({
      headers: apiReq.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(authReq);
  }

  return next(apiReq);
};
