import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { EditApplicationModal } from '../../components/admin/EditApplicationModal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { getDistrictsApi } from '../../services/districtService';

export function EditApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, updateApplication, refreshData } = useAdmin();
  const [createdDistricts, setCreatedDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDistricts = async () => {
      try {
        const data = await getDistrictsApi();
        if (isMounted && data && Array.isArray(data.districts)) {
          setCreatedDistricts(data.districts);
        }
      } catch (err) {
        console.warn('Unable to load created branches/districts:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDistricts();
    return () => {
      isMounted = false;
    };
  }, []);

  const app = applications.find(
    (a) => a._id === id || a.id === id || a.applicationId === id || a.refId === id
  );

  const handleSave = async (appId, payload) => {
    await updateApplication(appId, payload);
    if (typeof refreshData === 'function') {
      refreshData();
    }
    navigate(`/admin-dashboard/applications/${app?.id || appId}`);
  };

  const handleClose = () => {
    navigate(-1 || '/admin-dashboard/applications');
  };

  if (!app && applications.length > 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
        <h3 className="text-base font-bold text-slate-800">Application not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 font-mono">
          No application record matching identifier "{id}".
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/applications')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b1c3d] text-white font-bold text-xs rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="font-mono text-xs text-slate-400">
          Editing: {app?.id || id}
        </span>
      </div>

      <ErrorBoundary onReset={handleClose}>
        {app ? (
          <EditApplicationModal
            isOpen={true}
            application={app}
            districts={createdDistricts}
            onClose={handleClose}
            onSave={handleSave}
          />
        ) : (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading application details...</span>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

export default EditApplicationPage;
