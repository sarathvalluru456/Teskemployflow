import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertComplaintSchema } from "@shared/schema";
import type { z } from "zod";
import type { Complaint } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquareWarning, CheckCircle2, Clock, AlertCircle, Send } from "lucide-react";

type ComplaintFormValues = z.infer<typeof insertComplaintSchema>;

export default function EmployeeComplaints() {
  const { toast } = useToast();

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/my-complaints"],
  });

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ComplaintFormValues) => {
      const response = await apiRequest("POST", "/api/complaints", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-complaints"] });
      toast({ title: "Complaint submitted successfully" });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit complaint",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ComplaintFormValues) => {
    createMutation.mutate(data);
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

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Submit Complaint
        </h1>
        <p className="text-muted-foreground">
          Report issues or concerns to management
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Complaint</CardTitle>
            <CardDescription>
              Describe your issue in detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief summary of the issue"
                          data-testid="input-complaint-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about your complaint..."
                          className="min-h-[150px]"
                          data-testid="input-complaint-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-complaint"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Complaints</CardTitle>
            <CardDescription>
              Track the status of your submitted complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : complaints?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquareWarning className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  You haven't submitted any complaints yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints?.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-3 rounded-lg border bg-muted/30"
                    data-testid={`card-complaint-${complaint.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getStatusIcon(complaint.status)}
                        <span className="font-medium text-sm truncate">
                          {complaint.title}
                        </span>
                      </div>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {complaint.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
