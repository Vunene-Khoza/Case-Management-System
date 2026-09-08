import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  const originalRole = localStorage.getItem('original_role');
  const previewRole = localStorage.getItem('user_role');
  const previewEmail = localStorage.getItem('user_email');

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (originalRole && previewRole && previewEmail) {
    headers = headers.set('X-Preview-Role', previewRole).set('X-Preview-Email', previewEmail);
  }

  const cloned = req.clone({ headers });
  return next(cloned);
};
