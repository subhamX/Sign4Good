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

import { db } from '@/drizzle/db-config';
import { accounts, monitoredEnvelopes, complianceForms } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { Trophy, DollarSign, FileCheck, Clock, Heart } from 'lucide-react';

type LeaderboardEntry = {
  accountId: string;
  name: string;
  totalFunding: number;
  fundingDocuments: number;
  complianceForms: number;
  onTimeComplianceForms: number;
  score: number;
  donationLink: string;
};

async function calculateLeaderboardData(): Promise<LeaderboardEntry[]> {
  const eligibleAccounts = await db
    .select({
      docuSignAccountId: accounts.docuSignAccountId,
      docuSignAccountName: accounts.docuSignAccountName,
      donationLink: accounts.donationLink,
    })
    .from(accounts)
    .where(eq(accounts.includeInLeaderBoard, true));

  const leaderboardData = await Promise.all(
    eligibleAccounts.map(async (account) => {
      const fundingData = await db
        .select({
          totalFunding: sql<number>`COALESCE(sum(${monitoredEnvelopes.moneyReceivedTillDate}), 0)`,
          documentCount: sql<number>`count(*)`
        })
        .from(monitoredEnvelopes)
        .where(eq(monitoredEnvelopes.accountId, account.docuSignAccountId));

      const complianceData = await db
        .select({
          totalForms: sql<number>`count(*)`,
          onTimeForms: sql<number>`sum(case when ${complianceForms.filledByComplianceOfficerAt} <= ${complianceForms.dueDate} then 1 else 0 end)`
        })
        .from(complianceForms)
        .innerJoin(
          monitoredEnvelopes,
          eq(complianceForms.envelopeId, monitoredEnvelopes.envelopeId)
        )
        .where(eq(monitoredEnvelopes.accountId, account.docuSignAccountId));

      const score = complianceData[0].totalForms > 0
        ? Math.round((complianceData[0].onTimeForms / complianceData[0].totalForms) * 10000) / 100
        : 0;

      return {
        accountId: account.docuSignAccountId,
        name: account.docuSignAccountName,
        donationLink: account.donationLink,
        totalFunding: Number(fundingData[0].totalFunding),
        fundingDocuments: Number(fundingData[0].documentCount),
        complianceForms: Number(complianceData[0].totalForms),
        onTimeComplianceForms: Number(complianceData[0].onTimeForms),
        score
      };
    })
  );

  return leaderboardData.sort((a, b) => b.score - a.score);
}

export default async function LeaderboardPage() {
  const leaderboardData = await calculateLeaderboardData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="relative mb-16">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 -z-10" />
        <div className="text-center space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full px-4 py-1 text-base 
              bg-background/50 backdrop-blur-sm border border-primary/20 font-medium">
              🌟 NGO Leaderboard
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
              Making Impact Transparent
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tracking excellence in compliance, funding, and social impact across our NGO partners
            </p>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary via-primary/50 to-transparent mx-auto rounded-full" />
          </div>

          {/* Donation Section */}
          <div className="max-w-md mx-auto bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-primary/10">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Heart className="w-5 h-5" />
                <h3 className="font-semibold">Support Our Mission</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your contribution helps NGOs maintain transparency and achieve greater impact
              </p>

              <div className="flex justify-center gap-4">
                <a
                  href="https://www.paypal.com/donate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-6 py-2.5 bg-[#059940] hover:bg-[#03600c] 
                    text-white rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/174/174861.png"
                    alt="PayPal"
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Donate with PayPal</span>
                </a>

                <a
                  href="#leaderboard"
                  className="px-6 py-2.5 border border-primary/20 hover:bg-primary/5 
                    text-primary rounded-md transition-colors"
                >
                  View Rankings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/10 hover:border-primary/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Top Score</h3>
          </div>
          <p className="text-2xl font-bold">{leaderboardData[0]?.score || 0}%</p>
          <p className="text-sm text-muted-foreground">{leaderboardData[0]?.name || 'No data'}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/10 hover:border-primary/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Total Funding</h3>
          </div>
          <p className="text-2xl font-bold">
            ${leaderboardData.reduce((sum, org) => sum + org.totalFunding, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Across all NGOs</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/10 hover:border-primary/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Total Documents</h3>
          </div>
          <p className="text-2xl font-bold">
            {leaderboardData.reduce((sum, org) => sum + org.fundingDocuments, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Funding documents tracked</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/10 hover:border-primary/20 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Compliance Rate</h3>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(leaderboardData.reduce((sum, org) => sum + org.onTimeComplianceForms, 0) / 
              Math.max(leaderboardData.reduce((sum, org) => sum + org.complianceForms, 0), 1) * 100)}%
          </p>
          <p className="text-sm text-muted-foreground">Average on-time rate</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow-lg border border-primary/10">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Organization</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Funding</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Documents</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20">
              {leaderboardData.map((entry, index) => (
                <tr key={entry.accountId} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                        ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                          index === 1 ? 'bg-gray-100 text-gray-800' : 
                          index === 2 ? 'bg-amber-100 text-amber-800' : 
                          'bg-muted/50 text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{entry.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-primary">{entry.score}%</div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-primary rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${entry.score}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${entry.totalFunding.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {entry.fundingDocuments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <span>{entry.onTimeComplianceForms}/{entry.complianceForms}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((entry.onTimeComplianceForms / Math.max(entry.complianceForms, 1)) * 100)}% on time)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a 
                      href={entry.donationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Donate</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}