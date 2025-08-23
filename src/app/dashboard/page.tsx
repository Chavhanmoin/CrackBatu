'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get('dept');

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/admin/login");
        return;
      }

      // Fetch user info from Firestore
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists()) {
        router.push("/auth/admin/login");
        return;
      }

      setUserData(userDoc.data());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-yellow-400">
        <Loader2 className="animate-spin w-8 h-8 mr-2" />
        <span>Loading dashboard...</span>
      </div>
    );

  return (
    <div className="p-10 min-h-screen bg-gray-900 text-yellow-400">
      <h1 className="text-3xl font-bold mb-4">Welcome, {userData.name}</h1>
      <p className="mb-2">Role: <strong>{userData.role}</strong></p>
      {userData.department && <p>Department: <strong>{userData.department}</strong></p>}

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Quick Actions</h2>
        <ul className="list-disc ml-6">
          {userData.role === "super_admin" ? (
            <>
              <li>Manage All Departments</li>
              <li>Approve Deletes</li>
              <li>Edit/Delete Any Content</li>
            </>
          ) : (
            <>
              <li>Manage your Department: {userData.department}</li>
              <li>Upload or Edit Content</li>
              <li>Delete requires Super Admin Approval</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
