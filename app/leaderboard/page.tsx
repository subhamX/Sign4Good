// 'use client';

// import { useEffect, useState } from 'react';
// import { db } from '@/drizzle/config';
// import { users, donations, forms } from '@/drizzle/schema';
// import { eq } from 'drizzle-orm';

// type LeaderboardEntry = {
//   userId: number;
//   name: string;
//   totalDonations: number;
//   completedForms: number;
// };

// export default function LeaderboardPage() {
//   const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLeaderboardData = async () => {
//       try {
//         // Get all users
//         const allUsers = await db.query.users.findMany();

//         // Get donations and forms data for each user
//         const leaderboardEntries = await Promise.all(
//           allUsers.map(async (user) => {
//             const userDonations = await db.query.donations.findMany({
//               where: eq(donations.userId, user.id)
//             });

//             const userForms = await db.query.forms.findMany({
//               where: eq(forms.userId, user.id)
//             });

//             const totalDonations = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
//             const completedForms = userForms.filter(form => form.status === 'completed').length;

//             return {
//               userId: user.id,
//               name: user.name,
//               totalDonations,
//               completedForms
//             };
//           })
//         );

//         // Sort by total donations (descending)
//         const sortedData = leaderboardEntries.sort((a, b) => b.totalDonations - a.totalDonations);
//         setLeaderboardData(sortedData);
//       } catch (error) {
//         console.error('Error fetching leaderboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaderboardData();
//   }, []);

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Non-Profit Leaderboard</h1>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donations</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Forms</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {leaderboardData.map((entry, index) => (
//               <tr key={entry.userId}>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.name}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.totalDonations.toLocaleString()}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.completedForms}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

export default function LeaderboardPage() {
  return <div>Leaderboard</div>;
}