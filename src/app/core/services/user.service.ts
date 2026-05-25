import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  createdDate: Date;
}

export interface UpdateProfile {
  name: string;
  email: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  getProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('users/profile');
  }

  updateProfile(dto: UpdateProfile): Observable<UserProfile> {
    return this.apiService.put<UserProfile>('users/profile', dto);
  }

  changePassword(dto: ChangePassword): Observable<any> {
    return this.apiService.put<any>('users/change-password', dto);
  }
}