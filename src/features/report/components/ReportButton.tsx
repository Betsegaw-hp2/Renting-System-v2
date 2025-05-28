import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
import { useReport } from '../hooks/useReport';
import type { CreateReportPayload } from '../types/report.types';

interface ReportButtonProps  extends React.ComponentProps<typeof Button> {
  reportedId: string;
  listingId?: string;
  children?: React.ReactNode;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ reportedId, listingId, children, ...props }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const { submit, loading, error } = useReport();
  const { toast } = useToast();

  const handleSubmit = () => {
    const payload: CreateReportPayload = {
      reported_id: reportedId,
      reason,
      description: description || undefined,
      listing_id: listingId,
    };

    submit(payload);
    setIsSubmitted(true);
    toast({ title: 'Report submitted', description: 'Thank you, we will review shortly.' });
  };

    const resetForm = () => {
    setReason('');
    setDescription('');
    setIsSubmitted(false);
    setOpen(false);
  };

  return (
    <>
      <Button {...props} onClick={() => setOpen(true)}>
        {children || 'Report'}
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        else setOpen(isOpen);
      }}>
        <DialogContent aria-describedby='report-dialog-description' aria-description={description} className="max-w-lg">
          <DialogHeader>
           <DialogTitle>
              {isSubmitted ? 'Report Submitted' : 'Report User'}
            </DialogTitle>
          </DialogHeader>
          {isSubmitted ? (
            <>
              <DialogDescription id='report-dialog-description'>
                Your report has been successfully submitted. We appreciate your help in keeping our community safe.
              </DialogDescription>
              <div className="space-y-4 p-4">
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-lg font-medium">Thank you for your report</h3>
                  <p className="text-gray-600 mt-2">
                    We've received your report and will review it shortly.
                  </p>
                </div>
                <DialogFooter className="mt-4">
                  <Button className="w-full" onClick={resetForm}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </>
          ) : (
            <>
              <DialogDescription>
                Please provide a reason for reporting this user. Your report will be reviewed by our team.
              </DialogDescription>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Reason</label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Inappropriate behavior"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details..."
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleSubmit} 
                  disabled={!reason || loading}
                >
                  {loading ? 'Submitting…' : 'Submit Report'}
                </Button>
              </DialogFooter>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
