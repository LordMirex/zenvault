import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Coins, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import {
  AdminActionBar,
  AdminBadge,
  AdminButton,
  AdminIconAction,
  AdminModal,
  AdminNotice,
  AdminPageHeading,
  AdminSelect,
  AdminTableWrap,
  AdminTextInput,
} from '../../components/admin/AdminUi';

export const AdminTransactionsPage = () => {
  const { refreshBootstrap, adminTransactions, adminUsers } = useAuth();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState({
    userId: adminUsers[0]?.id ?? '',
    type: 'Deposit',
    asset: 'USDT',
    amount: '1000 USDT',
    channel: 'TRC20 Wallet',
    destination: 'Treasury funding',
    status: 'Pending',
    fromAsset: '',
    toAsset: '',
    networkFee: '',
    rate: '',
  });

  const selectedTransaction = selectedTransactionId
    ? adminTransactions.find((transaction) => transaction.id === selectedTransactionId) ?? null
    : null;
  const selectedUser = selectedTransaction
    ? adminUsers.find((entry) => entry.id === selectedTransaction.userId) ?? null
    : null;

  const selectedCreateUser = useMemo(
    () => adminUsers.find((user) => user.id === createForm.userId) ?? null,
    [createForm.userId],
  );

  const createAssetOptions = useMemo(() => {
    if (!selectedCreateUser || selectedCreateUser.holdings.length === 0) {
      return ['USDT'];
    }

    return Array.from(new Set(selectedCreateUser.holdings.map((holding) => holding.symbol)));
  }, [selectedCreateUser]);

  const handleStatusChange = async (transactionId: string, status: 'Completed' | 'Pending' | 'Review') => {
    setFeedback('');
    setError('');
    setActiveTransactionId(transactionId);

    try {
      await apiRequest(`/api/admin/transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await refreshBootstrap();
      setFeedback(`Transaction moved to ${status}.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update the transaction.');
    } finally {
      setActiveTransactionId(null);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!window.confirm('Delete this transaction record? This cannot be undone.')) {
      return;
    }

    setFeedback('');
    setError('');
    setActiveTransactionId(transactionId);

    try {
      await apiRequest(`/api/admin/transactions/${transactionId}`, {
        method: 'DELETE',
      });
      await refreshBootstrap();
      setSelectedTransactionId((current) => (current === transactionId ? null : current));
      setFeedback('Transaction deleted.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to delete the transaction.');
    } finally {
      setActiveTransactionId(null);
    }
  };

  const handleCreate = async () => {
    setFeedback('');
    setError('');
    setActiveTransactionId('create');

    try {
      await apiRequest('/api/admin/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...createForm,
          userId: Number(createForm.userId),
        }),
      });
      await refreshBootstrap();
      setFeedback('Transaction created.');
      setShowCreateModal(false);
      setCreateForm((current) => ({
        ...current,
        amount: '1000 USDT',
        destination: 'Treasury funding',
        networkFee: '',
        rate: '',
        fromAsset: '',
        toAsset: '',
      }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create the transaction.');
    } finally {
      setActiveTransactionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Transactions"
        description="Recovered transaction ledger with create, inspect, status, and delete actions backed by the admin API."
        actions={<AdminButton onClick={() => setShowCreateModal(true)}>Create Transaction</AdminButton>}
      />

      {feedback && <AdminNotice tone="success">{feedback}</AdminNotice>}
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}

      <AdminTableWrap>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Asset</th>
              <th className="px-5 py-3 font-semibold">Channel</th>
              <th className="px-5 py-3 font-semibold">Destination</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {adminTransactions.map((transaction) => {
              const user = adminUsers.find((entry) => entry.id === transaction.userId);
              const isBusy = activeTransactionId === transaction.id;

              return (
                <tr key={transaction.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{user?.name ?? 'Unknown user'}</p>
                    <p className="text-xs text-slate-500">{transaction.createdAt}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{transaction.type}</td>
                  <td className="px-5 py-4 text-slate-700">
                    {transaction.asset} - {transaction.amount}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{transaction.channel}</td>
                  <td className="px-5 py-4 text-slate-700">{transaction.destination}</td>
                  <td className="px-5 py-4">
                    <AdminBadge value={transaction.status} />
                  </td>
                  <td className="px-5 py-4">
                    <AdminActionBar>
                      <AdminIconAction icon={Eye} label={`Inspect ${transaction.id}`} tone="violet" onClick={() => setSelectedTransactionId(transaction.id)} />
                      <AdminIconAction
                        icon={Check}
                        label={`Mark ${transaction.id} completed`}
                        tone="emerald"
                        disabled={isBusy || transaction.status === 'Completed'}
                        onClick={() => void handleStatusChange(transaction.id, 'Completed')}
                      />
                      <AdminIconAction
                        icon={AlertTriangle}
                        label={`Move ${transaction.id} to review`}
                        tone="amber"
                        disabled={isBusy || transaction.status === 'Review'}
                        onClick={() => void handleStatusChange(transaction.id, 'Review')}
                      />
                      <AdminIconAction
                        icon={RotateCcw}
                        label={`Move ${transaction.id} to pending`}
                        tone="slate"
                        disabled={isBusy || transaction.status === 'Pending'}
                        onClick={() => void handleStatusChange(transaction.id, 'Pending')}
                      />
                      <AdminIconAction
                        icon={Trash2}
                        label={`Delete ${transaction.id}`}
                        tone="rose"
                        disabled={isBusy}
                        onClick={() => void handleDelete(transaction.id)}
                      />
                    </AdminActionBar>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableWrap>

      <AdminModal
        open={Boolean(selectedTransaction)}
        title={selectedTransaction ? `${selectedTransaction.type} Transaction` : 'Transaction'}
        description={selectedUser ? `${selectedUser.name} - ${selectedTransaction?.createdAt}` : selectedTransaction?.createdAt}
        onClose={() => setSelectedTransactionId(null)}
        footer={
          selectedTransaction ? (
            <AdminActionBar className="justify-between">
              <AdminIconAction
                icon={Coins}
                label={`Open ${selectedUser?.name ?? 'user'} crypto records`}
                tone="blue"
                to={selectedUser ? `/admin/users/${selectedUser.id}/crypto` : undefined}
                disabled={!selectedUser}
              />
              <AdminActionBar>
                <AdminIconAction
                  icon={Check}
                  label={`Mark ${selectedTransaction.id} completed`}
                  tone="emerald"
                  disabled={activeTransactionId === selectedTransaction.id || selectedTransaction.status === 'Completed'}
                  onClick={() => void handleStatusChange(selectedTransaction.id, 'Completed')}
                />
                <AdminIconAction
                  icon={AlertTriangle}
                  label={`Move ${selectedTransaction.id} to review`}
                  tone="amber"
                  disabled={activeTransactionId === selectedTransaction.id || selectedTransaction.status === 'Review'}
                  onClick={() => void handleStatusChange(selectedTransaction.id, 'Review')}
                />
                <AdminIconAction
                  icon={Trash2}
                  label={`Delete ${selectedTransaction.id}`}
                  tone="rose"
                  disabled={activeTransactionId === selectedTransaction.id}
                  onClick={() => void handleDelete(selectedTransaction.id)}
                />
              </AdminActionBar>
            </AdminActionBar>
          ) : null
        }
      >
        {selectedTransaction && (
          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Transaction ID" value={selectedTransaction.id} />
            <InfoTile label="Status" value={selectedTransaction.status} />
            <InfoTile label="Asset" value={selectedTransaction.asset} />
            <InfoTile label="Amount" value={selectedTransaction.amount} />
            <InfoTile label="Channel" value={selectedTransaction.channel} />
            <InfoTile label="Destination" value={selectedTransaction.destination} />
            <InfoTile label="Rate" value={selectedTransaction.rate || 'Unavailable'} />
            <InfoTile label="Network Fee" value={selectedTransaction.networkFee || 'Unavailable'} />
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={showCreateModal}
        title="Create Transaction"
        description="Add a funding, reward, transfer, or withdrawal record directly from the admin console."
        onClose={() => setShowCreateModal(false)}
        footer={
          <div className="flex justify-end">
            <AdminButton onClick={() => void handleCreate()} disabled={activeTransactionId === 'create'}>
              {activeTransactionId === 'create' ? 'Creating...' : 'Create Transaction'}
            </AdminButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminSelect label="User" value={createForm.userId} onChange={(event) => setCreateForm((current) => ({ ...current, userId: event.target.value }))}>
            {adminUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect label="Type" value={createForm.type} onChange={(event) => setCreateForm((current) => ({ ...current, type: event.target.value }))}>
            <option>Deposit</option>
            <option>Withdrawal</option>
            <option>Reward</option>
            <option>Transfer</option>
          </AdminSelect>
          <AdminSelect
            label="Asset"
            value={createForm.asset}
            onChange={(event) => setCreateForm((current) => ({ ...current, asset: event.target.value }))}
          >
            {createAssetOptions.map((asset) => (
              <option key={asset}>{asset}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            label="Status"
            value={createForm.status}
            onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option>Pending</option>
            <option>Completed</option>
            <option>Review</option>
          </AdminSelect>
          <AdminTextInput label="Amount" value={createForm.amount} onChange={(event) => setCreateForm((current) => ({ ...current, amount: event.target.value }))} />
          <AdminTextInput label="Channel" value={createForm.channel} onChange={(event) => setCreateForm((current) => ({ ...current, channel: event.target.value }))} />
          <AdminTextInput label="Destination" value={createForm.destination} onChange={(event) => setCreateForm((current) => ({ ...current, destination: event.target.value }))} />
          <AdminTextInput label="From Asset ID" value={createForm.fromAsset} onChange={(event) => setCreateForm((current) => ({ ...current, fromAsset: event.target.value }))} placeholder="Optional assetId for user activity log" />
          <AdminTextInput label="To Asset" value={createForm.toAsset} onChange={(event) => setCreateForm((current) => ({ ...current, toAsset: event.target.value }))} />
          <AdminTextInput label="Network Fee" value={createForm.networkFee} onChange={(event) => setCreateForm((current) => ({ ...current, networkFee: event.target.value }))} />
          <AdminTextInput label="Rate" value={createForm.rate} onChange={(event) => setCreateForm((current) => ({ ...current, rate: event.target.value }))} />
        </div>
      </AdminModal>
    </div>
  );
};

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
