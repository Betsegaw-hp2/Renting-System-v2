import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/api/adminApi";
import { AdminLayout } from "@/features/admin/components/layout/AdminLayout";
import type { User, UserKYC } from "@/types/user.types";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ExtendedUserKYC extends UserKYC {
  user?: User;
}

const AllKycPage: React.FC = () => {
  const [kycRecords, setKycRecords] = useState<ExtendedUserKYC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchKycRecords = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const offset = (page - 1) * pageSize;
        const response = await adminApi.getAllUserKyc({ limit: pageSize, offset });

        const recordsWithUserDetails = await Promise.all(
          response.records.map(async (kycRecord) => {
            try {
              const user = await adminApi.getUser(kycRecord.user_id);
              return { ...kycRecord, user };
            } catch (userError) {
              console.error(`Failed to fetch user ${kycRecord.user_id}`, userError);
              return { ...kycRecord, user: undefined };
            }
          })
        );

        setKycRecords(recordsWithUserDetails);
        setTotalRecords(response.totalRecords);
      } catch (err) {
        console.error("Error fetching KYC records:", err);
        setError("Failed to fetch KYC records. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchKycRecords(currentPage);
  }, [currentPage, fetchKycRecords]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  if (isLoading && kycRecords.length === 0) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  const endItem = Math.min(currentPage * pageSize, totalRecords);
  const startItem = Math.max(1, (currentPage - 1) * pageSize + 1);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>KYC Management</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && kycRecords.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {kycRecords.length === 0 && !isLoading ? (
              <p>No KYC records found.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Record ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycRecords.map((kyc) => (
                      <TableRow key={kyc.id}>
                        <TableCell>{kyc.id}</TableCell>
                        <TableCell>
                          {kyc.user ? (
                            <div>
                              <Link to={`/admin/users/${kyc.user_id}`} className="text-blue-600 hover:underline font-medium">
                                {kyc.user.first_name} {kyc.user.last_name}
                              </Link>
                              <div className="text-sm text-muted-foreground">{kyc.user.email}</div>
                            </div>
                          ) : (
                            kyc.user_id
                          )}
                        </TableCell>
                        <TableCell>
                          {kyc.user ? (
                            <Badge variant={kyc.user.kyc_verified ? "default" : "outline"}>
                              {kyc.user.kyc_verified ? "Verified" : "Pending"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Unknown</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(kyc.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/users/${kyc.user_id}`}>View Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {totalRecords > 0 ? (
                      `Showing ${startItem} - ${endItem} of ${totalRecords} records`
                    ) : (
                      "No records found"
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => handlePageSizeChange(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder={pageSize.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AllKycPage;
