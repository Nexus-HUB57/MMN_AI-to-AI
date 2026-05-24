import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AgentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedStatus, setEditedStatus] = useState<"learning" | "active" | "paused" | "inactive">("learning");

  // Initialize agent on component mount
  const { mutate: initializeAgent } = trpc.agents.initialize.useMutation({
    onSuccess: () => {
      refetchAgent();
    },
    onError: () => {
      toast.error("Failed to initialize agent");
    },
  });

  // Get agent data
  const { data: agent, isLoading: agentLoading, refetch: refetchAgent } = trpc.agents.get.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  // Configure agent mutation
  const { mutate: configureAgent, isPending: isConfiguring } = trpc.agents.configure.useMutation({
    onSuccess: (result) => {
      toast.success("Agent updated successfully");
      setIsEditing(false);
      refetchAgent();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update agent");
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to access the agent dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Your Agent</CardTitle>
            <CardDescription>Create your AI agent to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => initializeAgent()} className="w-full">
              Create Agent
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    configureAgent({
      name: editedName || agent.name,
      status: editedStatus,
    });
  };

  const statusColors = {
    learning: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6">
        {/* Agent Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{agent.name}</CardTitle>
                <CardDescription>AI Agent Configuration</CardDescription>
              </div>
              <Badge className={statusColors[agent.status as keyof typeof statusColors]}>
                {agent.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Agent ID</Label>
                <p className="font-mono text-sm">{agent.id}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Performance Score</Label>
                <p className="text-2xl font-bold">{agent.performanceScore}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Created</Label>
                <p className="text-sm">{new Date(agent.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Last Updated</Label>
                <p className="text-sm">{new Date(agent.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Agent Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Agent Configuration</CardTitle>
            <CardDescription>Update your agent's name, status, and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={editedName || agent.name}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-status">Status</Label>
                  <Select value={editedStatus} onValueChange={(value: any) => setEditedStatus(value)}>
                    <SelectTrigger id="agent-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isConfiguring} className="flex-1">
                    {isConfiguring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Agent Name</Label>
                  <p className="text-lg font-medium">{agent.name}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Current Status</Label>
                  <Badge className={statusColors[agent.status as keyof typeof statusColors]}>
                    {agent.status}
                  </Badge>
                </div>

                <Button onClick={() => {
                  setEditedName(agent.name);
                  setEditedStatus(agent.status);
                  setIsEditing(true);
                }} className="w-full">
                  Edit Configuration
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Strategy Card */}
        <Card>
          <CardHeader>
            <CardTitle>Content Strategy</CardTitle>
            <CardDescription>Current AI agent content preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {agent.contentStrategy ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(agent.contentStrategy.platforms || []).map((platform: string) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Posting Frequency</Label>
                  <p className="text-sm capitalize">{agent.contentStrategy.postingFrequency}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Tone</Label>
                  <p className="text-sm capitalize">{agent.contentStrategy.tone}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Target Audience</Label>
                  <p className="text-sm">{agent.contentStrategy.targetAudience}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">No content strategy configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
