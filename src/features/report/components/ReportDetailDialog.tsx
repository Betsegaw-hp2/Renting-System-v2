
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/DateUtils";
import { CheckCircle, Clock, ExternalLinkIcon, FileTextIcon, HomeIcon, InfoIcon, Trash, UsersIcon, XCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Report, ReportStatus } from "../types/report.types";
import { getStatusBadge } from "./AdminReport";
import { UserCompactCard } from "./UserCompactCard";

export const ReportDialog = ({ 
  isOpen,
  onClose,
  selected,
  loading,
  onStatusChange,
  onDelete
}: {
  isOpen: boolean;
  onClose: () => void;
  selected?: Report;
  loading: boolean;
  onStatusChange: (status: ReportStatus) => Promise<void>;
  onDelete: () => Promise<void>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleStatusAction = async (status: ReportStatus) => {
    try {
      await onStatusChange(status);
      toast({ title: "Success", description: `Report marked as ${status.replace('_', ' ')}` });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg">Report Details</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>ID: <code className="text-xs">{selected?.id}</code></span>
            {getStatusBadge(selected?.status ?? "open", selected ?? null)}
          </DialogDescription>
        </DialogHeader>

        {loading && !selected ? (
          <div className="flex-1 overflow-y-auto px-1 py-4">
            <div className="space-y-4">
              <div className="grid w-full grid-cols-2 gap-2 mb-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              </div>
            </div>
          </div>
        ) : selected ? (
          <div className="flex-1 overflow-y-auto px-1 py-4">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Metadata Column */}
                  <div className="space-y-4">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <InfoIcon className="h-5 w-5 text-muted-foreground" />
                          Report Metadata
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-background">
                          <div className="col-span-1 text-muted-foreground">Reason</div>
                          <div className="col-span-2 font-medium capitalize">
                            {selected.reason}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-background">
                          <div className="col-span-1 text-muted-foreground">Created</div>
                          <div className="col-span-2 font-medium">
                            {formatDate(selected.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <UsersIcon className="h-5 w-5 text-muted-foreground" />
                          Involved Parties
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <UserCompactCard userId={selected.reporter_id} label="Reporter" />
                        <UserCompactCard userId={selected.reported_id} label="Reported" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Context Column */}
                  <div className="space-y-4">
                    {selected?.listing_id && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <HomeIcon className="h-5 w-5 text-muted-foreground" />
                            Related Listing
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Link
                            to={`/listings/${selected.listing_id}`}
                            className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors"
                          >
                            <ExternalLinkIcon className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Listing #{selected.listing_id}</p>
                              <p className="text-sm text-muted-foreground">View details</p>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="h-[300px]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                          Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(300px-65px)] overflow-y-auto">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {selected.description ? (
                            <pre className="whitespace-pre-wrap font-sans">
                              {selected.description}
                            </pre>
                          ) : (
                            <p className="text-muted-foreground italic">No description provided</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Actions</CardTitle>
                    <CardDescription>Update report status or resolution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selected.status === 'open' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusAction('under_review')}
                          disabled={isDeleting || loading}  
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {loading ? "Processing..." : "Mark Under Review"}
                        </Button>
                      )}

                      {(selected.status === 'open' || selected.status === 'under_review') && (
                        <>
                          <Button
                            variant="default"
                            onClick={() => handleStatusAction('resolved')}
                            disabled={isDeleting || loading}  // Add loading state
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {loading ? "Processing..." : "Resolve Report"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusAction('dismissed')}
                            disabled={isDeleting || loading} 
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {loading ? "Processing..." : "Dismiss Report"}
                          </Button>
                        </>
                      )}

                      <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isDeleting || loading}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {isDeleting ? "Deleting..." : "Delete Report"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground">Select a report to view details</p>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};