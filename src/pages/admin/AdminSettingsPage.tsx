import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, Image, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { AdminBadge, AdminButton, AdminCard, AdminPageHeading, AdminTextArea, AdminTextInput, AdminSelect } from '../../components/admin/AdminUi';
import { cn } from '../../lib/cn';
import { getAccessToken } from '../../lib/api';

const tabs = [
  { label: 'General Settings', to: '/admin/settings/general', key: 'general' },
  { label: 'Email Settings', to: '/admin/settings/email', key: 'email' },
  { label: 'Wallet Settings', to: '/admin/settings/wallets', key: 'wallets' },
] as const;

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? (['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://127.0.0.1:4000' : '')).replace(/\/$/, '');

export const AdminSettingsPage = () => {
  const location = useLocation();
  const { adminSettings, saveAdminSettings, adminEmailTemplates, adminWalletRails } = useAuth();
  const { refreshBranding } = useBranding();
  const [message, setMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const hasSavedMailPassword = Boolean(adminSettings?.email?.mailPasswordMasked);

  const [generalForm, setGeneralForm] = useState({
    siteName: '',
    siteUrl: '',
    logoUrl: '',
    faviconUrl: '',
    publicTopbarLabel: '',
    publicTopbarText: '',
    publicHeroTitle: '',
    publicHeroDescription: '',
    footerSummary: '',
    authHeadline: '',
    authDescription: '',
    referralBonusAmount: '',
    bonusDistribution: '',
  });

  const [emailForm, setEmailForm] = useState({
    fromName: '',
    fromAddress: '',
    mailDriver: '',
    mailHost: '',
    mailPort: '',
    mailUsername: '',
    mailPassword: '',
    mailEncryption: '',
    notifyOnUserRegistration: true,
    notifyOnKycSubmission: true,
    notifyOnKycApproval: true,
  });

  const [railForm, setRailForm] = useState({
    symbol: '',
    name: '',
    network: '',
    address: '',
    payId: '',
    status: 'Healthy' as const,
    minDeposit: '',
    minWithdrawal: '',
    fee: '',
    confirmations: '',
  });
  const [editingRailId, setEditingRailId] = useState<string | null>(null);

  useEffect(() => {
    if (adminSettings?.general) {
      setGeneralForm({
        siteName: String(adminSettings.general.siteName ?? ''),
        siteUrl: String(adminSettings.general.siteUrl ?? ''),
        logoUrl: String(adminSettings.general.logoUrl ?? ''),
        faviconUrl: String(adminSettings.general.faviconUrl ?? ''),
        publicTopbarLabel: String(adminSettings.general.publicTopbarLabel ?? ''),
        publicTopbarText: String(adminSettings.general.publicTopbarText ?? ''),
        publicHeroTitle: String(adminSettings.general.publicHeroTitle ?? ''),
        publicHeroDescription: String(adminSettings.general.publicHeroDescription ?? ''),
        footerSummary: String(adminSettings.general.footerSummary ?? ''),
        authHeadline: String(adminSettings.general.authHeadline ?? ''),
        authDescription: String(adminSettings.general.authDescription ?? ''),
        referralBonusAmount: String(adminSettings.general.referralBonusAmount ?? ''),
        bonusDistribution: String(adminSettings.general.bonusDistribution ?? ''),
      });
    }

    if (adminSettings?.email) {
      setEmailForm({
        fromName: String(adminSettings.email.fromName ?? ''),
        fromAddress: String(adminSettings.email.fromAddress ?? ''),
        mailDriver: String(adminSettings.email.mailDriver ?? ''),
        mailHost: String(adminSettings.email.mailHost ?? ''),
        mailPort: String(adminSettings.email.mailPort ?? ''),
        mailUsername: String(adminSettings.email.mailUsername ?? ''),
        mailPassword: '',
        mailEncryption: String(adminSettings.email.mailEncryption ?? ''),
        notifyOnUserRegistration: Boolean(adminSettings.email.notifyOnUserRegistration ?? true),
        notifyOnKycSubmission: Boolean(adminSettings.email.notifyOnKycSubmission ?? true),
        notifyOnKycApproval: Boolean(adminSettings.email.notifyOnKycApproval ?? true),
      });
    }
  }, [adminSettings]);

  const currentTab = location.pathname.includes('/email')
    ? 'email'
    : location.pathname.includes('/wallets')
      ? 'wallets'
      : 'general';

  const saveGeneral = async () => {
    await saveAdminSettings('general', {
      ...adminSettings?.general,
      ...generalForm,
      referralEnabled: true,
    });
    await refreshBranding();
    setMessage('General settings saved.');
  };

  const saveEmail = async () => {
    await saveAdminSettings('email', {
      fromName: emailForm.fromName,
      fromAddress: emailForm.fromAddress,
      mailDriver: emailForm.mailDriver,
      mailHost: emailForm.mailHost,
      mailPort: emailForm.mailPort,
      mailUsername: emailForm.mailUsername,
      mailPassword: emailForm.mailPassword,
      mailEncryption: emailForm.mailEncryption,
      templates: adminEmailTemplates,
      notifyOnUserRegistration: emailForm.notifyOnUserRegistration,
      notifyOnKycSubmission: emailForm.notifyOnKycSubmission,
      notifyOnKycApproval: emailForm.notifyOnKycApproval,
    });
    setEmailForm((current) => ({ ...current, mailPassword: '' }));
    setMessage('Email settings saved.');
  };

  const saveWalletRail = async () => {
    if (!railForm.symbol || !railForm.name || !railForm.network) {
      setMessage('Symbol, Name, and Network are required.');
      return;
    }

    const currentRails = [...adminWalletRails];
    const newRail = {
      id: editingRailId || `rail-${Date.now()}`,
      ...railForm,
    };

    if (editingRailId) {
      const idx = currentRails.findIndex((r) => r.id === editingRailId);
      if (idx !== -1) currentRails[idx] = newRail;
    } else {
      currentRails.push(newRail);
    }

    await saveAdminSettings('wallets', { ...adminSettings?.wallets, rails: currentRails });
    setMessage(editingRailId ? 'Wallet rail updated.' : 'Wallet rail added.');
    setEditingRailId(null);
    setRailForm({ symbol: '', name: '', network: '', address: '', payId: '', status: 'Healthy', minDeposit: '', minWithdrawal: '', fee: '', confirmations: '' });
  };

  const editWalletRail = (rail: any) => {
    setEditingRailId(rail.id);
    setRailForm({
      symbol: rail.symbol || '',
      name: rail.name || '',
      network: rail.network || '',
      address: rail.address || '',
      payId: rail.payId || '',
      status: rail.status || 'Healthy',
      minDeposit: rail.minDeposit || '',
      minWithdrawal: rail.minWithdrawal || '',
      fee: rail.fee || '',
      confirmations: rail.confirmations || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteWalletRail = async (id: string) => {
    if (!window.confirm('Delete this wallet rail?')) return;
    const currentRails = adminWalletRails.filter((r) => r.id !== id);
    await saveAdminSettings('wallets', { ...adminSettings?.wallets, rails: currentRails });
    setMessage('Wallet rail deleted.');
  };

  const handleFileUpload = async (type: 'logo' | 'favicon', file: File) => {
    const isLogo = type === 'logo';
    const setUploading = isLogo ? setUploadingLogo : setUploadingFavicon;
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append(type, file);

      const token = getAccessToken();
      const response = await fetch(`${API_BASE}/api/admin/upload/${type}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || 'Upload failed.');
        return;
      }

      // Update the local form state with the new URL
      setGeneralForm((current) => ({
        ...current,
        [isLogo ? 'logoUrl' : 'faviconUrl']: result.url,
      }));

      // Refresh branding so the logo updates everywhere
      await refreshBranding();
      setMessage(`${isLogo ? 'Logo' : 'Favicon'} uploaded successfully.`);
    } catch {
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Settings"
        description="General, email, and wallet settings now persist through the MySQL-backed API."
      />

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              currentTab === tab.key ? 'bg-violet-600 text-white' : 'border border-slate-300 bg-white text-slate-700',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {message && (
        <AdminCard className="border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {message}
        </AdminCard>
      )}

      {currentTab === 'general' && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Brand Identity — with logo preview and upload */}
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Brand Identity</h3>
            <div className="mt-5 grid gap-4">
              <AdminTextInput label="Site Name (public-facing name)" value={generalForm.siteName} onChange={(event) => setGeneralForm((current) => ({ ...current, siteName: event.target.value }))} placeholder="Your Site Name" />
              <AdminTextInput label="Site URL" value={generalForm.siteUrl} onChange={(event) => setGeneralForm((current) => ({ ...current, siteUrl: event.target.value }))} placeholder="https://yourdomain.com" />

              {/* Logo section */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Image className="h-4 w-4 text-violet-500" />
                  Logo
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white p-1">
                    {generalForm.logoUrl ? (
                      <img
                        src={generalForm.logoUrl}
                        alt="Current logo"
                        className="h-full w-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <BrandLogo size="lg" variant="icon" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <AdminTextInput
                      label="Logo URL"
                      value={generalForm.logoUrl}
                      onChange={(event) => setGeneralForm((current) => ({ ...current, logoUrl: event.target.value }))}
                      placeholder="/uploads/logo.png or https://..."
                    />
                    <div className="flex items-center gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload('logo', file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Recommended: <strong>200 × 60 px</strong>, PNG/SVG, max 2 MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon section */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Image className="h-4 w-4 text-violet-500" />
                  Favicon (browser tab icon)
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white p-1">
                    {generalForm.faviconUrl ? (
                      <img
                        src={generalForm.faviconUrl}
                        alt="Current favicon"
                        className="h-full w-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <BrandLogo size="sm" variant="icon" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <AdminTextInput
                      label="Favicon URL"
                      value={generalForm.faviconUrl}
                      onChange={(event) => setGeneralForm((current) => ({ ...current, faviconUrl: event.target.value }))}
                      placeholder="/uploads/favicon.png or https://..."
                    />
                    <div className="flex items-center gap-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/png,image/x-icon,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload('favicon', file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingFavicon}
                        onClick={() => faviconInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Recommended: <strong>32 × 32 px</strong> or <strong>64 × 64 px</strong>, PNG/ICO, max 512 KB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Public Messaging</h3>
            <div className="mt-5 grid gap-4">
              <AdminTextInput label="Top Bar Label" value={generalForm.publicTopbarLabel} onChange={(event) => setGeneralForm((current) => ({ ...current, publicTopbarLabel: event.target.value }))} />
              <AdminTextArea label="Top Bar Message" rows={3} value={generalForm.publicTopbarText} onChange={(event) => setGeneralForm((current) => ({ ...current, publicTopbarText: event.target.value }))} />
              <AdminTextArea label="Home Hero Title" rows={3} value={generalForm.publicHeroTitle} onChange={(event) => setGeneralForm((current) => ({ ...current, publicHeroTitle: event.target.value }))} />
              <AdminTextArea label="Home Hero Description" rows={4} value={generalForm.publicHeroDescription} onChange={(event) => setGeneralForm((current) => ({ ...current, publicHeroDescription: event.target.value }))} />
              <AdminTextArea label="Footer Summary" rows={4} value={generalForm.footerSummary} onChange={(event) => setGeneralForm((current) => ({ ...current, footerSummary: event.target.value }))} />
              <AdminTextArea label="Login Headline" rows={2} value={generalForm.authHeadline} onChange={(event) => setGeneralForm((current) => ({ ...current, authHeadline: event.target.value }))} />
              <AdminTextArea label="Login Description" rows={3} value={generalForm.authDescription} onChange={(event) => setGeneralForm((current) => ({ ...current, authDescription: event.target.value }))} />
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Referral Settings</h3>
            <div className="mt-5 space-y-4">
              <AdminTextInput label="Referral Bonus Amount (USD)" value={generalForm.referralBonusAmount} onChange={(event) => setGeneralForm((current) => ({ ...current, referralBonusAmount: event.target.value }))} />
              <AdminTextInput label="Bonus Distribution" value={generalForm.bonusDistribution} onChange={(event) => setGeneralForm((current) => ({ ...current, bonusDistribution: event.target.value }))} />
              <AdminButton onClick={saveGeneral}>Save General Settings</AdminButton>
            </div>
          </AdminCard>
        </div>
      )}

      {currentTab === 'email' && (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Email Templates</h3>
            <div className="mt-5 space-y-3">
              {adminEmailTemplates.map((template) => (
                <div key={template.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{template.subject}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AdminBadge value={template.status} />
                    <span className="text-sm text-slate-500">{template.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Deliverability</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AdminTextInput label="Mail Driver" value={emailForm.mailDriver} onChange={(event) => setEmailForm((current) => ({ ...current, mailDriver: event.target.value }))} />
              <AdminTextInput label="Mail Host" value={emailForm.mailHost} onChange={(event) => setEmailForm((current) => ({ ...current, mailHost: event.target.value }))} />
              <AdminTextInput label="Mail Port" value={emailForm.mailPort} onChange={(event) => setEmailForm((current) => ({ ...current, mailPort: event.target.value }))} />
              <AdminTextInput label="Mail Username" value={emailForm.mailUsername} onChange={(event) => setEmailForm((current) => ({ ...current, mailUsername: event.target.value }))} />
              <div>
                <AdminTextInput
                  label="Mail Password"
                  type="password"
                  value={emailForm.mailPassword}
                  onChange={(event) => setEmailForm((current) => ({ ...current, mailPassword: event.target.value }))}
                  placeholder={hasSavedMailPassword ? 'Leave blank to keep the saved password' : 'Enter SMTP password'}
                />
                {hasSavedMailPassword && (
                  <p className="mt-2 text-xs text-slate-500">A saved SMTP password already exists. Leave this blank to keep it.</p>
                )}
              </div>
              <AdminTextInput label="Mail Encryption" value={emailForm.mailEncryption} onChange={(event) => setEmailForm((current) => ({ ...current, mailEncryption: event.target.value }))} />
              <AdminTextInput label="Sender Name" value={emailForm.fromName} onChange={(event) => setEmailForm((current) => ({ ...current, fromName: event.target.value }))} />
              <AdminTextInput label="Sender Email" value={emailForm.fromAddress} onChange={(event) => setEmailForm((current) => ({ ...current, fromAddress: event.target.value }))} />
              <div className="md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-slate-700">Admin Notification Triggers</p>
                <div className="space-y-3">
                  {[
                    { key: 'notifyOnUserRegistration' as const, label: 'New user registration' },
                    { key: 'notifyOnKycSubmission' as const, label: 'KYC document submitted' },
                    { key: 'notifyOnKycApproval' as const, label: 'KYC case approved' },
                  ].map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={emailForm[item.key]}
                          onChange={(event) => setEmailForm((current) => ({ ...current, [item.key]: event.target.checked }))}
                        />
                        <div className={`h-5 w-9 rounded-full transition-colors ${emailForm[item.key] ? 'bg-violet-600' : 'bg-slate-300'}`} />
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${emailForm[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <AdminButton onClick={saveEmail}>Save Email Settings</AdminButton>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {currentTab === 'wallets' && (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Configure Wallet Rail</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AdminTextInput label="Symbol (e.g. BTC)" value={railForm.symbol} onChange={(e) => setRailForm((c) => ({ ...c, symbol: e.target.value.toUpperCase() }))} />
              <AdminTextInput label="Name (e.g. Bitcoin)" value={railForm.name} onChange={(e) => setRailForm((c) => ({ ...c, name: e.target.value }))} />
              <AdminTextInput label="Network (e.g. Native, TRC20)" value={railForm.network} onChange={(e) => setRailForm((c) => ({ ...c, network: e.target.value }))} />
              <AdminSelect label="Status" value={railForm.status} onChange={(e) => setRailForm((c) => ({ ...c, status: e.target.value as any }))}>
                <option>Healthy</option>
                <option>Watch</option>
                <option>Paused</option>
              </AdminSelect>
              <div className="md:col-span-2">
                <AdminTextInput label="Deposit Address" value={railForm.address} onChange={(e) => setRailForm((c) => ({ ...c, address: e.target.value }))} placeholder="Public on-chain address for users to deposit" />
              </div>
              <div className="md:col-span-2">
                <AdminTextInput label="Internal PayID" value={railForm.payId} onChange={(e) => setRailForm((c) => ({ ...c, payId: e.target.value }))} placeholder="Internal identifier (optional)" />
              </div>
              <AdminTextInput label="Min Deposit" value={railForm.minDeposit} onChange={(e) => setRailForm((c) => ({ ...c, minDeposit: e.target.value }))} />
              <AdminTextInput label="Min Withdrawal" value={railForm.minWithdrawal} onChange={(e) => setRailForm((c) => ({ ...c, minWithdrawal: e.target.value }))} />
              <AdminTextInput label="Fee" value={railForm.fee} onChange={(e) => setRailForm((c) => ({ ...c, fee: e.target.value }))} />
              <AdminTextInput label="Confirmations text" value={railForm.confirmations} onChange={(e) => setRailForm((c) => ({ ...c, confirmations: e.target.value }))} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              {editingRailId && (
                <AdminButton variant="secondary" onClick={() => {
                  setEditingRailId(null);
                  setRailForm({ symbol: '', name: '', network: '', address: '', payId: '', status: 'Healthy', minDeposit: '', minWithdrawal: '', fee: '', confirmations: '' });
                }}>Cancel Edit</AdminButton>
              )}
              <AdminButton onClick={saveWalletRail}>
                {editingRailId ? 'Update Rail' : 'Add Wallet Rail'}
              </AdminButton>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Current Wallet Rails</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {adminWalletRails.map((rail) => (
                <div key={rail.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{rail.name} ({rail.symbol})</p>
                      <p className="text-sm text-slate-500">{rail.network}</p>
                    </div>
                    <AdminBadge value={rail.status} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="truncate"><span className="font-semibold">Address:</span> {rail.address || 'None'}</p>
                    <p>Minimum deposit: {rail.minDeposit}</p>
                    <p>Minimum withdrawal: {rail.minWithdrawal}</p>
                    <p>Fee: {rail.fee}</p>
                    <p>{rail.confirmations}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <AdminButton variant="secondary" onClick={() => editWalletRail(rail)}>Edit</AdminButton>
                    <AdminButton variant="secondary" onClick={() => deleteWalletRail(rail.id)}>Delete</AdminButton>
                  </div>
                </div>
              ))}
              {adminWalletRails.length === 0 && (
                <p className="text-sm text-slate-500 md:col-span-2">No wallet rails configured.</p>
              )}
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
};
