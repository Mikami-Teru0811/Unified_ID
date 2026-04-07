import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import adminApi from "../../services/admin.api";
import toast from "react-hot-toast";

const PERMISSIONS_LIST = [
  { key: 'patient_register', label: 'Patient Register', icon: 'person_add', category: 'registration' },
  { key: 'emr_write', label: 'EMR Write', icon: 'edit_note', category: 'clinical' },
  { key: 'identity_view', label: 'Identity View', icon: 'visibility', category: 'access' },
  { key: 'patient_search', label: 'Patient Search', icon: 'search', category: 'access' },
  { key: 'prescription_view', label: 'Prescription View', icon: 'medication', category: 'clinical' },
  { key: 'prescription_create', label: 'Prescription Create', icon: 'prescriptions', category: 'clinical' },
  { key: 'emergency_bypass', label: 'Emergency Bypass', icon: 'emergency', category: 'emergency' },
  { key: 'consent_manage', label: 'Consent Manage', icon: 'verified_user', category: 'consent' },
  { key: 'user_manage', label: 'User Manage', icon: 'manage_accounts', category: 'admin' }
];

const ROLES = ['HOSPITAL', 'DOCTOR', 'PATIENT', 'MEDICAL_SHOP'];

const ROLE_COLORS = {
  HOSPITAL: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', icon: 'local_hospital' },
  DOCTOR: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', icon: 'medical_services' },
  PATIENT: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500', icon: 'person' },
  MEDICAL_SHOP: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', icon: 'local_pharmacy' }
};

