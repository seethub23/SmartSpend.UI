import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  UserService,
  UserProfile
} from '../../core/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit {

  activeTab = signal<'profile' | 'password'>('profile');
  isLoading = signal(true);
  isSaving = signal(false);

  profileSuccess = signal('');
  profileError = signal('');
  passwordSuccess = signal('');
  passwordError = signal('');

  profile = signal<UserProfile | null>(null);

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileForm.patchValue({
          name: data.name,
          email: data.email
        });
        this.isLoading.set(false);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ?
      null : { passwordMismatch: true };
  }

  setTab(tab: 'profile' | 'password') {
    this.activeTab.set(tab);
    this.profileSuccess.set('');
    this.profileError.set('');
    this.passwordSuccess.set('');
    this.passwordError.set('');
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');

    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileSuccess.set('Profile updated successfully! ✅');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.profileError.set(
          err.error?.message || 'Failed to update profile!');
        this.isSaving.set(false);
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    this.isSaving.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword({
      currentPassword,
      newPassword
    }).subscribe({
      next: () => {
        this.passwordSuccess.set('Password changed successfully! ✅');
        this.passwordForm.reset();
        this.isSaving.set(false);
      },
      error: (err) => {
        this.passwordError.set(
          err.error?.message || 'Failed to change password!');
        this.isSaving.set(false);
      }
    });
  }

  get name() { return this.profileForm.get('name'); }
  get email() { return this.profileForm.get('email'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }
}