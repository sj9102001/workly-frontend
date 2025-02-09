'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Modal from '@/app/components/Modal';
import { organizationsApi } from '@/app/services/organizations';

export default function SettingsPage() {
    const router = useRouter();
    const params = useParams();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleDeleteOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleting(true);

        try {
            await organizationsApi.delete(params.orgId as string);
            toast.success('Organization deleted successfully');
            router.push('/organizations');
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to delete organization');
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Organization Settings</h1>
                <p className="text-sm text-gray-500">Manage organization settings and danger zone actions</p>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                    <div className="pb-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Irreversible and destructive actions
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Delete Organization</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Permanently delete this organization and all of its data. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Organization
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Organization Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Organization"
                maxWidth="md"
            >
                <form onSubmit={handleDeleteOrganization}>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">This action cannot be undone</p>
                            </div>
                            <p className="text-sm mt-2">
                                This will permanently delete the organization and all of its data, including:
                            </p>
                            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                                <li>All projects and their data</li>
                                <li>All issues and comments</li>
                                <li>All team members and their roles</li>
                                <li>All settings and configurations</li>
                            </ul>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type "delete" to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Type &quot;delete&quot;"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={deleting || confirmText !== 'delete'}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {deleting ? 'Deleting...' : 'Delete Organization'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
} 