'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, LogOut, Folder, CheckCircle, Upload, Edit, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const deptParam = useSearchParams().get('dept');

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/admin/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        router.push('/auth/admin/login');
        return;
      }

      const data = userDoc.data();
      if (!data.role?.includes('_admin')) {
        router.push('/auth/admin/login');
        return;
      }

      setUserData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/auth/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-yellow-400">
        <Loader2 className="animate-spin w-8 h-8 mr-2" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-gray-900 text-yellow-400">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600 text-black font-semibold"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-gray-800 border border-yellow-500 rounded p-6 mb-8">
        <p className="text-xl">👋 Welcome, <strong>{userData.name}</strong></p>
        <p className="mt-2">🔑 Role: <strong>{userData.role}</strong></p>
        {userData.department && <p>🏫 Department: <strong>{userData.department}</strong></p>}
      </div>

      {/* Dashboard Actions */}
      <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.role === 'super_admin' ? (
          <>
            <ActionCard icon={<Folder />} label="Manage All Departments" link="/admin/manage" />
            <ActionCard icon={<CheckCircle />} label="Approve Deletes" link="/admin/approvals" />
            <ActionCard icon={<Shield />} label="Edit/Delete Any Content" link="/admin/content" />
          </>
        ) : (
          <>
            <ActionCard icon={<Folder />} label={`Manage ${userData.department}`} link={`/admin/${userData.department}`} />
            <ActionCard icon={<Upload />} label="Upload Content" link={`/admin/${userData.department}/upload`} />
            <ActionCard icon={<Edit />} label="Edit Content" link={`/admin/${userData.department}/edit`} />
          </>
        )}
      </div>
    </div>
  );
}

// Reusable Action Card
function ActionCard({ icon, label, link }: { icon: React.ReactNode; label: string; link: string }) {
  const router = useRouter();
  return (
    <div
      className="bg-gray-800 border border-yellow-500 rounded p-6 flex flex-col items-center justify-center text-center text-yellow-400 cursor-pointer hover:bg-gray-700 transition"
      onClick={() => router.push(link)}
    >
      <div className="mb-3">{icon}</div>
      <p className="font-semibold">{label}</p>
    </div>
  );
}
