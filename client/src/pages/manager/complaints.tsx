import { useQuery, useMutation } from "@tanstack/react-query";
import type { Complaint, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MessageSquareWarning, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManagerComplaints() {
  const { toast } = useToast();

  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const { data: employees } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/complaints/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({ title: "Complaint status updated" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update complaint",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find((e) => e.id === employeeId);
    return employee?.name || "Unknown Employee";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-chart-5" />;
      case "in_review":
        return <Clock className="h-4 w-4 text-chart-4" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-chart-5/10 text-chart-5 border-chart-5/20">Resolved</Badge>;
      case "in_review":
        return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">In Review</Badge>;
      default:
        return <Badge variant="destructive">Open</Badge>;
    }
  };

  const openComplaints = complaints?.filter((c) => c.status === "open") || [];
  const inReviewComplaints = complaints?.filter((c) => c.status === "in_review") || [];
  const resolvedComplaints = complaints?.filter((c) => c.status === "resolved") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Complaints
        </h1>
        <p className="text-muted-foreground">
          Review and resolve employee complaints
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-open-count">
              {openComplaints.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-review-count">
              {inReviewComplaints.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-chart-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-resolved-count">
              {resolvedComplaints.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Complaints</CardTitle>
          <CardDescription>
            {complaints?.length || 0} total complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complaintsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : complaints?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquareWarning className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No complaints</h3>
              <p className="text-sm text-muted-foreground">
                Employees haven't submitted any complaints yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints?.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-4 rounded-lg border bg-card"
                  data-testid={`card-complaint-${complaint.id}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(complaint.status)}
                        <h3 className="font-medium">{complaint.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {getEmployeeName(complaint.employeeId)} •{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 mb-4">
                    {complaint.description}
                  </p>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <Select
                      value={complaint.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: complaint.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[160px]" data-testid={`select-status-${complaint.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Open
                          </div>
                        </SelectItem>
                        <SelectItem value="in_review">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            In Review
                          </div>
                        </SelectItem>
                        <SelectItem value="resolved">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Resolved
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {updateStatusMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
