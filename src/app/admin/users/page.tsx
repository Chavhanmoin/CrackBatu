'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { Loader2, LogOut } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/admin/login');
        return;
      }

      // Get admin data
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

      // Fetch users
      let usersQuery;
      if (data.role === 'super_admin') {
        usersQuery = collection(db, 'users'); // all users
      } else {
        usersQuery = query(collection(db, 'users'), where('department', '==', data.department));
      }

      const usersSnapshot = await getDocs(usersQuery);
      const usersList: any[] = [];
      usersSnapshot.forEach((doc) => {
        usersList.push(doc.data());
      });

      setUsers(usersList);
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
        <span>Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-gray-900 text-yellow-400">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600 text-black font-semibold"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-gray-800 border border-yellow-500 rounded">
        <table className="min-w-full divide-y divide-yellow-500 text-yellow-400">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Department</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-500">
            {users.map((u, idx) => (
              <tr key={idx} className="hover:bg-gray-700">
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4">{u.department || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="mt-4 text-center text-yellow-300">No users found.</p>
      )}
    </div>
  );
}
