'use client';

import React, { useState } from 'react';
import { FileCheck, Upload, Check, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StepCard } from './step-card';
import { cn } from '@/lib/utils';

export interface DocumentItem {
  id: string;
  title: string;
  subtitle: string;
  uploaded: boolean;
  fileFormatHint: string;
}

export interface StepDocumentsProps {
  documents?: DocumentItem[];
  onChange?: (documents: DocumentItem[]) => void;
  className?: string;
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'id-proof',
    title: 'ID Proof',
    subtitle: 'Aadhaar Card or PAN Card',
    uploaded: true, // Pre-verified through mock KYC
    fileFormatHint: 'PDF, JPG up to 5MB',
  },
  {
    id: 'income-proof',
    title: 'Income Proof',
    subtitle: 'Latest 3 months salary slips or bank statements',
    uploaded: false,
    fileFormatHint: 'PDF up to 10MB',
  },
  {
    id: 'address-proof',
    title: 'Address Proof',
    subtitle: 'Electricity bill, Rent Agreement, or Voter ID',
    uploaded: false,
    fileFormatHint: 'PDF, JPG, PNG',
  },
];

/**
 * Step 5 — Upload Documents
 * Interactive checklist for compliance documents with simulated upload action.
 */
export function StepDocuments({
  documents: initialDocuments,
  onChange,
  className,
}: StepDocumentsProps) {
  const [docs, setDocs] = useState<DocumentItem[]>(
    initialDocuments ?? DEFAULT_DOCUMENTS
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const toggleDocumentUpload = (id: string) => {
    // If already uploaded, toggle off or simulate re-upload
    const currentDoc = docs.find((d) => d.id === id);
    if (!currentDoc) return;

    if (currentDoc.uploaded) {
      const updated = docs.map((d) =>
        d.id === id ? { ...d, uploaded: false } : d
      );
      setDocs(updated);
      onChange?.(updated);
      return;
    }

    // Simulate quick upload with loading
    setUploadingId(id);
    setTimeout(() => {
      setDocs((prev) => {
        const next = prev.map((d) =>
          d.id === id ? { ...d, uploaded: true } : d
        );
        onChange?.(next);
        return next;
      });
      setUploadingId(null);
    }, 600);
  };

  const allUploaded = docs.every((d) => d.uploaded);
  const uploadedCount = docs.filter((d) => d.uploaded).length;

  return (
    <StepCard
      stepInfo="Step 5 of 6"
      title="Documents needed"
      description="Upload digital copies or verify via DigiLocker. Minimal documentation for paperless sanction."
      className={className}
    >
      <div className="space-y-3">
        {/* Progress pill indicator */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="font-light text-saarthi-text-secondary">
            {uploadedCount} of {docs.length} documents ready
          </span>
          {allUploaded && (
            <span className="text-[11px] font-light text-saarthi-healthy flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All documents verified
            </span>
          )}
        </div>

        {/* Documents Checklist */}
        <div className="space-y-2.5">
          {docs.map((doc) => {
            const isUploading = uploadingId === doc.id;

            return (
              <div
                key={doc.id}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-lg border transition-all duration-150',
                  'bg-saarthi-elevated',
                  doc.uploaded
                    ? 'border-saarthi-healthy/30 bg-saarthi-healthy/[0.02]'
                    : 'border-saarthi-border-subtle hover:border-saarthi-border-active'
                )}
              >
                {/* Left side: status icon & document info */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      doc.uploaded
                        ? 'bg-saarthi-healthy/20 text-saarthi-healthy'
                        : 'bg-saarthi-card text-saarthi-text-muted border border-saarthi-border-subtle'
                    )}
                  >
                    {doc.uploaded ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <FileText className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-normal text-saarthi-text-primary truncate">
                        {doc.title}
                      </h4>
                      {doc.uploaded && (
                        <span className="text-[10px] text-saarthi-healthy font-light bg-saarthi-healthy/10 px-1.5 py-0.2 rounded border border-saarthi-healthy/20">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-light text-saarthi-text-muted truncate">
                      {doc.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right side: Simulated Upload Button */}
                <div className="shrink-0">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => toggleDocumentUpload(doc.id)}
                    className={cn(
                      'btn-outline text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-normal',
                      doc.uploaded
                        ? 'border-saarthi-border-subtle text-saarthi-text-secondary hover:text-saarthi-stressed hover:border-saarthi-stressed/30 bg-saarthi-card'
                        : 'border-saarthi-border-subtle hover:border-saarthi-healthy text-saarthi-text-primary hover:text-saarthi-healthy bg-saarthi-card hover:bg-saarthi-healthy/5'
                    )}
                  >
                    {isUploading ? (
                      <>
                        <span className="w-3 h-3 rounded-full border border-saarthi-healthy border-t-transparent animate-spin" />
                        Uploading...
                      </>
                    ) : doc.uploaded ? (
                      <>
                        <FileCheck className="w-3.5 h-3.5 text-saarthi-healthy" />
                        Replace
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / DigiLocker assurance note */}
        <div className="flex items-center gap-2 pt-2 px-1 text-[11px] font-light text-saarthi-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-saarthi-healthy shrink-0" />
          <span>256-bit encrypted storage. Documents are used solely for RBI underwriting.</span>
        </div>
      </div>
    </StepCard>
  );
}

export default StepDocuments;
