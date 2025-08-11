import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { POLISH_CONTENT } from '@/utils/polish-content';
import { User, Mail, Lock, Settings, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

interface ProfileFormData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface UserPreferences {
  emailNotifications: boolean;
  lowCreditAlerts: boolean;
  purchaseConfirmations: boolean;
  systemUpdates: boolean;
}

export function AccountManagement() {
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    lowCreditAlerts: true,
    purchaseConfirmations: true,
    systemUpdates: false
  });
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    isValid: false
  });

  // Reset form states
  const resetStates = () => {
    setError('');
    setSuccess('');
    setIsLoading(false);
  };

  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Keep default preferences if loading fails
      }
    };

    loadPreferences();
  }, [session?.access_token]);

  // Update email in form when user changes
  useEffect(() => {
    if (user?.email) {
      setProfileForm(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user?.email]);

  // Password strength validation
  useEffect(() => {
    const password = profileForm.newPassword;
    const strength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValid: false
    };
    
    strength.isValid = strength.hasMinLength && strength.hasUpperCase && 
                     strength.hasLowerCase && strength.hasNumbers;
    
    setPasswordStrength(strength);
  }, [profileForm.newPassword]);

  // Handle profile email update
  const handleEmailUpdate = async () => {
    if (!profileForm.email || profileForm.email === user?.email) {
      setError(POLISH_CONTENT.errors.required);
      return;
    }

    if (!session?.access_token) {
      setError('Brak autoryzacji. Zaloguj się ponownie.');
      return;
    }

    setIsLoading(true);
    resetStates();

    try {
      const response = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: profileForm.email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update email');
      }

      const data = await response.json();
      if (data.requiresVerification) {
        setSuccess('Link weryfikacyjny został wysłany na nowy adres e-mail. Sprawdź swoją skrzynkę pocztową.');
      } else {
        setSuccess(POLISH_CONTENT.success.profileUpdated);
      }
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Email update error:', error);
      setError(error instanceof Error ? error.message : POLISH_CONTENT.errors.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmNewPassword) {
      setError(POLISH_CONTENT.errors.required);
      return;
    }

    if (profileForm.newPassword !== profileForm.confirmNewPassword) {
      setError(POLISH_CONTENT.errors.passwordMismatch);
      return;
    }

    if (profileForm.newPassword.length < 8) {
      setError(POLISH_CONTENT.errors.passwordTooShort);
      return;
    }

    if (!session?.access_token) {
      setError('Brak autoryzacji. Zaloguj się ponownie.');
      return;
    }

    setIsLoading(true);
    resetStates();

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(POLISH_CONTENT.success.passwordChanged);
      setIsEditingPassword(false);
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (error) {
      console.error('Password change error:', error);
      setError(error instanceof Error ? error.message : POLISH_CONTENT.errors.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preferences update
  const handlePreferencesUpdate = async () => {
    if (!session?.access_token) {
      setError('Brak autoryzacji. Zaloguj się ponownie.');
      return;
    }

    setIsLoading(true);
    resetStates();

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update preferences');
      }

      setSuccess(POLISH_CONTENT.success.settingsSaved);
      setIsEditingPreferences(false);
    } catch (error) {
      console.error('Preferences update error:', error);
      setError(error instanceof Error ? error.message : POLISH_CONTENT.errors.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'USUŃ') {
      setError(POLISH_CONTENT.profile.typeDeleteToConfirm);
      return;
    }

    if (!user?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/user/delete?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error instanceof Error ? error.message : POLISH_CONTENT.errors.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            {POLISH_CONTENT.profile.personalInfo}
          </h2>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              {POLISH_CONTENT.actions.edit}
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {POLISH_CONTENT.profile.email}
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder={POLISH_CONTENT.auth.email}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleEmailUpdate}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? POLISH_CONTENT.loading.saving : POLISH_CONTENT.actions.save}
              </button>
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileForm(prev => ({ ...prev, email: user?.email || '' }));
                  resetStates();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                {POLISH_CONTENT.actions.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">{POLISH_CONTENT.profile.email}:</span> {user?.email}</p>
            <p><span className="font-medium">Ostatnie logowanie:</span> {new Date(user?.last_sign_in_at || '').toLocaleString('pl-PL')}</p>
          </div>
        )}
      </div>

      {/* Password Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {POLISH_CONTENT.profile.changePassword}
          </h2>
          {!isEditingPassword && (
            <button
              onClick={() => setIsEditingPassword(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              {POLISH_CONTENT.actions.edit}
            </button>
          )}
        </div>

        {isEditingPassword ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {POLISH_CONTENT.profile.currentPassword}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder={POLISH_CONTENT.profile.currentPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {POLISH_CONTENT.profile.newPassword}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder={POLISH_CONTENT.profile.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {profileForm.newPassword && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium mb-2">Wymagania hasła:</p>
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                      <span>Co najmniej 8 znaków</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                      <span>Jedna wielka litera</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                      <span>Jedna mała litera</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordStrength.hasNumbers ? '✓' : '○'}</span>
                      <span>Jedna cyfra</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                      <span>Znak specjalny (opcjonalnie)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {POLISH_CONTENT.profile.confirmNewPassword}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={profileForm.confirmNewPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder={POLISH_CONTENT.profile.confirmNewPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? POLISH_CONTENT.loading.saving : POLISH_CONTENT.actions.save}
              </button>
              <button
                onClick={() => {
                  setIsEditingPassword(false);
                  setProfileForm(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                  }));
                  resetStates();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                {POLISH_CONTENT.actions.cancel}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            Kliknij &quot;Edytuj&quot;, aby zmienić hasło
          </p>
        )}
      </div>

      {/* User Preferences Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {POLISH_CONTENT.profile.preferences}
          </h2>
          {!isEditingPreferences && (
            <button
              onClick={() => setIsEditingPreferences(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              {POLISH_CONTENT.actions.edit}
            </button>
          )}
        </div>

        {isEditingPreferences ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>{POLISH_CONTENT.profile.emailNotifications}</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.lowCreditAlerts}
                  onChange={(e) => setPreferences(prev => ({ ...prev, lowCreditAlerts: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>{POLISH_CONTENT.profile.lowCreditAlerts}</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.purchaseConfirmations}
                  onChange={(e) => setPreferences(prev => ({ ...prev, purchaseConfirmations: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>{POLISH_CONTENT.profile.purchaseConfirmations}</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.systemUpdates}
                  onChange={(e) => setPreferences(prev => ({ ...prev, systemUpdates: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>{POLISH_CONTENT.profile.systemUpdates}</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handlePreferencesUpdate}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? POLISH_CONTENT.loading.saving : POLISH_CONTENT.actions.save}
              </button>
              <button
                onClick={() => {
                  setIsEditingPreferences(false);
                  resetStates();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                {POLISH_CONTENT.actions.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">{POLISH_CONTENT.profile.emailNotifications}:</span> {preferences.emailNotifications ? 'Włączone' : 'Wyłączone'}</p>
            <p><span className="font-medium">{POLISH_CONTENT.profile.lowCreditAlerts}:</span> {preferences.lowCreditAlerts ? 'Włączone' : 'Wyłączone'}</p>
            <p><span className="font-medium">{POLISH_CONTENT.profile.purchaseConfirmations}:</span> {preferences.purchaseConfirmations ? 'Włączone' : 'Wyłączone'}</p>
            <p><span className="font-medium">{POLISH_CONTENT.profile.systemUpdates}:</span> {preferences.systemUpdates ? 'Włączone' : 'Wyłączone'}</p>
          </div>
        )}
      </div>

      {/* Account Deletion Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          {POLISH_CONTENT.profile.accountManagement}
        </h2>
        
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            {POLISH_CONTENT.profile.deleteAccountWarning}
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm">
            {POLISH_CONTENT.profile.deleteAccountDescription}
          </p>
        </div>
        
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
        >
          <Trash2 className="w-4 h-4" />
          {POLISH_CONTENT.profile.deleteAccount}
        </button>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              {POLISH_CONTENT.profile.confirmDelete}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {POLISH_CONTENT.profile.deleteAccountDescription}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {POLISH_CONTENT.profile.typeDeleteToConfirm}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
                placeholder="USUŃ"
              />
            </div>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={isLoading}
              >
                {POLISH_CONTENT.actions.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading || deleteConfirmText !== 'USUŃ'}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isLoading ? POLISH_CONTENT.loading.processing : POLISH_CONTENT.actions.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 