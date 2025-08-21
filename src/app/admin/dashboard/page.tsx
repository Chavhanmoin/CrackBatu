'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get('dept');

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/auth/admin/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        router.push('/auth/admin/login');
        return;
      }

      setUserData(userDoc.data());
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10 min-h-screen bg-gray-900 text-yellow-400">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, <strong>{userData.name}</strong>!</p>
      <p>Your role: <strong>{userData.role}</strong></p>
      {userData.department && (
        <p>Department: <strong>{userData.department}</strong></p>
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Dashboard Links</h2>
        {userData.role === 'super_admin' && (
          <ul className="list-disc ml-6">
            <li>Manage All Departments</li>
            <li>Approve Deletes</li>
            <li>Edit or Delete Any Content</li>
          </ul>
        )}
        {userData.role !== 'super_admin' && (
          <ul className="list-disc ml-6">
            <li>Manage your Department: {userData.department}</li>
            <li>Upload or Edit Content</li>
            <li>Delete requires Super Admin Approval</li>
          </ul>
        )}
      </div>
    </div>
  );
}
