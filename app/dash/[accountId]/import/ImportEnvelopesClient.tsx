'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeDocuSign } from '../envelopes.server';
import { Input } from '@/components/ui/input';
import { createEnvelopesServerAction } from '../createEnvelopes.server';
import { revalidatePath } from 'next/cache';
import { DASH_ACCOUNT_IMPORT_ROUTE } from '@/routes.config';
import { useToast } from '@/hooks/use-toast';

interface EnvelopeWithSettings {
  envelopeId: string;
  complianceOfficerEmail: string;
  monitoringFrequencyDays: number;
}

interface Props {
  envelopes: EnvelopeDocuSign[];
  accountId: string;
}

export default function ImportEnvelopesClient({ envelopes, accountId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedEnvelopes, setSelectedEnvelopes] = useState<Set<string>>(new Set());
  const [envelopeSettings, setEnvelopeSettings] = useState<Map<string, EnvelopeWithSettings>>(new Map(envelopes.map(envelope => [envelope.envelopeId, {
    envelopeId: envelope.envelopeId,
    complianceOfficerEmail: envelope.sender.email,
    monitoringFrequencyDays: 14,
  }])));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedEnvelopes.size === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one envelope",
        variant: "destructive",
      });
      return;
    }

    // Validate all selected envelopes have settings
    for (const envelopeId of selectedEnvelopes) {
      const settings = envelopeSettings.get(envelopeId);
      if (!settings?.complianceOfficerEmail) {
        toast({
          title: "Missing Information",
          description: "Please set compliance officer email for all selected envelopes",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      
      const response = await createEnvelopesServerAction({
        envelopes: Array.from(selectedEnvelopes).map(envelopeId => {
          const settings = envelopeSettings.get(envelopeId)!;
          return {
            envelopeId,
            complianceOfficerEmail: settings.complianceOfficerEmail,
            monitoringFrequencyDays: settings.monitoringFrequencyDays,
          };
        }),
        accountId,
      });

      if ('error' in response) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: response.message,
      });

      setSelectedEnvelopes(new Set());
    } catch (error) {
      console.error('Error importing envelopes:', error);
      toast({
        title: "Error",
        description: "Failed to import envelopes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEnvelopeSetting = (envelopeId: string, field: keyof EnvelopeWithSettings, value: string | number) => {
    setEnvelopeSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(envelopeId) || {
        envelopeId,
        complianceOfficerEmail: '',
        monitoringFrequencyDays: 14,
      };
      newSettings.set(envelopeId, { ...current, [field]: value });
      return newSettings;
    });
  };

  return (
    <div className='mx-auto max-w-4xl'>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select Documents for Compliance Monitoring</h2>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedEnvelopes.size === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Importing...' : `Import ${selectedEnvelopes.size} Selected`}
        </button>
      </div>

      <div className="grid gap-4">
        {!envelopes || envelopes.length === 0 ? (
          <div className="bg-white p-4 rounded shadow text-center text-gray-600">
            No documents available for import. Note, you need to be an Admin of the Docusign Org to import documents..
          </div>
        ) : (
          envelopes.map((envelope) => {
            const settings = envelopeSettings.get(envelope.envelopeId);
            const isSelected = selectedEnvelopes.has(envelope.envelopeId);

            return (
              <div key={envelope.envelopeId} className={`bg-white p-4 rounded shadow transition-all ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelected = new Set(selectedEnvelopes);
                        if (e.target.checked) {
                          newSelected.add(envelope.envelopeId);
                        } else {
                          newSelected.delete(envelope.envelopeId);
                        }
                        setSelectedEnvelopes(newSelected);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{envelope.emailSubject || 'Untitled Document'}</p>
                      <p className="text-sm text-gray-600">ID: {envelope.envelopeId}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${envelope.status === 'completed' ? 'bg-green-100 text-green-800' :
                      envelope.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {envelope.status}
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-4 pl-8 space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Compliance Officer Email
                      </label>
                      <Input
                        type="email"
                        value={settings?.complianceOfficerEmail || ''}
                        onChange={(e) => updateEnvelopeSetting(envelope.envelopeId, 'complianceOfficerEmail', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Review Frequency (days)
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={settings?.monitoringFrequencyDays || 14}
                          onChange={(e) => updateEnvelopeSetting(envelope.envelopeId, 'monitoringFrequencyDays', parseInt(e.target.value))}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Urgent deadlines will be communicated separately, regardless of this review frequency.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <p><strong>Created:</strong> {new Date(envelope.createdDateTime).toLocaleString()}</p>
                  {envelope.sentDateTime && (
                    <p><strong>Sent:</strong> {new Date(envelope.sentDateTime).toLocaleString()}</p>
                  )}
                  {envelope.completedDateTime && (
                    <p><strong>Completed:</strong> {new Date(envelope.completedDateTime).toLocaleString()}</p>
                  )}
                  {envelope.sender && (
                    <p><strong>Sender:</strong> {envelope.sender.email}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 