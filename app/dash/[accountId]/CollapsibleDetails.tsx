'use client';

import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export function CollapsibleDetails({ 
  envelope
}: { 
  envelope: any
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <span>Additional Details</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="pt-2 pb-3 text-sm text-gray-600 space-y-2">
          {envelope?.briefDescription && (
            <div>
              <p className="font-medium">Description</p>
              <p className="mt-1">{envelope.briefDescription}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="font-medium">Document Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  envelope?.isProcessed ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span>
                  {envelope?.isProcessed ? 'Processed' : 'Processing Pending'}
                </span>
              </div>
            </div>
            {envelope?.isFundingDocument && (
              <div>
                <p className="font-medium">Document Type</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span>Funding Document</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie";
import { db } from "@/drizzle/db-config";
import { accounts, monitoredEnvelopes } from "@/drizzle/schema";
import { LANDING_ROUTE } from "@/routes.config";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getEnvelopes } from "./envelopes.server";