const CATEGORY_COLORS = {
  registration: '#10b981',
  clinical: '#3b82f6',
  access: '#a855f7',
  emergency: '#ef4444',
  consent: '#06b6d4',
  admin: '#f97316'
};

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        enabled ? 'bg-emerald-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function Permissions() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [permissions, setPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPermissions();
      
      // Convert lowercase API keys to uppercase (API returns: { hospital: {...} }, Frontend needs: { HOSPITAL: {...} })
      const formatted = {};
      for (const [key, value] of Object.entries(data)) {
        formatted[key.toUpperCase()] = value;
      }
      
      setPermissions(formatted);
      setOriginalPermissions(JSON.parse(JSON.stringify(formatted)));
    } catch (error) {
      console.error('Failed to load permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (role, permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: !prev[role]?.[permissionKey]
      }
    }));
  };

  const getPendingCount = () => {
    let count = 0;
    ROLES.forEach(role => {
      PERMISSIONS_LIST.forEach(perm => {
        const original = originalPermissions[role]?.[perm.key] || false;
        const current = permissions[role]?.[perm.key] || false;
        if (original !== current) count++;
      });
    });
    return count;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const role of ROLES) {
        await adminApi.savePermissions({
          role: role.toLowerCase(),
          permissions: permissions[role] || {}
        });
      }
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
      toast.success('Permissions saved successfully');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
    toast('Changes discarded');
  };

  const pendingCount = getPendingCount();

  const permissionStats = useMemo(() => {
    const stats = {};
    ROLES.forEach(role => {
      const rolePerms = Object.values(permissions[role] || {}).filter(Boolean).length;
      stats[role] = {
        total: PERMISSIONS_LIST.length,
        enabled: rolePerms,
        percentage: Math.round((rolePerms / PERMISSIONS_LIST.length) * 100)
      };
    });
    return stats;
  }, [permissions]);

  const categoryDistribution = useMemo(() => {
    const categories = {};
    PERMISSIONS_LIST.forEach(perm => {
      if (!categories[perm.category]) {
        categories[perm.category] = { count: 0, roles: [] };
      }
      ROLES.forEach(role => {
        if (permissions[role]?.[perm.key]) {
          categories[perm.category].count++;
          if (!categories[perm.category].roles.includes(role)) {
            categories[perm.category].roles.push(role);
          }
        }
      });
    });
    return categories;
  }, [permissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div>
        <h2 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Security Matrix</h2>
        <p className={`mt-2 font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>Define fine-grained access protocols for system roles</p>
      </div>

      <div className={`rounded-3xl border p-10 shadow-2xl ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-start gap-4 mb-8">
          <div className="size-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
            <span className="material-symbols-outlined">rule_settings</span>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>Global Permissions Overlay</h3>
            <p className={`text-sm mt-1 uppercase tracking-widest font-bold text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Changes here affect all active session tokens</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <th className={`text-left pb-4 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Permission
                </th>
                {ROLES.map(role => (
                  <th key={role} className={`text-center pb-4 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {role.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS_LIST.map(perm => (
                <tr key={perm.key} className={`border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                  <td className={`py-4 text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {perm.label}
                  </td>
                  {ROLES.map(role => {
                    const isEnabled = permissions[role]?.[perm.key] || false;
                    const originalEnabled = originalPermissions[role]?.[perm.key] || false;
                    const hasChanged = isEnabled !== originalEnabled;
                    
                    return (
                      <td key={`${role}-${perm.key}`} className="py-4 text-center">
                        <div className="flex items-center justify-center">
                          <ToggleSwitch
                            enabled={isEnabled}
                            onChange={() => handleToggle(role, perm.key)}
                          />
                          {hasChanged && (
                            <span className="ml-2 w-2 h-2 rounded-full bg-amber-500"></span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`mt-10 p-8 border rounded-3xl ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <h4 className={`text-lg font-black mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Permission Distribution Overview
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role-wise Permission Bar Chart */}
            <div className="space-y-4">
              <h5 className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Role Access Coverage
              </h5>
              {ROLES.map(role => {
                const stats = permissionStats[role];
                const colors = ROLE_COLORS[role];
                return (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${colors.text}`}>{colors.icon}</span>
                        <span className={`text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {role.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        {stats.enabled}/{stats.total} ({stats.percentage}%)
                      </span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${colors.text.replace('text-', 'bg-')}`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Distribution */}
            <div className="space-y-4">
              <h5 className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Permission Categories
              </h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryDistribution).map(([category, data]) => (
                  <div 
                    key={category}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[category] }}
                    />
                    <span className={`text-xs font-bold capitalize ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {category}
                    </span>
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      ({data.count})
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Access Grid */}
              <div className={`mt-6 p-4 rounded-2xl ${isDark ? "bg-slate-800/50" : "bg-white border border-slate-200"}`}>
                <h5 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Quick Access Matrix
                </h5>
                <div className="grid grid-cols-4 gap-2">
                  {PERMISSIONS_LIST.slice(0, 8).map(perm => (
                    <div 
                      key={perm.key}
                      className="flex items-center gap-1"
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[perm.category] }}
                      />
                      <span className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {perm.label.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className={`mt-8 pt-6 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                <div className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  {ROLES.length}
                </div>
                <div className={`text-xs uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Roles
                </div>
              </div>
              <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                <div className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  {PERMISSIONS_LIST.length}
                </div>
                <div className={`text-xs uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Permissions
                </div>
              </div>
              <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                <div className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  {pendingCount}
                </div>
                <div className={`text-xs uppercase tracking-widest ${isDark ? "text-amber-500" : "text-amber-600"}`}>
                  Pending
                </div>
              </div>
              <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
                <div className={`text-2xl font-black ${isDark ? "text-emerald-500" : "text-emerald-600"}`}>
                  {PERMISSIONS_LIST.length * ROLES.length - pendingCount}
                </div>
                <div className={`text-xs uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-500"}`}>
                  Active Rules
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed bottom-10 left-80 right-10 backdrop-blur-xl border p-6 rounded-[2.5rem] flex justify-between items-center shadow-2xl animate-in slide-in-from-bottom-10 duration-1000 ${isDark ? "bg-[#0f172a]/80 border-slate-700" : "bg-white/90 border-slate-200"}`}>
        <div className="flex items-center gap-4">
          <div className={`size-10 rounded-xl flex items-center justify-center ${pendingCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <span className="material-symbols-outlined">{pendingCount > 0 ? 'pending_actions' : 'check_circle'}</span>
          </div>
          <div>
            <span className={`font-bold block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {pendingCount > 0 ? 'Policy Update Pending' : 'All Changes Saved'}
            </span>
            <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {pendingCount > 0 ? `${pendingCount} modification${pendingCount > 1 ? 's' : ''} to role-based access tokens` : 'Permissions are up to date'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDiscard}
            disabled={pendingCount === 0 || saving}
            className={`px-6 py-3 font-bold transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-700"} ${pendingCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={pendingCount === 0 || saving}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-950 px-8 py-3 rounded-2xl font-black tracking-tight shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>
                Saving...
              </>
            ) : (
              'Commit Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
