import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
import { useReport } from '../hooks/useReport';
import type { CreateReportPayload } from '../types/report.types';

interface ReportButtonProps {
  reportedId: string;
  listingId?: string;
  children?: React.ReactNode;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ reportedId, listingId, children }) => {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    toast({ title: 'Report submitted', description: 'Thank you, we will review shortly.' });
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        {children || 'Report'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Reason</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Inappropriate behavior"
              />
            </div>
            <div>
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
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={!reason || loading}>
              {loading ? 'Submitting…' : 'Submit Report'}
            </Button>
          </DialogFooter>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
};
