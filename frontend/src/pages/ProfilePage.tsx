import React, { useState } from 'react';
import { User as UserIcon, Mail, Calendar, Shield, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim()) {
      setError('Name and email cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({ name: name.trim(), email: email.trim() });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Header */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Farmer Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal credentials, contact email, and platform preferences.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info Card */}
        <Card className="text-center space-y-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center font-bold text-2xl shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <Badge variant="emerald" size="md">
            Verified Farmer Account
          </Badge>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Role: Farmer / Farm Manager</span>
            </div>
            {user?.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Member since: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="w-full pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-rose-600 hover:bg-rose-50 border-rose-200"
              onClick={logout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <div className="md:col-span-2">
          <Card title="Update Profile Details" icon={<UserIcon className="w-5 h-5" />}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon={<UserIcon className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="w-4 h-4" />}
                helperText="Used for system alerts and price target notifications"
              />

              <Button
                type="submit"
                size="md"
                className="mt-2"
                loading={loading}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
