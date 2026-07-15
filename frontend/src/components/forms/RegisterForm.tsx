'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert } from '@/components/ui';
import useAuth from '@/hooks/useAuth';
import { RegisterFormData } from '@/types';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error, setError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'Nama depan wajib diisi';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Nama belakang wajib diisi';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'Password harus mengandung huruf kecil';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password harus mengandung huruf besar';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password harus mengandung angka';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      errors.password = 'Password harus mengandung karakter khusus (@$!%*?&)';
    }

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Konfirmasi password tidak cocok';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Register with admin role by default
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      // Redirect to dashboard on successful registration
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Registration error:', err);
    }
  };

  const passwordStrength = formData.password ? (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i < Math.min(Math.ceil((formData.password.length / 8) * 4), 4)
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-1">
        Kekuatan password:{' '}
        {formData.password.length < 8 ? 'Lemah' : formData.password.length < 12 ? 'Cukup' : 'Kuat'}
      </p>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Admin</h1>
        <p className="text-gray-600">Buat akun admin baru untuk SISTEM QC BERKAS</p>
      </div>

      {error && (
        <Alert
          type="error"
          title="Pendaftaran Gagal"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nama Depan"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Budi"
            error={fieldErrors.firstName}
            disabled={isLoading}
          />
          <Input
            label="Nama Belakang"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Santoso"
            error={fieldErrors.lastName}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Alamat Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="admin@example.com"
          error={fieldErrors.email}
          disabled={isLoading}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={fieldErrors.password}
            disabled={isLoading}
            helperText="Min 8 karakter, huruf besar, kecil, angka, karakter khusus"
          />
          {passwordStrength}
        </div>

        <Input
          label="Konfirmasi Password"
          type={showPassword ? 'text' : 'password'}
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          placeholder="••••••••"
          error={fieldErrors.passwordConfirm}
          disabled={isLoading}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="showPassword" className="ml-2 text-sm text-gray-700">
            Tampilkan password
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Buat Akun
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
