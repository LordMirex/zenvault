import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, Image, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { AdminBadge, AdminButton, AdminCard, AdminPageHeading, AdminTextArea, AdminTextInput } from '../../components/admin/AdminUi';
import { cn } from '../../lib/cn';
import { getAccessToken } from '../../lib/api';

const tabs = [
  { label: 'General Settings', to: '/admin/settings/general', key: 'general' },
  { label: 'Email Settings', to: '/admin/settings/email', key: 'email' },
  { label: 'Wallet Settings', to: '/admin/settings/wallets', key: 'wallets' },
] as const;

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const AdminSettingsPage = () => {
  const location = useLocation();
  const { adminSettings, saveAdminSettings, adminAssetCatalog } = useAuth();
  const { refreshBranding } = useBranding();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
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
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
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

  const [walletForm, setWalletForm] = useState({
    activeAssetIds: [] as string[],
    cardApplicationFeeUsd: '75',
    assetConfigs: {} as Record<string, { depositAddress: string }>,
  });

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
        companyAddress: String(adminSettings.general.companyAddress ?? ''),
        companyPhone: String(adminSettings.general.companyPhone ?? ''),
        companyEmail: String(adminSettings.general.companyEmail ?? ''),
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

    if (adminSettings?.wallets) {
      const assetConfigs =
        adminSettings.wallets.assetConfigs && typeof adminSettings.wallets.assetConfigs === 'object'
          ? Object.fromEntries(
            Object.entries(adminSettings.wallets.assetConfigs as Record<string, unknown>).map(([assetId, config]) => {
              const depositAddress =
                config && typeof config === 'object' && !Array.isArray(config)
                  ? String((config as { depositAddress?: unknown; address?: unknown }).depositAddress ?? (config as { address?: unknown }).address ?? '')
                  : '';

              return [assetId, { depositAddress }];
            }),
          )
          : {};

      setWalletForm({
        activeAssetIds: Array.isArray(adminSettings.wallets.activeAssetIds)
          ? adminSettings.wallets.activeAssetIds.map((value) => String(value))
          : [],
        cardApplicationFeeUsd: String(adminSettings.wallets.cardApplicationFeeUsd ?? 75),
        assetConfigs,
      });
    }
  }, [adminSettings]);

  const currentTab = location.pathname.includes('/email')
    ? 'email'
    : location.pathname.includes('/wallets')
      ? 'wallets'
      : 'general';

  const saveGeneral = async () => {
    setSaving(true);
    setSaveError('');
    setMessage('');
    try {
      await saveAdminSettings('general', {
        ...adminSettings?.general,
        ...generalForm,
      });
      await refreshBranding();
      setMessage('General settings saved.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    setSaving(true);
    setSaveError('');
    setMessage('');
    try {
      await saveAdminSettings('email', {
        fromName: emailForm.fromName,
        fromAddress: emailForm.fromAddress,
        mailDriver: emailForm.mailDriver,
        mailHost: emailForm.mailHost,
        mailPort: emailForm.mailPort,
        mailUsername: emailForm.mailUsername,
        mailPassword: emailForm.mailPassword,
        mailEncryption: emailForm.mailEncryption,
        notifyOnUserRegistration: emailForm.notifyOnUserRegistration,
        notifyOnKycSubmission: emailForm.notifyOnKycSubmission,
        notifyOnKycApproval: emailForm.notifyOnKycApproval,
      });
      setEmailForm((current) => ({ ...current, mailPassword: '' }));
      setMessage('Email settings saved successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save email settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAsset = (assetId: string) => {
    setWalletForm((current) => {
      const activeAssetIds = current.activeAssetIds.includes(assetId)
        ? current.activeAssetIds.filter((value) => value !== assetId)
        : [...current.activeAssetIds, assetId];

      return {
        ...current,
        activeAssetIds,
      };
    });
  };

  const saveWalletSettings = async () => {
    setSaving(true);
    setSaveError('');
    setMessage('');
    try {
      await saveAdminSettings('wallets', {
      activeAssetIds: walletForm.activeAssetIds,
      cardApplicationFeeUsd: Number(walletForm.cardApplicationFeeUsd || 0),
      assetConfigs: Object.fromEntries(
        Object.entries(walletForm.assetConfigs)
          .map(([assetId, config]) => [assetId, { depositAddress: String(config.depositAddress ?? '').trim() }])
          .filter(([, config]) => Boolean((config as { depositAddress: string }).depositAddress)),
      ),
    });
      setMessage('Wallet settings saved successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save wallet settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateAssetDepositAddress = (assetId: string, depositAddress: string) => {
    setWalletForm((current) => ({
      ...current,
      assetConfigs: {
        ...current.assetConfigs,
        [assetId]: {
          depositAddress,
        },
      },
    }));
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
        description="General, email, and wallet settings now persist through the live database-backed API."
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

      {saveError && (
        <AdminCard className="border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {saveError}
        </AdminCard>
      )}
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
            <h3 className="text-lg font-semibold text-slate-900">Company Contact</h3>
            <div className="mt-5 grid gap-4">
              <AdminTextInput label="Company Address" value={generalForm.companyAddress} onChange={(event) => setGeneralForm((current) => ({ ...current, companyAddress: event.target.value }))} placeholder="Office or mailing address" />
              <AdminTextInput label="Company Phone" value={generalForm.companyPhone} onChange={(event) => setGeneralForm((current) => ({ ...current, companyPhone: event.target.value }))} placeholder="+1 555 000 0000" />
              <AdminTextInput label="Company Email" value={generalForm.companyEmail} onChange={(event) => setGeneralForm((current) => ({ ...current, companyEmail: event.target.value }))} placeholder="support@example.com" />
              <AdminButton onClick={saveGeneral} disabled={saving}>{saving ? ‘Saving…’ : ‘Save General Settings’}</AdminButton>
            </div>
          </AdminCard>
        </div>
      )}

      {currentTab === 'email' && (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Live Email System</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Welcome emails, KYC notices, and manual broadcasts all use one shared branded layout tied to your live site settings.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: 'Brand source',
                  value: generalForm.siteName || 'Not configured',
                  detail: 'Uses your public logo, site name, and footer summary.',
                },
                {
                  label: 'Sender',
                  value: emailForm.fromName || 'Not configured',
                  detail: emailForm.fromAddress || 'Set a sender email below before delivery.',
                },
                {
                  label: 'Preview and send',
                  value: 'Broadcasts',
                  detail: 'Compose and preview the live layout from the broadcast workspace.',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-base font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Link
                to="/admin/broadcasts"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Broadcast Workspace
              </Link>
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
                <AdminButton onClick={saveEmail} disabled={saving}>{saving ? 'Saving…' : 'Save Email Settings'}</AdminButton>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {currentTab === 'wallets' && (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Asset Activation</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              This panel now uses a fixed top-20 asset catalog with live logos and live market prices. Toggle only the assets
              you want users and operators to work with.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <AdminTextInput
                label="Card Application Fee (USD)"
                value={walletForm.cardApplicationFeeUsd}
                onChange={(event) => setWalletForm((current) => ({ ...current, cardApplicationFeeUsd: event.target.value }))}
                placeholder="75"
              />
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active Assets</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{walletForm.activeAssetIds.length}</p>
                <p className="mt-1 text-sm text-slate-500">Users can hold and admins can fund only the assets enabled here.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <AdminButton onClick={saveWalletSettings} disabled={saving}>{saving ? 'Saving…' : 'Save Asset Settings'}</AdminButton>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Supported Top 20 Assets</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {adminAssetCatalog.map((asset) => {
                const isActive = walletForm.activeAssetIds.includes(asset.id);

                return (
                <div key={asset.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={asset.icon} alt={asset.name} className="h-10 w-10 rounded-full bg-white p-1 shadow-sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{asset.name} ({asset.symbol})</p>
                        <p className="text-sm text-slate-500">{asset.network}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      #{asset.marketCapRank}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </p>
                      <p className={`mt-1 text-sm font-medium ${asset.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={() => toggleAsset(asset.id)}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        isActive ? 'bg-violet-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-4">
                    <AdminTextInput
                      label="Shared Deposit Address"
                      value={walletForm.assetConfigs[asset.id]?.depositAddress ?? asset.depositAddress ?? ''}
                      onChange={(event) => updateAssetDepositAddress(asset.id, event.target.value)}
                      placeholder={`Set the ${asset.symbol} address every user should deposit to`}
                    />
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Users will see this address on their deposit screens for {asset.symbol}. Leave it blank to use the generated fallback address.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {asset.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                        {tag}
                      </span>
                    ))}
                    <AdminBadge value={isActive ? 'Active' : 'Inactive'} />
                  </div>
                </div>
              );
              })}
              {adminAssetCatalog.length === 0 && (
                <p className="text-sm text-slate-500 md:col-span-2">Live asset catalog unavailable.</p>
              )}
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
};
